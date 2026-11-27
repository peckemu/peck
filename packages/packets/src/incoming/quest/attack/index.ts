import { Field, IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '../../headers/index.ts'

/**
 * Says a phantom attacks a player
 * @class
 */
@Packet(Incoming.QuestAttack, 'xt')
export class QuestAttackIncoming extends IncomingPacket {
  /**
   * The phantom
   */
  @Field.string() public readonly actorId: string = ''

  /**
   * The player attacked
   */
  @Field.int() public readonly userId: number = 0

  /**
   * The weapon
   */
  @Field.int() public readonly weaponDefId: number = 0

  /**
   * The weapon's colour
   */
  @Field.uint() public readonly color: number = 0
}
