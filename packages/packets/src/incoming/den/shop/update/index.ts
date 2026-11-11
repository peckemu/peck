import { Field, IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '#packets/incoming/headers'

/**
 * Changes a den shop stand
 * @class
 */
@Packet(Incoming.DenShopUpdate, 'xt')
export class DenShopUpdateIncoming extends IncomingPacket {
  /**
   * The stand
   */
  @Field.int() public readonly storeInvId: number = 0

  /**
   * The stand's state the owner saw
   */
  @Field.string() public readonly state: string = '0'

  /**
   * The listings changed and taken off
   */
  @Field.rest() public readonly body: readonly string[] = []
}
