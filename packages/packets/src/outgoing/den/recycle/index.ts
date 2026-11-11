import { Field, OutgoingPacket, Packet, PacketFactory } from '@peck/protocol'

import { Outgoing } from '#packets/outgoing/headers'

/**
 * The recycled den items or rooms
 * @class
 */
@Packet(Outgoing.DenRecycle, 'xt')
export class DenRecycleOutgoing extends OutgoingPacket {
  /**
   * How many were recycled
   */
  @Field.int() public readonly count: number = 0

  /**
   * The new gems, or -1
   */
  @Field.int() public readonly gems: number = -1

  /**
   * The recycled places
   */
  @Field.rest(Field.int()) public readonly invIdxs: readonly number[] = []

  /**
   * Lists recycled things
   * @param room The target room
   * @param invIdxs The recycled places
   * @param gems The gems afterwards
   * @returns The packet
   */
  public static of(
    room: number,
    invIdxs: readonly number[],
    gems: number,
  ): DenRecycleOutgoing {
    return PacketFactory.create<DenRecycleOutgoing>(DenRecycleOutgoing, {
      room,
      count: invIdxs.length,
      gems: invIdxs.length > 0 ? gems : -1,
      invIdxs,
    })
  }
}
