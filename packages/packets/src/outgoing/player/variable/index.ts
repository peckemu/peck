import { Field, OutgoingPacket, Packet, PacketFactory } from '@peck/protocol'

import { Outgoing } from '#packets/outgoing/headers'

/**
 * An achievement a player earned
 */
export type EarnedAchievement = {
  /**
   * Its place in the player's achievements
   */
  readonly invId: number

  /**
   * Its definition id
   */
  readonly defId: number
}

/**
 * A user variable changed
 * @class
 */
@Packet(Outgoing.UserVariableChanged, 'xt')
export class UserVariableChangedOutgoing extends OutgoingPacket {
  /**
   * The variable's id
   */
  @Field.int() public readonly varId: number = 0

  /**
   * Its value now
   */
  @Field.number() public readonly value: number = 0

  /**
   * The achievements the change earned
   */
  @Field.list(Field.object({ invId: Field.int(), defId: Field.int() }))
  public readonly achievements: readonly EarnedAchievement[] = []

  /**
   * Says a variable changed
   * @param varId The variable's id
   * @param value Its value now
   * @param achievements The achievements it earned
   * @returns The packet
   */
  public static of(
    varId: number,
    value: number,
    achievements: readonly EarnedAchievement[] = [],
  ): UserVariableChangedOutgoing {
    return PacketFactory.create<UserVariableChangedOutgoing>(
      UserVariableChangedOutgoing,
      {
        room: -1,
        varId,
        value,
        achievements,
      },
    )
  }
}
