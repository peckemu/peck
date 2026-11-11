import { Entity, Field, Id, type idKey } from 'uql-orm'

/**
 * A minigame
 * @class
 */
@Entity<MinigameDefinition>({ name: 'minigame_definitions' })
export class MinigameDefinition {
  /**
   * The key field
   */
  declare public [idKey]?: 'defId'

  /**
   * The game's id
   */
  @Id({ type: Number, columnType: 'integer' })
  public defId!: number

  /**
   * Its name string id
   */
  @Field({ type: Number, columnType: 'integer', nullable: false })
  public titleStrId!: number

  /**
   * The server extension it runs on
   */
  @Field({ type: 'text', nullable: false })
  public extName!: string

  /**
   * The game movie
   */
  @Field({ type: 'text', nullable: false })
  public swfName!: string

  /**
   * The fewest players
   */
  @Field({ type: Number, columnType: 'integer', nullable: false })
  public minPlayers!: number

  /**
   * The most players it holds
   */
  @Field({ type: Number, columnType: 'integer', nullable: false })
  public maxPlayers!: number

  /**
   * The most players watching
   */
  @Field({ type: Number, columnType: 'integer', nullable: false })
  public maxSpectators!: number

  /**
   * The game type
   */
  @Field({ type: Number, columnType: 'integer', nullable: false })
  public type!: number

  /**
   * Its card picture
   */
  @Field({ type: Number, columnType: 'integer', nullable: false })
  public gameCardMediaId!: number

  /**
   * The user variable counting plays
   */
  @Field({ type: Number, columnType: 'integer', nullable: false })
  public gameCountUserVarRef!: number

  /**
   * A user variable of its own
   */
  @Field({ type: Number, columnType: 'integer', nullable: false })
  public custom1UserVarRef!: number

  /**
   * Another user variable of its own
   */
  @Field({ type: Number, columnType: 'integer', nullable: false })
  public custom2UserVarRef!: number

  /**
   * Whether it is played against another player
   */
  @Field({ type: Boolean, nullable: false })
  public readyForPvp!: boolean

  /**
   * Its gem multiplier
   */
  @Field({ type: Number, columnType: 'double precision', nullable: false })
  public gemMultiplier!: number

  /**
   * The needed pet, or 0
   */
  @Field({ type: Number, columnType: 'integer', nullable: false })
  public petDefId!: number

  /**
   * The user variable unlocking pro mode
   */
  @Field({ type: Number, columnType: 'integer', nullable: false })
  public proModeUserVarRefId!: number

  /**
   * The user variable its scores go in
   */
  @Field({ type: Number, columnType: 'integer', nullable: false })
  public leaderboardUserVarRef!: number

  /**
   * Its icon in the game library
   */
  @Field({ type: Number, columnType: 'integer', nullable: false })
  public gameLibraryIconMediaId!: number

  /**
   * 1 land, 2 ocean, or 0
   */
  @Field({ type: Number, columnType: 'integer', nullable: false })
  public requiredAvatarType!: number
}
