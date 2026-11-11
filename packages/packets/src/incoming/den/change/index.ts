import { Field, IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '#packets/incoming/headers'

/**
 * Switches the player's den room
 * @class
 */
@Packet(Incoming.DenChange, 'xt')
export class DenChangeIncoming extends IncomingPacket {
  /**
   * The den room's place in the player's den rooms
   */
  @Field.int() public readonly invIdx: number = 0
}
