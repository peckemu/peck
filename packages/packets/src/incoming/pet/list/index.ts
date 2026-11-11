import { Field, IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '#packets/incoming/headers'

/**
 * Asks for a player's pets
 * @class
 */
@Packet(Incoming.PetList, 'xt')
export class PetListIncoming extends IncomingPacket {
  /**
   * Whose pets
   */
  @Field.string() public readonly userName: string = ''
}
