import { Field, IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '../../headers/index.ts'

/**
 * Says a heal landed
 * @class
 */
@Packet(Incoming.QuestHeal, 'xt')
export class QuestHealIncoming extends IncomingPacket {
  /**
   * The weapon
   */
  @Field.int() public readonly weaponDefId: number = 0

  /**
   * The player healed
   */
  @Field.int() public readonly userId: number = 0
}
