import { type PacketRoom, type RoomSendOptions } from '@peck/plugins'
import {
  type OutgoingPacket,
  type PacketArgs,
  PacketFactory,
  type PacketFields,
} from '@peck/protocol'

import { type Session } from '#emulator/sessions/session'
import { type SessionManager } from '#emulator/sessions/manager'

/**
 * The player's room
 * @class
 */
export class Room implements PacketRoom {
  /**
   * The room id
   */
  public readonly id: number

  /**
   * The acting player
   */
  private readonly self: Session

  /**
   * Every open session
   */
  private readonly sessions: SessionManager

  /**
   * Creates a view of the player's room
   * @param self The acting player
   * @param sessions Every open session
   */
  public constructor(self: Session, sessions: SessionManager) {
    this.id = self.player?.roomId ?? -1
    this.self = self
    this.sessions = sessions
  }

  /**
   * The sessions in the room
   */
  public get members(): Session[] {
    return this.sessions.inRoom(this.id)
  }

  /**
   * Sends a packet to the room
   * @param type The packet class
   * @param fields The packet's fields
   * @param options Who to leave out
   * @returns Once all are sent
   */
  public send<T extends OutgoingPacket>(
    type: new () => T,
    fields: PacketFields<T>,
    options: RoomSendOptions = {},
  ): Promise<void> {
    const packet = PacketFactory.create<T>(type, ...([fields] as PacketArgs<T>))
    return this.sessions.broadcast<T>(
      this.id,
      packet,
      options.exceptSelf ? this.self : undefined,
    )
  }
}
