import { Field, OutgoingPacket, Packet, PacketFactory } from '@peck/protocol'

import { Outgoing } from '#packets/outgoing/headers'

/**
 * Whether a den shop stand changed
 * @class
 */
@Packet(Outgoing.DenShopUpdate, 'xt')
export class DenShopUpdateOutgoing extends OutgoingPacket {
  /**
   * Whether it changed
   */
  @Field.int() public readonly status: number = 0

  /**
   * The stand's state afterwards
   */
  @Field.rest() public readonly state: readonly string[] = []

  /**
   * Says the stand changed
   * @param room The target room
   * @param state The stand's state afterwards
   * @returns The packet
   */
  public static updated(room: number, state: number): DenShopUpdateOutgoing {
    return PacketFactory.create<DenShopUpdateOutgoing>(DenShopUpdateOutgoing, {
      room,
      status: 1,
      state: [String(state)],
    })
  }

  /**
   * Says the stand didn't change
   * @param room The target room
   * @returns The packet
   */
  public static refused(room: number): DenShopUpdateOutgoing {
    return PacketFactory.create<DenShopUpdateOutgoing>(DenShopUpdateOutgoing, {
      room,
      status: 0,
      state: [],
    })
  }
}
