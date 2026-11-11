import { Field, IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '#packets/incoming/headers'

/**
 * Asks for one of a player's avatars
 * @class
 */
@Packet(Incoming.AvatarData, 'xt')
export class AvatarDataIncoming extends IncomingPacket {
  /**
   * Whose avatar
   */
  @Field.string() public readonly userName: string = ''

  /**
   * Which avatar
   */
  @Field.int() public readonly perUserAvId: number = 0

  /**
   * The attached items
   */
  @Field.int() public readonly items: number = 0
}
