import { Field, IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '#packets/incoming/headers'

/**
 * Sets one of the player's pending flags
 * @class
 */
@Packet(Incoming.AvatarPendingFlag, 'xt')
export class AvatarPendingFlagIncoming extends IncomingPacket {
  /**
   * The flag's bit
   */
  @Field.int() public readonly flag: number = 0
}
