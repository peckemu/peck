import { Field, OutgoingPacket, Packet, PacketFactory } from '@peck/protocol'

import { Outgoing } from '#packets/outgoing/headers'

/**
 * Which den items were saved
 * @class
 */
@Packet(Outgoing.DenStateSaved, 'xt')
export class DenStateSavedOutgoing extends OutgoingPacket {
  /**
   * The items' places in the den items
   */
  @Field.rest(Field.int()) public readonly invIdxs: readonly number[] = []

  /**
   * Lists the items saved
   * @param room The target room
   * @param invIdxs The items' places
   * @returns The packet
   */
  public static of(
    room: number,
    invIdxs: readonly number[],
  ): DenStateSavedOutgoing {
    return PacketFactory.create<DenStateSavedOutgoing>(DenStateSavedOutgoing, {
      room,
      invIdxs,
    })
  }
}
