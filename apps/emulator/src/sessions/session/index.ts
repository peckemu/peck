import { type Player } from '@peck/game'
import { type Logger } from '@peck/logger'
import { type PacketSession } from '@peck/plugins'
import { type OutgoingPacket } from '@peck/protocol'

import { type Transport } from '#emulator/network/transport'

/**
 * A player on a connection
 * @class
 */
export class Session implements PacketSession {
  /**
   * The session id
   */
  public readonly id: number

  /**
   * The logged in player
   */
  public player: Player | null = null

  /**
   * The login key
   */
  public randomKey: string | null = null

  /**
   * The ticket it logged in with
   */
  public ticket: string | null = null

  /**
   * The last activity
   */
  public lastSeen = Date.now()

  /**
   * The session's logger
   */
  public readonly log: Logger

  /**
   * The connection the session sends over
   */
  private readonly transport: Transport

  /**
   * Creates a session on a connection
   * @param id The session id
   * @param transport The connection to send over
   * @param log The session's logger
   */
  public constructor(id: number, transport: Transport, log: Logger) {
    this.id = id
    this.transport = transport
    this.log = log
  }

  /**
   * Whether the player has logged in
   */
  public get authenticated(): boolean {
    return this.player !== null
  }

  /**
   * Whether the player's connection has closed
   * @returns Whether it is closed
   */
  public get closed(): boolean {
    return this.transport.closed
  }

  /**
   * The player's address
   * @returns The remote address
   */
  public get remoteAddress(): string {
    return this.transport.remoteAddress
  }

  /**
   * Sends a packet to the player
   * @param packet The packet
   * @returns Once it is written
   */
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters -- names the packet sent
  public send<T extends OutgoingPacket>(packet: T): Promise<void> {
    return this.transport.send(packet.toString())
  }

  /**
   * Sends a written frame
   * @param frame The frame
   * @returns Once it is written
   */
  public write(frame: string): Promise<void> {
    return this.transport.send(frame)
  }

  /**
   * Refreshes a player's presence
   */
  public touch(): void {
    this.lastSeen = Date.now()
  }

  /**
   * Closes the connection
   * @returns Once it is closed
   */
  public close(): Promise<void> {
    return this.transport.close()
  }
}
