import { Field, IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '#packets/incoming/headers'

/**
 * A minigame's own message
 * @class
 */
@Packet(Incoming.MinigameMessage, 'xt')
export class MinigameMessageIncoming extends IncomingPacket {
  /**
   * The game
   */
  @Field.int() public readonly gameDefId: number = 0

  /**
   * What the game says
   */
  @Field.rest() public readonly data: readonly string[] = []
}
