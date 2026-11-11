import { Field, IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '#packets/incoming/headers'

/**
 * Mutes a player
 * @class
 */
@Packet(Incoming.Mute, 'xt')
export class MuteIncoming extends IncomingPacket {
  /**
   * The player
   */
  @Field.string() public readonly userName: string = ''

  /**
   * How long
   */
  @Field.number() public readonly duration: number = 0

  /**
   * The moderator's note
   */
  @Field.string() public readonly note: string = ''
}
