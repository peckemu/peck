import { Field, OutgoingPacket, Packet, PacketFactory } from '@peck/protocol'

import { Outgoing } from '#packets/outgoing/headers'

/**
 * The recycled clothing
 * @class
 */
@Packet(Outgoing.ItemRecycle, 'xt')
export class ItemRecycleOutgoing extends OutgoingPacket {
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
  @Field.rest(Field.int()) public readonly invIds: readonly number[] = []

  /**
   * Lists recycled things
   * @param room The target room
   * @param invIds The recycled places
   * @param gems The gems afterwards
   * @returns The packet
   */
  public static of(
    room: number,
    invIds: readonly number[],
    gems: number,
  ): ItemRecycleOutgoing {
    return PacketFactory.create<ItemRecycleOutgoing>(ItemRecycleOutgoing, {
      room,
      count: invIds.length,
      gems: invIds.length > 0 ? gems : -1,
      invIds,
    })
  }
}
