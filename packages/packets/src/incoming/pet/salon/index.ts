import { Field, IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '#packets/incoming/headers'

/**
 * Changes the pet in the salon
 * @class
 */
@Packet(Incoming.PetSalon, 'xt')
export class PetSalonIncoming extends IncomingPacket {
  /**
   * The first salon look
   */
  @Field.int() public readonly cat9: number = 0

  /**
   * The second salon look
   */
  @Field.int() public readonly cat10: number = 0

  /**
   * The third salon look
   */
  @Field.int() public readonly cat11: number = 0

  /**
   * Land 0 or ocean 1
   */
  @Field.int() public readonly enviroType: number = 0
}
