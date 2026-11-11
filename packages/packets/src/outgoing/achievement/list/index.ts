import { Field, OutgoingPacket, Packet, PacketFactory } from '@peck/protocol'

import { type EarnedAchievement } from '#packets/outgoing/player/variable'
import { Outgoing } from '#packets/outgoing/headers'

/**
 * A player's achievements
 * @class
 */
@Packet(Outgoing.Achievements, 'xt')
export class AchievementsOutgoing extends OutgoingPacket {
  /**
   * The player's username
   */
  @Field.string() public readonly userName: string = ''

  /**
   * The achievements
   */
  @Field.list(Field.object({ invId: Field.int(), defId: Field.int() }))
  public readonly achievements: readonly EarnedAchievement[] = []

  /**
   * Lists a player's achievements
   * @param userName The player's username
   * @param achievements The achievements
   * @returns The packet
   */
  public static of(
    userName: string,
    achievements: readonly EarnedAchievement[],
  ): AchievementsOutgoing {
    return PacketFactory.create<AchievementsOutgoing>(AchievementsOutgoing, {
      room: -1,
      userName,
      achievements,
    })
  }
}
