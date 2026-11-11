import { Field, OutgoingPacket, Packet } from '@peck/protocol'

import { Outgoing } from '#packets/outgoing/headers'

/**
 * How many like something
 * @class
 */
@Packet(Outgoing.Likes, 'xt')
export class LikesOutgoing extends OutgoingPacket {
  /**
   * Whether it worked
   */
  @Field.int() public readonly result: number = 0

  /**
   * Whether the player likes it
   */
  @Field.int() public readonly liked: number = 0

  /**
   * How many
   */
  @Field.int() public readonly count: number = 0
}

/**
 * Whether a like was taken
 * @class
 */
@Packet(Outgoing.Like, 'xt')
export class LikeOutgoing extends OutgoingPacket {
  /**
   * Whether it was
   */
  @Field.int() public readonly result: number = 0
}
