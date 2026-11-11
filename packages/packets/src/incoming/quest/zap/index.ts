import { Field, IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '#packets/incoming/headers'

/**
 * Says a phantom caught the player
 * @class
 */
@Packet(Incoming.QuestPhantomZap, 'xt')
export class QuestPhantomZapIncoming extends IncomingPacket {
  /**
   * The phantom
   */
  @Field.string() public readonly actorId: string = ''

  /**
   * The player's session id
   */
  @Field.int() public readonly userId: number = 0

  /**
   * Where across
   */
  @Field.int() public readonly x: number = 0

  /**
   * Where down
   */
  @Field.int() public readonly y: number = 0
}
