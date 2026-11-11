import { Field, OutgoingPacket, Packet, PacketFactory } from '@peck/protocol'

import { Outgoing } from '#packets/outgoing/headers'

/**
 * How many buddies are in a land
 */
export type LandCount = {
  /**
   * A room in the land
   */
  readonly name: string

  /**
   * How many buddies are there
   */
  readonly users: number
}

/**
 * How many buddies are in each land
 * @class
 */
@Packet(Outgoing.RoomCount, 'xt')
export class RoomCountOutgoing extends OutgoingPacket {
  /**
   * The lands
   */
  @Field.list(Field.object({ name: Field.string(), users: Field.int() }))
  public readonly lands: readonly LandCount[] = []

  /**
   * Lists the buddies by land
   * @param room The target room
   * @param lands The lands
   * @returns The packet
   */
  public static of(
    room: number,
    lands: readonly LandCount[],
  ): RoomCountOutgoing {
    return PacketFactory.create<RoomCountOutgoing>(RoomCountOutgoing, {
      room,
      lands,
    })
  }
}
