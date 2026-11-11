import { Field, OutgoingPacket, Packet, PacketFactory } from '@peck/protocol'

import { Outgoing } from '#packets/outgoing/headers'

/**
 * A minigame view
 */
export type DescribedMinigame = {
  /**
   * The game's id
   */
  readonly defId: number

  /**
   * Its name string id
   */
  readonly titleStrId: number

  /**
   * The server extension it runs on
   */
  readonly extName: string

  /**
   * The game movie
   */
  readonly swfName: string

  /**
   * The fewest players
   */
  readonly minPlayers: number

  /**
   * The most players it holds
   */
  readonly maxPlayers: number

  /**
   * The most players watching
   */
  readonly maxSpectators: number

  /**
   * The game type
   */
  readonly type: number

  /**
   * Its card picture
   */
  readonly gameCardMediaId: number

  /**
   * The user variable counting plays
   */
  readonly gameCountUserVarRef: number

  /**
   * A user variable of its own
   */
  readonly custom1UserVarRef: number

  /**
   * Another user variable of its own
   */
  readonly custom2UserVarRef: number

  /**
   * Whether it is played against another player
   */
  readonly readyForPvp: boolean

  /**
   * Its gem multiplier
   */
  readonly gemMultiplier: number

  /**
   * The needed pet, or 0
   */
  readonly petDefId: number

  /**
   * The user variable unlocking pro mode
   */
  readonly proModeUserVarRefId: number

  /**
   * The user variable its scores go in
   */
  readonly leaderboardUserVarRef: number

  /**
   * Its icon in the game library
   */
  readonly gameLibraryIconMediaId: number

  /**
   * 1 land, 2 ocean, or 0
   */
  readonly requiredAvatarType: number
}

/**
 * Minigames
 * @class
 */
@Packet(Outgoing.MinigameInfo, 'xt')
export class MinigameInfoOutgoing extends OutgoingPacket {
  /**
   * How many games follow
   */
  @Field.int() public readonly count: number = 0

  /**
   * The games
   */
  @Field.rest() public readonly body: readonly string[] = []

  /**
   * Describes minigames
   * @param room The target room
   * @param games The games
   * @returns The packet
   */
  public static of(
    room: number,
    games: readonly DescribedMinigame[],
  ): MinigameInfoOutgoing {
    const body = games.flatMap((game) => [
      String(game.defId),
      String(game.titleStrId),
      game.extName,
      game.swfName,
      String(game.minPlayers),
      String(game.maxPlayers),
      String(game.maxSpectators),
      String(game.type),
      String(game.gameCardMediaId),
      String(game.gameCountUserVarRef),
      String(game.custom1UserVarRef),
      String(game.custom2UserVarRef),
      game.readyForPvp ? '1' : '0',
      String(game.gemMultiplier),
      String(game.petDefId),
      String(game.proModeUserVarRefId),
      String(game.leaderboardUserVarRef),
      String(game.gameLibraryIconMediaId),
      String(game.requiredAvatarType),
    ])

    return PacketFactory.create<MinigameInfoOutgoing>(MinigameInfoOutgoing, {
      room,
      count: games.length,
      body,
    })
  }
}
