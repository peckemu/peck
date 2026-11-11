import { Field, OutgoingPacket, Packet, PacketFactory } from '@peck/protocol'

import { Outgoing } from '#packets/outgoing/headers'

/**
 * The den room switched to
 * @class
 */
@Packet(Outgoing.DenChange, 'xt')
export class DenChangeOutgoing extends OutgoingPacket {
  /**
   * The den room's definition id, or 0
   */
  @Field.int() public readonly defId: number = 0

  /**
   * The animal out
   */
  @Field.optional(Field.int()) public readonly perUserAvId?: number

  /**
   * The pet out, or 0
   */
  @Field.optional(Field.int()) public readonly activePetInvId?: number

  /**
   * Names the den room switched to
   * @param room The target room
   * @param defId The den room's definition id
   * @param perUserAvId The animal out
   * @param activePetInvId The pet out, or 0
   * @returns The packet
   */
  public static of(
    room: number,
    defId: number,
    perUserAvId: number,
    activePetInvId: number,
  ): DenChangeOutgoing {
    return PacketFactory.create<DenChangeOutgoing>(DenChangeOutgoing, {
      room,
      defId,
      perUserAvId,
      activePetInvId,
    })
  }

  /**
   * Says the den room was not switched
   * @param room The target room
   * @returns The packet
   */
  public static refused(room: number): DenChangeOutgoing {
    return PacketFactory.create<DenChangeOutgoing>(DenChangeOutgoing, {
      room,
      defId: 0,
    })
  }
}
