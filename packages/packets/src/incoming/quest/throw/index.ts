import { Field, IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '../../headers/index.ts'

/**
 * Throws a weapon
 * @class
 */
@Packet(Incoming.QuestThrow, 'xt')
export class QuestThrowIncoming extends IncomingPacket {
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

  /**
   * Always empty
   */
  @Field.string() public readonly actorId: string = ''

  /**
   * The player's session id
   */
  @Field.int() public readonly userId: number = 0

  /**
   * The weapon's colour
   */
  @Field.uint() public readonly color: number = 0
}
