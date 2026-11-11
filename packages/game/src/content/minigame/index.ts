import { Catalogue } from '#game/catalogue'

/**
 * A minigame
 */
export type MinigameTemplate = {
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
 * Every minigame
 * @class
 */
export class MinigameCatalogue extends Catalogue<MinigameTemplate> {}
