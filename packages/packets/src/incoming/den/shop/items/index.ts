import { Field, IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '#packets/incoming/headers'

/**
 * Asks for a stand's stock
 * @class
 */
@Packet(Incoming.DenShopItems, 'xt')
export class DenShopItemsIncoming extends IncomingPacket {
  /**
   * The stand's owner
   */
  @Field.string() public readonly ownerUserName: string = ''

  /**
   * The stand
   */
  @Field.int() public readonly storeInvId: number = 0
}
