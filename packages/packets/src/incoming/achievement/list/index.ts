import { Field, IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '#packets/incoming/headers'

/**
 * Asks for a player's achievements
 * @class
 */
@Packet(Incoming.Achievements, 'xt')
export class AchievementsIncoming extends IncomingPacket {
  /**
   * The player's username
   */
  @Field.string() public readonly userName: string = ''

  /**
   * Seconds since the last ask
   */
  @Field.int() public readonly secondsSinceLastAsked: number = -1
}
