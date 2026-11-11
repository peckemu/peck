import { Field, OutgoingPacket, Packet, PacketFactory } from '@peck/protocol'

import { Outgoing } from '#packets/outgoing/headers'

/**
 * Whether another animal was added
 * @class
 */
@Packet(Outgoing.AvatarAdd, 'xt')
export class AvatarAddOutgoing extends OutgoingPacket {
  /**
   * The result
   */
  @Field.int() public readonly status: number = 0

  /**
   * The new animal's id
   */
  @Field.int() public readonly perUserAvId: number = 0

  /**
   * The new animal's slot
   */
  @Field.int() public readonly avInvId: number = 0

  /**
   * Says the animal was added
   * @param room The room
   * @param perUserAvId Its id among the player's animals
   * @param avInvId Its slot
   * @returns The packet
   */
  public static added(
    room: number,
    perUserAvId: number,
    avInvId: number,
  ): AvatarAddOutgoing {
    return PacketFactory.create<AvatarAddOutgoing>(AvatarAddOutgoing, {
      room,
      status: 1,
      perUserAvId,
      avInvId,
    })
  }

  /**
   * Says it wasn't
   * @param room The room
   * @returns The packet
   */
  public static refused(room: number): AvatarAddOutgoing {
    return PacketFactory.create<AvatarAddOutgoing>(AvatarAddOutgoing, {
      room,
      status: 0,
      perUserAvId: 0,
      avInvId: 0,
    })
  }
}
