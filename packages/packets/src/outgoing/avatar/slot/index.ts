import { Field, OutgoingPacket, Packet, PacketFactory } from '@peck/protocol'

import { Outgoing } from '#packets/outgoing/headers'

/**
 * Whether another animal slot was bought
 * @class
 */
@Packet(Outgoing.AvatarSlot, 'xt')
export class AvatarSlotOutgoing extends OutgoingPacket {
  /**
   * Whether it was
   */
  @Field.int() public readonly success: number = 0

  /**
   * Says the slot was bought
   * @param room The room
   * @returns The packet
   */
  public static bought(room: number): AvatarSlotOutgoing {
    return PacketFactory.create<AvatarSlotOutgoing>(AvatarSlotOutgoing, {
      room,
      success: 1,
    })
  }

  /**
   * Says it wasn't
   * @param room The room
   * @returns The packet
   */
  public static refused(room: number): AvatarSlotOutgoing {
    return PacketFactory.create<AvatarSlotOutgoing>(AvatarSlotOutgoing, {
      room,
      success: 0,
    })
  }
}
