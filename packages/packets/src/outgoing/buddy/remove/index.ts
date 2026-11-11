import { Field, OutgoingPacket, Packet, PacketFactory } from '@peck/protocol'

import { Outgoing } from '#packets/outgoing/headers'

/**
 * A buddyship ended
 * @class
 */
@Packet(Outgoing.BuddyRemove, 'xt')
export class BuddyRemoveOutgoing extends OutgoingPacket {
  /**
   * The other player's username
   */
  @Field.string() public readonly userName: string = ''

  /**
   * Says a buddyship ended
   * @param room The target room
   * @param userName The other player's username
   * @returns The packet
   */
  public static of(room: number, userName: string): BuddyRemoveOutgoing {
    return PacketFactory.create<BuddyRemoveOutgoing>(BuddyRemoveOutgoing, {
      room,
      userName,
    })
  }
}
