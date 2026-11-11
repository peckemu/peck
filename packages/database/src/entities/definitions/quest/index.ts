import {
  Entity,
  Field,
  type filledKey,
  Id,
  type idKey,
  type Json,
} from 'uql-orm'

/**
 * An adventure prize as stored
 */
export type StoredPrize = {
  /**
   * What it is
   */
  readonly kind: number

  /**
   * The item or the amount
   */
  readonly value: number

  /**
   * The clothing colour
   */
  readonly color?: number
}

/**
 * An adventure actor as stored
 */
export type StoredActor = {
  /**
   * Its id
   */
  readonly actorId: string

  /**
   * Its type
   */
  readonly type: number

  /**
   * Its definition
   */
  readonly defId?: number

  /**
   * Its definition's name
   */
  readonly defName?: string

  /**
   * Its state
   */
  readonly state?: number

  /**
   * Whether it shows
   */
  readonly visible?: boolean

  /**
   * Whether it needs a click
   */
  readonly requireClick?: boolean

  /**
   * The path it walks
   */
  readonly pathName?: string

  /**
   * Its animation state
   */
  readonly swfState?: string

  /**
   * What it gives
   */
  readonly prize?: StoredPrize | null

  /**
   * The experience it gives
   */
  readonly xp?: number

  /**
   * Its health
   */
  readonly health?: number

  /**
   * Whether its prize is for members
   */
  readonly membersOnly?: boolean
}

/**
 * An adventure
 * @class
 */
@Entity<QuestDefinition>({ name: 'quest_definitions' })
export class QuestDefinition {
  /**
   * The key field
   */
  declare public [idKey]?: 'defId'

  /**
   * The fields the database fills
   */
  declare public [filledKey]?:
    | 'titleStrId'
    | 'roomDefId'
    | 'avatarLimit'
    | 'avatarMin'
    | 'levelMin'
    | 'hardLevelMin'
    | 'membersOnly'
    | 'avatarType'
    | 'giftActor'
    | 'popupType'
    | 'crystalGoal'
    | 'music'

  /**
   * The adventure's script id
   */
  @Id({ type: Number, columnType: 'integer' })
  public defId!: number

  /**
   * Its name string id
   */
  @Field({
    type: Number,
    columnType: 'integer',
    nullable: false,
    defaultValue: 0,
  })
  public titleStrId!: number

  /**
   * The room it starts in
   */
  @Field({
    type: Number,
    columnType: 'integer',
    nullable: false,
    defaultValue: 0,
  })
  public roomDefId!: number

  /**
   * The most players
   */
  @Field({
    type: Number,
    columnType: 'smallint',
    nullable: false,
    defaultValue: 4,
  })
  public avatarLimit!: number

  /**
   * The fewest players
   */
  @Field({
    type: Number,
    columnType: 'smallint',
    nullable: false,
    defaultValue: 1,
  })
  public avatarMin!: number

  /**
   * The lowest level
   */
  @Field({
    type: Number,
    columnType: 'smallint',
    nullable: false,
    defaultValue: 0,
  })
  public levelMin!: number

  /**
   * The lowest level for hard mode
   */
  @Field({
    type: Number,
    columnType: 'smallint',
    nullable: false,
    defaultValue: 0,
  })
  public hardLevelMin!: number

  /**
   * Whether it is for members
   */
  @Field({ type: Boolean, nullable: false, defaultValue: false })
  public membersOnly!: boolean

  /**
   * Any 0, land 1 or ocean 2
   */
  @Field({
    type: Number,
    columnType: 'smallint',
    nullable: false,
    defaultValue: 0,
  })
  public avatarType!: number

  /**
   * The actors it starts with
   */
  @Field({ type: 'jsonb', nullable: false })
  public actors!: Json<StoredActor[]>

  /**
   * The gifts at the end
   */
  @Field({ type: 'jsonb', nullable: false })
  public gifts!: Json<StoredPrize[]>

  /**
   * The actor that opens the gifts
   */
  @Field({ type: 'text', nullable: false, defaultValue: '' })
  public giftActor!: string

  /**
   * The gift screen's look
   */
  @Field({
    type: Number,
    columnType: 'smallint',
    nullable: false,
    defaultValue: 0,
  })
  public popupType!: number

  /**
   * The crystals needed for the gifts
   */
  @Field({
    type: Number,
    columnType: 'integer',
    nullable: false,
    defaultValue: 0,
  })
  public crystalGoal!: number

  /**
   * The music
   */
  @Field({ type: 'text', nullable: false, defaultValue: '' })
  public music!: string

  /**
   * The sound packs it loads
   */
  @Field({ type: 'jsonb', nullable: false })
  public soundPacks!: Json<number[]>
}
