import { Field, IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '../../headers/index.ts'

/**
 * Says where an actor is
 * @class
 */
@Packet(Incoming.QuestPosition, 'xt')
export class QuestPositionIncoming extends IncomingPacket {
  /**
   * The actor
   */
  @Field.string() public readonly actorId: string = ''

  /**
   * Where across
   */
  @Field.int() public readonly x: number = 0

  /**
   * Where down
   */
  @Field.int() public readonly y: number = 0

  /**
   * How fast it walks
   */
  @Field.int() public readonly velocity: number = 0

  /**
   * What it seeks
   */
  @Field.int() public readonly seekType: number = 0

  /**
   * The nearest player across
   */
  @Field.int() public readonly nearestX: number = 0

  /**
   * The nearest player down
   */
  @Field.int() public readonly nearestY: number = 0
}
