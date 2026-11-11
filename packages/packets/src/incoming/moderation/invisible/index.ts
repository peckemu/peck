import { Field, IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '#packets/incoming/headers'

/**
 * Hides or shows a moderator
 * @class
 */
@Packet(Incoming.Invisible, 'xt')
export class InvisibleIncoming extends IncomingPacket {
  /**
   * Whether to be seen
   */
  @Field.optional(Field.bool()) public readonly visible?: boolean

  /**
   * Where they stand across
   */
  @Field.optional(Field.int()) public readonly x?: number

  /**
   * Where they stand down
   */
  @Field.optional(Field.int()) public readonly y?: number

  /**
   * Their idle animation
   */
  @Field.optional(Field.uint()) public readonly animation?: number

  /**
   * The fields after
   */
  @Field.rest() public readonly extra: readonly string[] = []
}
