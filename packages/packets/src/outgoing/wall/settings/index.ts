import { Field, OutgoingPacket, Packet } from '@peck/protocol'

import { Outgoing } from '#packets/outgoing/headers'

/**
 * Whether the wall setting was kept
 * @class
 */
@Packet(Outgoing.WallSettingsSet, 'xt')
export class WallSettingsSetOutgoing extends OutgoingPacket {
  /**
   * Whether it was
   */
  @Field.int() public readonly result: number = 0
}

/**
 * Who may open a wall
 * @class
 */
@Packet(Outgoing.WallSettings, 'xt')
export class WallSettingsOutgoing extends OutgoingPacket {
  /**
   * 0 nobody, 1 buddies, 2 anyone
   */
  @Field.int() public readonly setting: number = 0
}
