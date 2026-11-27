import { Field, OutgoingPacket, Packet, PacketFactory } from '@peck/protocol'

import { Outgoing } from '../../headers/index.ts'

/**
 * Whether a world item's gift was given
 * @class
 */
@Packet(Outgoing.WorldItemGift, 'xt')
export class WorldItemGiftOutgoing extends OutgoingPacket {
  /**
   * Whether it was
   */
  @Field.int() public readonly result: number = 0

  /**
   * The gems or diamonds balance, or -1
   */
  @Field.int() public readonly balance: number = -1

  /**
   * Says the gift was given
   * @param room The target room
   * @param balance The new balance, or -1
   * @returns The packet
   */
  public static given(room: number, balance: number): WorldItemGiftOutgoing {
    return PacketFactory.create<WorldItemGiftOutgoing>(WorldItemGiftOutgoing, {
      room,
      result: 1,
      balance,
    })
  }

  /**
   * Says the gift was refused
   * @param room The target room
   * @returns The packet
   */
  public static refused(room: number): WorldItemGiftOutgoing {
    return PacketFactory.create<WorldItemGiftOutgoing>(WorldItemGiftOutgoing, {
      room,
      result: 0,
      balance: -1,
    })
  }
}
