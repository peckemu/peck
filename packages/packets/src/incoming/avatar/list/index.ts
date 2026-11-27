import { Field, IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '../../headers/index.ts'

/**
 * Asks for a player's avatars
 * @class
 */
@Packet(Incoming.AvatarList, 'xt')
export class AvatarListIncoming extends IncomingPacket {
  /**
   * Whose avatars
   */
  @Field.string() public readonly userName: string = ''
}
