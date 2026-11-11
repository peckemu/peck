import { Field, IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '#packets/incoming/headers'

/**
 * Claims gems won in a minigame
 * @class
 */
@Packet(Incoming.MinigameGems, 'xt')
export class MinigameGemsIncoming extends IncomingPacket {
  /**
   * The folded amount
   */
  @Field.number() public readonly amountSum: number = 0

  /**
   * The folded game
   */
  @Field.number() public readonly gameSum: number = 0

  /**
   * The check
   */
  @Field.number() public readonly checkSum: number = 0
}
