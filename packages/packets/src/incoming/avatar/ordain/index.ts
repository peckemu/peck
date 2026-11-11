import { Field, IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '#packets/incoming/headers'

/**
 * Chooses the animals a non-member keeps
 * @class
 */
@Packet(Incoming.AvatarOrdain, 'xt')
export class AvatarOrdainIncoming extends IncomingPacket {
  /**
   * The slots chosen
   */
  @Field.rest() public readonly avInvIds: readonly string[] = []
}
