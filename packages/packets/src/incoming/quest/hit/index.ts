import { Field, IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '#packets/incoming/headers'

/**
 * Says something was hit
 * @class
 */
@Packet(Incoming.QuestHit, 'xt')
export class QuestHitIncoming extends IncomingPacket {
  /**
   * The actor hit, or empty
   */
  @Field.string() public readonly actorId: string = ''

  /**
   * Whether the player was hit
   */
  @Field.int() public readonly playerHit: number = 0

  /**
   * The weapon
   */
  @Field.int() public readonly weaponDefId: number = 0

  /**
   * Where across
   */
  @Field.int() public readonly x: number = 0

  /**
   * Where down
   */
  @Field.int() public readonly y: number = 0
}
