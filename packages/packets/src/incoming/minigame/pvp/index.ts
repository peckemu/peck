import { Field, IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '#packets/incoming/headers'

/**
 * Asks, accepts or turns down a two player game
 * @class
 */
@Packet(Incoming.MinigamePvp, 'xt')
export class MinigamePvpIncoming extends IncomingPacket {
  /**
   * The game
   */
  @Field.int() public readonly gameDefId: number = 0

  /**
   * Whether to ask or turn down
   */
  @Field.int() public readonly action: number = 0

  /**
   * The player asked, or null
   */
  @Field.optional(Field.string()) public readonly userName?: string
}
