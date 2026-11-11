import { Field, IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '#packets/incoming/headers'

/**
 * Looks a player up by name
 * @class
 */
@Packet(Incoming.AvatarLookup, 'xt')
export class AvatarLookupIncoming extends IncomingPacket {
  /**
   * The player's username
   */
  @Field.string() public readonly userName: string = ''

  /**
   * Whether it is a name search
   */
  @Field.int() public readonly userLookup: number = 0
}

/**
 * Looks a player up by room id
 * @class
 */
@Packet(Incoming.AvatarLookupById, 'xt')
export class AvatarLookupByIdIncoming extends IncomingPacket {
  /**
   * The player's id in the room
   */
  @Field.int() public readonly userId: number = 0

  /**
   * Whether it is a name search
   */
  @Field.int() public readonly userLookup: number = 0
}
