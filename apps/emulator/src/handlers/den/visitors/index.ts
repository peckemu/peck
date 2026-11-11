import { inject, injectable } from '@needle-di/core'
import { ClusterEvents, type DenEvent } from '@peck/cluster'
import { type Room, RoomManager } from '@peck/game'
import { type Logger } from '@peck/logger'
import { DenVisitorsOutgoing } from '@peck/packets'
import { type PacketSession, PluginEvents } from '@peck/plugins'

import { SessionManager } from '#emulator/sessions/manager'
import { LoggerToken } from '#emulator/tokens'

/**
 * The events this listens for
 */
const EVENTS: ReadonlySet<string> = new Set(['den-visitor'])

/**
 * Tells den owners who comes and goes
 * @class
 */
@injectable()
export class DenVisitors {
  /**
   * Every room and its instances
   */
  private readonly rooms = inject<RoomManager>(RoomManager)

  /**
   * Every open session
   */
  private readonly sessions = inject<SessionManager>(SessionManager)

  /**
   * Events between nodes
   */
  private readonly events = inject<ClusterEvents<DenEvent>>(ClusterEvents)

  /**
   * The plugin events
   */
  private readonly plugins = inject<PluginEvents>(PluginEvents)

  /**
   * The logger
   */
  private readonly logger = inject<Logger>(LoggerToken)

  /**
   * The open dens' owners by room id
   */
  private readonly owners = new Map<number, number>()

  /**
   * Starts listening
   */
  public async start(): Promise<void> {
    await this.events.listen((event) => {
      if (!EVENTS.has(event.type)) return

      void this.receive(event).catch((error: unknown) => {
        this.logger.warn({ err: error, type: event.type }, 'den event failed')
      })
    })

    this.plugins.on('join', (session, roomId) => this.entered(session, roomId))
    this.plugins.on('leave', (session, roomId) => this.left(session, roomId))
  }

  /**
   * Tells the owner someone came in
   * @param session The visitor's session
   * @param roomId The room they joined
   */
  private async entered(session: PacketSession, roomId: number): Promise<void> {
    const { player } = session
    const room = this.rooms.get(roomId)
    const owner = room?.template.den?.ownerGameId
    if (!player || player.invisible || !room || owner === undefined) return

    this.owners.set(roomId, owner)

    await this.events.publish({
      type: 'den-visitor',
      to: owner,
      count: DenVisitors.count(room),
      entering: true,
      username: player.username,
    })
  }

  /**
   * Tells the owner someone left
   * @param session The visitor's session
   * @param roomId The room they left
   */
  private async left(session: PacketSession, roomId: number): Promise<void> {
    const { player } = session
    const owner = this.owners.get(roomId)
    const room = this.rooms.get(roomId)
    if (!room) this.owners.delete(roomId)
    if (!player || player.invisible || owner === undefined) return

    await this.events.publish({
      type: 'den-visitor',
      to: owner,
      count: room ? DenVisitors.count(room) : 0,
      entering: false,
      username: player.username,
    })
  }

  /**
   * Tells an owner on this node
   * @param event The news
   */
  private async receive(event: DenEvent): Promise<void> {
    const session = this.sessions.byPlayer(event.to)
    if (!session) return

    await session.send<DenVisitorsOutgoing>(
      event.entering
        ? DenVisitorsOutgoing.entered(event.count, event.username)
        : DenVisitorsOutgoing.left(event.count, event.username),
    )
  }

  /**
   * Counts who can be seen in a den
   * @param room The den
   * @returns How many
   */
  private static count(room: Room): number {
    return room.players.filter((player) => !player.invisible).length
  }
}
