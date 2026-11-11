import { type Player } from '@peck/game'
import {
  type IncomingPacket,
  type OutgoingPacket,
  type PacketArgs,
  type PacketFields,
} from '@peck/protocol'
import { type Logger } from '@peck/logger'

/**
 * A player's connection
 */
export type PacketSession = {
  /**
   * The session's id
   */
  readonly id: number

  /**
   * The logged in player
   */
  player: Player | null

  /**
   * The login key
   */
  randomKey: string | null

  /**
   * Whether the player has logged in
   */
  readonly authenticated: boolean

  /**
   * Whether the connection has closed
   */
  readonly closed: boolean

  /**
   * The session's logger
   */
  readonly log: Logger

  /**
   * Sends a packet
   * @param packet The packet
   */
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters -- names the packet sent
  send<T extends OutgoingPacket>(packet: T): Promise<void>

  /**
   * Closes the connection
   */
  close(): Promise<void>
}

/**
 * Every open session
 */
export type PacketSessions = Iterable<PacketSession> & {
  /**
   * The number of open sessions
   */
  readonly size: number

  /**
   * Finds a session by id
   * @param id The session id
   */
  get(id: number): PacketSession | null

  /**
   * Finds a player's session
   * @param gameId The player's id
   */
  byPlayer(gameId: number): PacketSession | null

  /**
   * Lists the sessions in a room
   * @param roomId The room id
   */
  inRoom(roomId: number): PacketSession[]

  /**
   * Sends a packet to everyone in a room
   * @param roomId The room id
   * @param packet The packet
   * @param except A session to leave out
   */
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters -- names the packet sent
  broadcast<T extends OutgoingPacket>(
    roomId: number,
    packet: T,
    except?: PacketSession,
  ): Promise<void>
}

/**
 * Room send options
 */
export type RoomSendOptions = {
  /**
   * Whether to skip the sender
   */
  readonly exceptSelf?: boolean
}

/**
 * A room
 */
export type PacketRoom = {
  /**
   * The room id
   */
  readonly id: number

  /**
   * The sessions in the room
   */
  readonly members: PacketSession[]

  /**
   * Sends a packet to the room
   * @param type The packet class
   * @param fields The packet's fields
   * @param options The send options
   */
  send<T extends OutgoingPacket>(
    type: new () => T,
    fields: PacketFields<T>,
    options?: RoomSendOptions,
  ): Promise<void>
}

/**
 * A packet context
 */
export type PacketContext = {
  /**
   * The sending session
   */
  readonly session: PacketSession

  /**
   * The packet
   */
  readonly packet: IncomingPacket

  /**
   * Every open session
   */
  readonly sessions: PacketSessions

  /**
   * The player
   */
  readonly player: Player

  /**
   * The session's logger
   */
  readonly log: Logger

  /**
   * The player's room
   */
  readonly room: PacketRoom

  /**
   * Sends a packet back to the player
   * @param type The packet class
   * @param args The packet's fields
   */
  reply<T extends OutgoingPacket>(
    type: new () => T,
    ...args: PacketArgs<T>
  ): Promise<void>
}
