import { type Player } from '@peck/game'
import { type Logger } from '@peck/logger'
import { type PacketContext } from '@peck/plugins'
import {
  type IncomingPacket,
  type OutgoingPacket,
  PacketFactory,
  type PacketArgs,
} from '@peck/protocol'

import { Room } from '#emulator/sessions/room'
import { type Session } from '#emulator/sessions/session'
import { type SessionManager } from '#emulator/sessions/manager'

/**
 * The packet context
 * @class
 */
export class HandlerContext implements PacketContext {
  /**
   * The sending session
   */
  public readonly session: Session

  /**
   * The packet being handled
   */
  public readonly packet: IncomingPacket

  /**
   * Every open session
   */
  public readonly sessions: SessionManager

  /**
   * Creates a packet context
   * @param session The sending session
   * @param packet The packet
   * @param sessions Every open session
   */
  public constructor(
    session: Session,
    packet: IncomingPacket,
    sessions: SessionManager,
  ) {
    this.session = session
    this.packet = packet
    this.sessions = sessions
  }

  /**
   * The player
   */
  public get player(): Player {
    if (!this.session.player) {
      throw new Error(`Session ${this.session.id} is not logged in`)
    }
    return this.session.player
  }

  /**
   * The session's logger
   */
  public get log(): Logger {
    return this.session.log
  }

  /**
   * A room
   */
  public get room(): Room {
    return new Room(this.session, this.sessions)
  }

  /**
   * Sends a packet to the player
   * @param type The packet class
   * @param args The packet's fields
   * @returns Once it is written
   */
  public reply<T extends OutgoingPacket>(
    type: new () => T,
    ...args: PacketArgs<T>
  ): Promise<void> {
    return this.session.send<T>(PacketFactory.create<T>(type, ...args))
  }
}
