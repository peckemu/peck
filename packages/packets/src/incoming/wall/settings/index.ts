import { Field, IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '#packets/incoming/headers'

/**
 * Sets the player's wall access
 * @class
 */
@Packet(Incoming.WallSettingsSet, 'xt')
export class WallSettingsSetIncoming extends IncomingPacket {
  /**
   * 0 nobody, 1 buddies, 2 anyone
   */
  @Field.int() public readonly setting: number = 0
}

/**
 * Asks for a wall's access
 * @class
 */
@Packet(Incoming.WallSettings, 'xt')
export class WallSettingsIncoming extends IncomingPacket {
  /**
   * Whose wall
   */
  @Field.string() public readonly userName: string = ''
}
