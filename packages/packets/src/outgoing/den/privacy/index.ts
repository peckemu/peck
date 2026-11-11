import { Field, OutgoingPacket, Packet, PacketFactory } from '@peck/protocol'

import { Outgoing } from '#packets/outgoing/headers'

/**
 * A player's den privacy
 * @class
 */
@Packet(Outgoing.DenPrivacy, 'xt')
export class DenPrivacyOutgoing extends OutgoingPacket {
  /**
   * The den's owner
   */
  @Field.string() public readonly userName: string = ''

  /**
   * 0 nobody, 1 buddies, 2 everyone
   */
  @Field.int() public readonly privacy: number = 0

  /**
   * Says who may visit a den
   * @param room The target room
   * @param userName The den's owner
   * @param privacy The setting
   * @returns The packet
   */
  public static of(
    room: number,
    userName: string,
    privacy: number,
  ): DenPrivacyOutgoing {
    return PacketFactory.create<DenPrivacyOutgoing>(DenPrivacyOutgoing, {
      room,
      userName,
      privacy,
    })
  }
}
