import {
  currentTimestamp,
  Entity,
  Field,
  type filledKey,
  Id,
  type idKey,
  ManyToOne,
  sql,
} from 'uql-orm'

import { Player } from '#database/entities/player'

/**
 * The largest colour value
 */
const UINT32_MAX = 4_294_967_295

/**
 * One of a player's animals
 * @class
 */
@Entity<Avatar>({
  name: 'avatars',
  indexes: [
    {
      name: 'avatars_slot',
      unique: true,
      columns: (avatar) => [avatar.gameId, avatar.avInvId],
    },
    {
      name: 'avatars_one_active',
      unique: true,
      columns: (avatar) => [avatar.gameId],
      where: { active: true },
    },
  ],
  checks: [
    {
      name: 'avatars_av_inv_id_check',
      where: { avInvId: { $between: [0, 999] } },
    },
    {
      name: 'avatars_per_user_av_id_check',
      where: { perUserAvId: { $gt: 0 } },
    },
    {
      name: 'avatars_av_name_check',
      where: (avatar) => sql`char_length(${avatar.avName}) BETWEEN 1 AND 60`,
    },
    {
      name: 'avatars_color1_check',
      where: { color1: { $between: [0, UINT32_MAX] } },
    },
    {
      name: 'avatars_color2_check',
      where: { color2: { $between: [0, UINT32_MAX] } },
    },
    {
      name: 'avatars_color3_check',
      where: { color3: { $between: [0, UINT32_MAX] } },
    },
  ],
})
export class Avatar {
  /**
   * The key fields
   */
  declare public [idKey]?: 'gameId' | 'perUserAvId'

  /**
   * The fields the database fills
   */
  declare public [filledKey]?:
    | 'customAvId'
    | 'patternDefId'
    | 'questLevel'
    | 'questXp'
    | 'active'
    | 'landPetInvIdx'
    | 'oceanPetInvIdx'
    | 'createdAt'

  /**
   * The owner
   */
  @Id({
    type: Number,
    columnType: 'integer',
    references: () => Player,
    onDelete: 'CASCADE',
  })
  public gameId!: number

  /**
   * Its id among the player's animals
   */
  @Id({ type: Number, columnType: 'integer' })
  public perUserAvId!: number

  /**
   * Its slot
   */
  @Field({ type: Number, columnType: 'integer', nullable: false })
  public avInvId!: number

  /**
   * The kind of animal
   */
  @Field({ type: Number, columnType: 'integer', nullable: false })
  public avTypeId!: number

  /**
   * The custom animal, or -1
   */
  @Field({
    type: Number,
    columnType: 'integer',
    nullable: false,
    defaultValue: -1,
  })
  public customAvId!: number

  /**
   * The first colour
   */
  @Field({ type: Number, columnType: 'bigint', nullable: false })
  public color1!: number

  /**
   * The second colour
   */
  @Field({ type: Number, columnType: 'bigint', nullable: false })
  public color2!: number

  /**
   * The third colour
   */
  @Field({ type: Number, columnType: 'bigint', nullable: false })
  public color3!: number

  /**
   * Its name
   */
  @Field({ type: 'text', nullable: false })
  public avName!: string

  /**
   * The eyes it wears
   */
  @Field({ type: Number, columnType: 'integer', nullable: false })
  public eyesDefId!: number

  /**
   * Its pattern, or 0
   */
  @Field({
    type: Number,
    columnType: 'integer',
    nullable: false,
    defaultValue: 0,
  })
  public patternDefId!: number

  /**
   * Its adventure level
   */
  @Field({
    type: Number,
    columnType: 'integer',
    nullable: false,
    defaultValue: 0,
  })
  public questLevel!: number

  /**
   * Its adventure experience
   */
  @Field({
    type: Number,
    columnType: 'integer',
    nullable: false,
    defaultValue: 0,
  })
  public questXp!: number

  /**
   * Whether it is the current animal
   */
  @Field({ type: Boolean, nullable: false, defaultValue: false })
  public active!: boolean

  /**
   * The land pet, or 0
   */
  @Field({
    type: Number,
    columnType: 'integer',
    nullable: false,
    defaultValue: 0,
  })
  public landPetInvIdx!: number

  /**
   * The ocean pet, or 0
   */
  @Field({
    type: Number,
    columnType: 'integer',
    nullable: false,
    defaultValue: 0,
  })
  public oceanPetInvIdx!: number

  /**
   * When it was made
   */
  @Field({ type: Date, nullable: false, defaultValue: currentTimestamp })
  public createdAt!: Date

  /**
   * The owner
   */
  @ManyToOne({ entity: () => Player, references: (avatar) => avatar.gameId })
  public player?: Player
}
