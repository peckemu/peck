import { inject, injectable } from '@needle-di/core'
import { RoomManager } from '@peck/game'
import { type PacketSessions, PluginEvents } from '@peck/plugins'
import {
  AvatarJoinedOutgoing,
  AvatarLeftOutgoing,
  ItemListOutgoing,
} from '@peck/packets'
import { type OutgoingPacket } from '@peck/protocol'
import { type Logger } from '@peck/logger'

import { Session } from '#emulator/sessions/session'
import { type Transport } from '#emulator/network/transport'
import { LoggerToken } from '#emulator/tokens'

/**
 * Every open session
 * @class
 */
@injectable()
export class SessionManager implements PacketSessions {
  /**
   * The sessions by id
   */
  private readonly sessions = new Map<number, Session>()

  /**
   * The logger
   */
  private readonly logger = inject<Logger>(LoggerToken)

  /**
   * Every room and its instances
   */
  private readonly rooms = inject<RoomManager>(RoomManager)

  /**
   * The plugin events
   */
  private readonly events = inject<PluginEvents>(PluginEvents)

  /**
   * The next session id
   */
  private nextId = 1

  /**
   * The number of logged in players
   */
  public get players(): number {
    let count = 0
    for (const session of this.sessions.values()) if (session.player) count++

    return count
  }

  /**
   * The number of open sessions
   */
  public get size(): number {
    return this.sessions.size
  }

  /**
   * Opens a session on a connection
   * @param transport The connection
   * @returns The new session
   */
  public open(transport: Transport): Session {
    const id = this.nextId++
    const session = new Session(
      id,
      transport,
      this.logger.child({ session: id }),
    )
    this.sessions.set(session.id, session)
    return session
  }

  /**
   * Removes a closed session
   * @param session The session
   */
  public remove(session: Session): void {
    this.sessions.delete(session.id)
    if (!session.player) return

    void this.leave(session).then(() => this.events.emit('logout', session))
  }

  /**
   * Takes a player out of their room
   * @param session The player's session
   * @returns Once the room is told
   */
  public async leave(session: Session): Promise<void> {
    const { player } = session
    if (!player?.room) return

    const roomId = player.roomId
    this.rooms.leave(player)

    await this.hide(session, roomId)
    await this.events.emit('leave', session, roomId)
  }

  /**
   * Finishes a move into a new room
   * @param session The player's session
   * @param from Their old room, or -1
   * @returns Once the old room is told
   */
  public async arrive(session: Session, from: number): Promise<void> {
    const { player } = session
    if (!player) return

    await this.hide(session, from)
    if (from === player.roomId) return

    if (from !== -1) await this.events.emit('leave', session, from)
    await this.events.emit('join', session, player.roomId)
  }

  /**
   * Shows a player in their room
   * @param session The player's session
   * @returns Once they are all sent
   */
  public async introduce(session: Session): Promise<void> {
    const roomId = session.player?.roomId ?? -1

    for (const other of this.inRoom(roomId)) {
      const { player } = other
      if (other === session || !player?.shown || !player.avatar) continue

      const { avatar } = player

      const pet = player.petOut(player.room?.template.enviroType === 1)

      await session.send<AvatarJoinedOutgoing>(
        AvatarJoinedOutgoing.of(roomId, player, avatar, pet),
      )
      await session.send<ItemListOutgoing>(
        ItemListOutgoing.worn(roomId, player, avatar, player.worn(avatar)),
      )
    }
  }

  /**
   * Shows a player to their room
   * @param session The player's session
   * @returns Once the room is told
   */
  public async show(session: Session): Promise<void> {
    const { player } = session
    if (!player?.avatar || player.shown || player.invisible) return

    const { avatar, roomId } = player
    player.shown = true

    const pet = player.petOut(player.room?.template.enviroType === 1)
    const joined = AvatarJoinedOutgoing.of(roomId, player, avatar, pet)
    const worn = ItemListOutgoing.worn(
      roomId,
      player,
      avatar,
      player.worn(avatar),
    )

    await this.broadcast<AvatarJoinedOutgoing>(roomId, joined, session)
    await this.broadcast<ItemListOutgoing>(roomId, worn, session)
  }

  /**
   * Tells a room a player has gone
   * @param session The player's session
   * @param roomId The room to tell
   * @returns Once the room is told
   */
  public async hide(session: Session, roomId?: number): Promise<void> {
    const { player } = session
    if (!player?.shown) return

    player.shown = false

    const room = roomId ?? player.roomId
    await this.broadcast<AvatarLeftOutgoing>(
      room,
      AvatarLeftOutgoing.of(room, player.id),
      session,
    )
  }

  /**
   * Finds a session by username
   * @param username The player's username
   * @returns The session, or null
   */
  public byUsername(username: string): Session | null {
    const wanted = username.toLowerCase()

    for (const session of this.sessions.values()) {
      if (session.player?.username.toLowerCase() === wanted) return session
    }

    return null
  }

  /**
   * Finds a session by id
   * @param id The session id
   * @returns The session, or null
   */
  public get(id: number): Session | null {
    return this.sessions.get(id) ?? null
  }

  /**
   * Finds a player's session
   * @param gameId The player's id in the database
   * @returns The session, or null
   */
  public byPlayer(gameId: number): Session | null {
    for (const session of this.sessions.values()) {
      if (session.player?.gameId === gameId) return session
    }
    return null
  }

  /**
   * Finds an account's sessions
   * @param accountId The account
   * @returns The sessions
   */
  public byAccount(accountId: string): Session[] {
    return [...this.sessions.values()].filter(
      (session) => session.player?.accountId === accountId,
    )
  }

  /**
   * Lists the sessions in a room
   * @param roomId The room id
   * @returns The sessions in it
   */
  public inRoom(roomId: number): Session[] {
    return [...this.sessions.values()].filter(
      (session) => session.player?.roomId === roomId,
    )
  }

  /**
   * Sends a packet to a room
   * @param roomId The room id
   * @param packet The packet
   * @param except A session to leave out
   * @returns Once sent
   */
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters -- names the packet sent
  public async broadcast<T extends OutgoingPacket>(
    roomId: number,
    packet: T,
    except?: Session,
  ): Promise<void> {
    const frame = packet.toString()
    const sends = this.inRoom(roomId)
      .filter((session) => session !== except)
      .map((session) => session.write(frame))
    await Promise.allSettled(sends)
  }

  /**
   * Iterates over the open sessions
   * @returns The iterator
   */
  public [Symbol.iterator](): Iterator<Session> {
    return this.sessions.values()
  }
}
