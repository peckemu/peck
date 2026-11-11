import { Field, IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '#packets/incoming/headers'

/**
 * Switches a den eco item on or off
 * @class
 */
@Packet(Incoming.DenEcoConsumer, 'xt')
export class DenEcoConsumerIncoming extends IncomingPacket {
  /**
   * Its place in the player's den items
   */
  @Field.int() public readonly invIdx: number = 0

  /**
   * Whether it is switched on
   */
  @Field.bool() public readonly online: boolean = false
}
