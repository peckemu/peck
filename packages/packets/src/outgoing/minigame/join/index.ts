import { Field, OutgoingPacket, Packet, PacketFactory } from '@peck/protocol'

import { Outgoing } from '#packets/outgoing/headers'

/**
 * Why a minigame was refused
 */
export const MinigameRefusal = {
  /**
   * Needs a pet out
   */
  Pet: 'pf',

  /**
   * Not this animal
   */
  Animal: 'as',
} as const

export type MinigameRefusal =
  (typeof MinigameRefusal)[keyof typeof MinigameRefusal]

/**
 * Who is playing
 * @class
 */
@Packet(Outgoing.MinigameJoin, 'xt')
export class MinigameJoinOutgoing extends OutgoingPacket {
  /**
   * The players
   */
  @Field.rest() public readonly body: readonly string[] = []

  /**
   * Lists who is playing
   * @param room The game's room
   * @param userIds The players' session ids
   * @returns The packet
   */
  public static players(
    room: number,
    userIds: readonly number[],
  ): MinigameJoinOutgoing {
    return PacketFactory.create<MinigameJoinOutgoing>(MinigameJoinOutgoing, {
      room,
      body: userIds.map(String),
    })
  }

  /**
   * Refuses a game
   * @param room The target room
   * @param refusal Why
   * @param value Its value
   * @returns The packet
   */
  public static refused(
    room: number,
    refusal: MinigameRefusal,
    value: number,
  ): MinigameJoinOutgoing {
    return PacketFactory.create<MinigameJoinOutgoing>(MinigameJoinOutgoing, {
      room,
      body: [refusal, String(value)],
    })
  }
}
