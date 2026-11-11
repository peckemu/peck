import { Field, IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '#packets/incoming/headers'

/**
 * Removes one of the player's animals
 * @class
 */
@Packet(Incoming.AvatarRemove, 'xt')
export class AvatarRemoveIncoming extends IncomingPacket {
  /**
   * The animal to remove
   */
  @Field.int() public readonly perUserAvId: number = 0
}
