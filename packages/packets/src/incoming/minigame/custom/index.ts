import { Field, IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '#packets/incoming/headers'

/**
 * Joins a two player game a player hosts
 * @class
 */
@Packet(Incoming.MinigameCustomPvp, 'xt')
export class MinigameCustomPvpIncoming extends IncomingPacket {
  /**
   * The game
   */
  @Field.int() public readonly gameDefId: number = 0

  /**
   * The client's action
   */
  @Field.int() public readonly action: number = 0

  /**
   * The host's username
   */
  @Field.string() public readonly userName: string = ''
}
