import { Field, IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '#packets/incoming/headers'

/**
 * Turns the player into a phantom or back
 * @class
 */
@Packet(Incoming.DenPhantom, 'xt')
export class DenPhantomIncoming extends IncomingPacket {
  /**
   * Whether they become a phantom
   */
  @Field.bool() public readonly phantom: boolean = false
}
