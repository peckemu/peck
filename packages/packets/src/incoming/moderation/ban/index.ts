import { Field, IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '#packets/incoming/headers'

/**
 * Bans a player
 * @class
 */
@Packet(Incoming.Ban, 'xt')
export class BanIncoming extends IncomingPacket {
  /**
   * The player
   */
  @Field.string() public readonly userName: string = ''

  /**
   * How long
   */
  @Field.number() public readonly duration: number = 0

  /**
   * The rule broken
   */
  @Field.int() public readonly reasonId: number = 0

  /**
   * The moderator's note
   */
  @Field.string() public readonly note: string = ''
}
