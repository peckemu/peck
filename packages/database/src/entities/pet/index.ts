import {
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
 * A pet a player owns
 * @class
 */
@Entity<Pet>({
  name: 'pets',
  checks: [
    { name: 'pets_inv_idx_check', where: { invIdx: { $gt: 0 } } },
    {
      name: 'pets_name_check',
      where: (pet) => sql`char_length(${pet.name}) <= 60`,
    },
    {
      name: 'pets_l_bits_check',
      where: { lBits: { $gte: 0, $lte: 4_294_967_295 } },
    },
    {
      name: 'pets_u_bits_check',
      where: { uBits: { $gte: 0, $lte: 4_294_967_295 } },
    },
    {
      name: 'pets_e_bits_check',
      where: { eBits: { $gte: 0, $lte: 4_294_967_295 } },
    },
    {
      name: 'pets_den_flipped_check',
      where: { denFlipped: { $gte: 0, $lte: 3 } },
    },
  ],
})
export class Pet {
  /**
   * The key fields
   */
  declare public [idKey]?: 'gameId' | 'invIdx'

  /**
   * The fields the database fills
   */
  declare public [filledKey]?:
    | 'uBits'
    | 'eBits'
    | 'masteryCounter'
    | 'personalityDefId'
    | 'favoriteToyDefId'
    | 'favoriteFoodDefId'
    | 'denStoreInvIdx'
    | 'denCategoryId'
    | 'denX'
    | 'denY'
    | 'denFlipped'

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
   * Its place in the player's pets
   */
  @Id({ type: Number, columnType: 'integer' })
  public invIdx!: number

  /**
   * The adoption time in seconds
   */
  @Field({ type: Number, columnType: 'bigint', nullable: false })
  public createdTs!: number

  /**
   * Its name
   */
  @Field({ type: 'text', nullable: false })
  public name!: string

  /**
   * Its look
   */
  @Field({ type: Number, columnType: 'bigint', nullable: false })
  public lBits!: number

  /**
   * Extra traits
   */
  @Field({
    type: Number,
    columnType: 'bigint',
    nullable: false,
    defaultValue: 0,
  })
  public uBits!: number

  /**
   * Unused look bits
   */
  @Field({
    type: Number,
    columnType: 'bigint',
    nullable: false,
    defaultValue: 0,
  })
  public eBits!: number

  /**
   * Its mastery points
   */
  @Field({
    type: Number,
    columnType: 'bigint',
    nullable: false,
    defaultValue: 0,
  })
  public masteryCounter!: number

  /**
   * Its personality
   */
  @Field({
    type: Number,
    columnType: 'integer',
    nullable: false,
    defaultValue: 0,
  })
  public personalityDefId!: number

  /**
   * Its favourite toy
   */
  @Field({
    type: Number,
    columnType: 'integer',
    nullable: false,
    defaultValue: 0,
  })
  public favoriteToyDefId!: number

  /**
   * Its favourite food
   */
  @Field({
    type: Number,
    columnType: 'integer',
    nullable: false,
    defaultValue: 0,
  })
  public favoriteFoodDefId!: number

  /**
   * The den shop listing, or 0
   */
  @Field({
    type: Number,
    columnType: 'integer',
    nullable: false,
    defaultValue: 0,
  })
  public denStoreInvIdx!: number

  /**
   * Its place, or 0
   */
  @Field({
    type: Number,
    columnType: 'smallint',
    nullable: false,
    defaultValue: 0,
  })
  public denCategoryId!: number

  /**
   * Where it stands across in the den
   */
  @Field({
    type: Number,
    columnType: 'integer',
    nullable: false,
    defaultValue: 0,
  })
  public denX!: number

  /**
   * Where it stands down in the den
   */
  @Field({
    type: Number,
    columnType: 'integer',
    nullable: false,
    defaultValue: 0,
  })
  public denY!: number

  /**
   * How it is flipped in the den
   */
  @Field({
    type: Number,
    columnType: 'smallint',
    nullable: false,
    defaultValue: 0,
  })
  public denFlipped!: number

  /**
   * The owner
   */
  @ManyToOne({ entity: () => Player, references: (pet) => pet.gameId })
  public player?: Player
}
