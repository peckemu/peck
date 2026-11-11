import { Field, IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '#packets/incoming/headers'

/**
 * Switches the player's animal
 * @class
 */
@Packet(Incoming.AvatarSwitch, 'xt')
export class AvatarSwitchIncoming extends IncomingPacket {
  /**
   * The animal to switch to
   */
  @Field.int() public readonly perUserAvId: number = 0
}
