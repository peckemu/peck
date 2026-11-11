import { Field, OutgoingPacket, Packet } from '@peck/protocol'

import { Outgoing } from '#packets/outgoing/headers'

/**
 * Whether the wall's look was kept
 * @class
 */
@Packet(Outgoing.WallParameters, 'xt')
export class WallParametersOutgoing extends OutgoingPacket {
  /**
   * Whether it was
   */
  @Field.int() public readonly result: number = 0
}
