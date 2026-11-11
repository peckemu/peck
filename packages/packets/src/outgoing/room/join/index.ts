import { Field, OutgoingPacket, Packet, PacketFactory } from '@peck/protocol'

import { Outgoing } from '#packets/outgoing/headers'

/**
 * Why a join was refused
 */
export const RoomJoinError = {
  /**
   * The room doesn't exist
   */
  NoSuchRoom: 'RDNE',

  /**
   * The room is full
   */
  Full: 'This room is currently full',

  /**
   * The den is locked
   */
  DenLocked: 'DP',

  /**
   * There is no such den
   */
  DenGone: 'DG',

  /**
   * The den is in the ocean
   */
  DenOcean: 'DJEE',

  /**
   * The den room is in the ocean
   */
  DenOceanChange: 'DJEC',

  /**
   * The room is on another node
   */
  OtherNode: 'N',
} as const

/**
 * Why a join was refused
 */
export type RoomJoinError = (typeof RoomJoinError)[keyof typeof RoomJoinError]

/**
 * A room joined
 */
export type JoinedRoom = {
  /**
   * The instance's name
   */
  readonly name: string

  /**
   * The instance's id
   */
  readonly id: number

  /**
   * How many are in it
   */
  readonly users: number

  /**
   * How many it holds
   */
  readonly capacity: number

  /**
   * The name shown on the HUD
   */
  readonly displayName: string

  /**
   * The HUD string, or 0
   */
  readonly displayNameId: number

  /**
   * The avatar the player uses
   */
  readonly perUserAvId: number

  /**
   * Whether it is a den
   */
  readonly den?: boolean

  /**
   * The player's pet, or 0
   */
  readonly activePetInvId?: number

  /**
   * The room's song, or 0
   */
  readonly song?: number

  /**
   * The shard, or null
   */
  readonly shard?: number | null

  /**
   * The minigame
   */
  readonly game?: {
    /**
     * Whether it is played inside the room
     */
    readonly subRoom: boolean

    /**
     * The most players watching
     */
    readonly maxSpectators: number
  }
}

/**
 * Whether the player joined a room
 * @class
 */
@Packet(Outgoing.RoomJoin, 'xt')
export class RoomJoinOutgoing extends OutgoingPacket {
  /**
   * Whether the player joined
   */
  @Field.int() public readonly joined: number = 0

  /**
   * The rest
   */
  @Field.rest() public readonly body: readonly string[] = []

  /**
   * Says the player joined a room
   * @param room The room joined
   * @returns The packet
   */
  public static joinedRoom(room: JoinedRoom): RoomJoinOutgoing {
    const temporary = room.den || room.game ? 1 : 0
    const spectators = room.game?.maxSpectators ?? 0
    const body = [
      room.name,
      room.id,
      room.users,
      room.capacity,
      0,
      spectators,
      0,
      temporary,
      0,
    ]
    const details = [
      temporary,
      room.game?.subRoom ? 1 : 0,
      room.displayName,
      room.displayNameId,
      room.perUserAvId,
      room.activePetInvId ?? 0,
      0,
      room.song ?? 0,
      ...(room.shard == null ? [] : [room.shard]),
    ]

    return PacketFactory.create<RoomJoinOutgoing>(RoomJoinOutgoing, {
      room: -1,
      joined: 1,
      body: [...body, ...details].map(String),
    })
  }

  /**
   * Says the player couldn't join
   * @param room The target room
   * @param error Why
   * @param subject The subject
   * @returns The packet
   */
  public static refused(
    room: number,
    error: RoomJoinError,
    subject?: string,
  ): RoomJoinOutgoing {
    return PacketFactory.create<RoomJoinOutgoing>(RoomJoinOutgoing, {
      room,
      joined: 0,
      body: subject === undefined ? [error] : [error, subject],
    })
  }
}
