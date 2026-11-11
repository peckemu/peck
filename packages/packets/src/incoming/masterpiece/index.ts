import { Field, IncomingPacket, Packet } from '@peck/protocol'

import { Incoming } from '#packets/incoming/headers'

/**
 * Asks for the masterpieces in a den
 * @class
 */
@Packet(Incoming.DenMasterpieces, 'xt')
export class DenMasterpiecesIncoming extends IncomingPacket {
  /**
   * Whose den
   */
  @Field.string() public readonly userName: string = ''
}

/**
 * Asks for a masterpiece's painter
 * @class
 */
@Packet(Incoming.MasterpieceCreator, 'xt')
export class MasterpieceCreatorIncoming extends IncomingPacket {
  /**
   * Its den
   */
  @Field.string() public readonly denUserName: string = ''

  /**
   * The masterpiece
   */
  @Field.string() public readonly uniqueImageId: string = ''
}
