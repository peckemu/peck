import { Field, IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '#packets/incoming/headers'

/**
 * Asks how many like something
 * @class
 */
@Packet(Incoming.Likes, 'xt')
export class LikesIncoming extends IncomingPacket {
  /**
   * What it is
   */
  @Field.string() public readonly resourceType: string = ''

  /**
   * Which one
   */
  @Field.string() public readonly resourceId: string = ''

  /**
   * The rest
   */
  @Field.rest() public readonly rest: readonly string[] = []
}

/**
 * Likes something
 * @class
 */
@Packet(Incoming.Like, 'xt')
export class LikeIncoming extends IncomingPacket {
  /**
   * What it is
   */
  @Field.string() public readonly resourceType: string = ''

  /**
   * Which one
   */
  @Field.string() public readonly resourceId: string = ''

  /**
   * The rest
   */
  @Field.rest() public readonly rest: readonly string[] = []
}
