import { Field, OutgoingPacket, Packet, PacketFactory } from '@peck/protocol'

import { Outgoing } from '#packets/outgoing/headers'

/**
 * Whether the clothing changed
 * @class
 */
@Packet(Outgoing.ItemUse, 'xt')
export class ItemUseOutgoing extends OutgoingPacket {
  /**
   * Whether it did
   */
  @Field.int() public readonly result: number = 0

  /**
   * Says it changed
   * @param room The room
   * @returns The packet
   */
  public static dressed(room: number): ItemUseOutgoing {
    return PacketFactory.create<ItemUseOutgoing>(ItemUseOutgoing, {
      room,
      result: 1,
    })
  }

  /**
   * Says it didn't
   * @param room The room
   * @returns The packet
   */
  public static refused(room: number): ItemUseOutgoing {
    return PacketFactory.create<ItemUseOutgoing>(ItemUseOutgoing, {
      room,
      result: 0,
    })
  }
}
