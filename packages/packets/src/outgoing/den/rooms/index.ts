import { Field, OutgoingPacket, Packet, PacketFactory } from '@peck/protocol'

import { Outgoing } from '#packets/outgoing/headers'

/**
 * A den room the player owns
 */
export type ListedDenRoom = {
  /**
   * Its place in the player's den rooms
   */
  readonly invIdx: number

  /**
   * Its definition id
   */
  readonly defId: number
}

/**
 * The player's den rooms
 * @class
 */
@Packet(Outgoing.DenRooms, 'xt')
export class DenRoomsOutgoing extends OutgoingPacket {
  /**
   * The den rooms
   */
  @Field.list(Field.object({ invIdx: Field.int(), defId: Field.int() }))
  public readonly rooms: readonly ListedDenRoom[] = []

  /**
   * Lists the player's den rooms
   * @param room The target room
   * @param rooms The den rooms
   * @returns The packet
   */
  public static of(
    room: number,
    rooms: readonly ListedDenRoom[],
  ): DenRoomsOutgoing {
    return PacketFactory.create<DenRoomsOutgoing>(DenRoomsOutgoing, {
      room,
      rooms,
    })
  }
}
