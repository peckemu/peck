import { Field, OutgoingPacket, Packet, PacketFactory } from '@peck/protocol'

import { Outgoing } from '../../headers/index.ts'

/**
 * A room the client knows
 */
export type ListedRoom = {
  /**
   * The room's id
   */
  readonly id: number

  /**
   * The room's name
   */
  readonly name: string

  /**
   * How many players it holds
   */
  readonly capacity: number

  /**
   * Whether it is a temporary room
   */
  readonly temporary: boolean

  /**
   * Whether it is a game room
   */
  readonly game: boolean

  /**
   * How many players are in it
   */
  readonly users: number
}

/**
 * The rooms the client knows
 * @class
 */
@Packet(Outgoing.RoomList, 'xt')
export class RoomListOutgoing extends OutgoingPacket {
  /**
   * The rooms, limbo first
   */
  @Field.list(
    Field.object({
      id: Field.int(),
      name: Field.string(),
      capacity: Field.int(),
      temporary: Field.bool(),
      game: Field.bool(),
      users: Field.int(),
    }),
  )
  public readonly rooms: readonly ListedRoom[] = []

  /**
   * Lists the rooms
   * @param room The target room
   * @param rooms The rooms, limbo first
   * @returns The packet
   */
  public static of(
    room: number,
    rooms: readonly ListedRoom[],
  ): RoomListOutgoing {
    return PacketFactory.create<RoomListOutgoing>(RoomListOutgoing, {
      room,
      rooms,
    })
  }
}
