import { Field, IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '#packets/incoming/headers'

/**
 * Joins a room
 * @class
 */
@Packet(Incoming.RoomJoin, 'xt')
export class RoomJoinIncoming extends IncomingPacket {
  /**
   * The full room name
   */
  @Field.string() public readonly target: string = ''

  /**
   * Whether a foreign room was allowed
   */
  @Field.int() public readonly confirmLanguageChange: number = 0

  /**
   * Whether to join unseen
   */
  @Field.int() public readonly invisible: number = 0

  /**
   * How the instance is picked
   */
  @Field.int() public readonly joinType: number = 0
}
