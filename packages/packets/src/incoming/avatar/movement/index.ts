import { type Point } from '@peck/shared'

import { Field, IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '#packets/incoming/headers'

/**
 * The facing left bit
 */
export const FLIP_BIT = 0x80000000

/**
 * The player moved
 * @class
 */
@Packet(Incoming.Movement, 'xt')
export class MovementIncoming extends IncomingPacket {
  /**
   * The queued positions
   */
  @Field.list(Field.object({ x: Field.int(), y: Field.int() }))
  public readonly points: readonly Point[] = []

  /**
   * The idle animation
   */
  @Field.uint() public readonly animation: number = 0

  /**
   * Whether the avatar was placed
   */
  @Field.bool() public readonly immediate: boolean = false
}
