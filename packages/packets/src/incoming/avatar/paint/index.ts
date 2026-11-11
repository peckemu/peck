import { Field, IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '#packets/incoming/headers'

/**
 * Recolours the player's animal
 * @class
 */
@Packet(Incoming.AvatarPaint, 'xt')
export class AvatarPaintIncoming extends IncomingPacket {
  /**
   * The first colour
   */
  @Field.uint() public readonly color1: number = 0

  /**
   * The second colour
   */
  @Field.uint() public readonly color2: number = 0

  /**
   * The third colour
   */
  @Field.uint() public readonly color3: number = 0

  /**
   * The name bar picked
   */
  @Field.int() public readonly nameBar: number = 0
}
