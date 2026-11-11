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
 * A den item a player owns
 * @class
 */
@Entity<DenItem>({
  name: 'den_items',
  checks: [
    { name: 'den_items_inv_idx_check', where: { invIdx: { $gte: 0 } } },
    { name: 'den_items_category_id_check', where: { categoryId: { $gte: 0 } } },
    {
      name: 'den_items_user_name_link_check',
      where: (item) => sql`char_length(${item.userNameLink}) <= 60`,
    },
    {
      name: 'den_items_eco_consumer_state_check',
      where: { ecoConsumerState: { $between: [0, 2] } },
    },
  ],
})
export class DenItem {
  /**
   * The key fields
   */
  declare public [idKey]?: 'gameId' | 'invIdx'

  /**
   * The fields the database fills
   */
  declare public [filledKey]?:
    | 'categoryId'
    | 'x'
    | 'y'
    | 'flipped'
    | 'version'
    | 'userNameLink'
    | 'denStoreInvIdx'
    | 'ecoConsumerState'
    | 'uniqueImageId'
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
   * Its place in the player's den items
   */
  @Id({ type: Number, columnType: 'integer' })
  public invIdx!: number

  /**
   * The den item's definition id
   */
  @Field({ type: Number, columnType: 'integer', nullable: false })
  public defId!: number

  /**
   * Its layer, or 0
   */
  @Field({
    type: Number,
    columnType: 'smallint',
    nullable: false,
    defaultValue: 0,
  })
  public categoryId!: number

  /**
   * Where it stands across
   */
  @Field({
    type: Number,
    columnType: 'integer',
    nullable: false,
    defaultValue: 0,
  })
  public x!: number

  /**
   * Where it stands down
   */
  @Field({
    type: Number,
    columnType: 'integer',
    nullable: false,
    defaultValue: 0,
  })
  public y!: number

  /**
   * Whether it is flipped
   */
  @Field({ type: Boolean, nullable: false, defaultValue: false })
  public flipped!: boolean

  /**
   * Its drawn look
   */
  @Field({
    type: Number,
    columnType: 'smallint',
    nullable: false,
    defaultValue: 0,
  })
  public version!: number

  /**
   * The den door's owner
   */
  @Field({ type: 'text', nullable: false, defaultValue: '' })
  public userNameLink!: string

  /**
   * Its masterpiece
   */
  @Field({ type: 'text', nullable: false, defaultValue: '' })
  public uniqueImageId!: string

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
   * Its eco switch
   */
  @Field({
    type: Number,
    columnType: 'smallint',
    nullable: false,
    defaultValue: 0,
  })
  public ecoConsumerState!: number

  /**
   * When the player got it
   */
  @Field({ type: Date, nullable: false, defaultValue: currentTimestamp })
  public createdAt!: Date

  /**
   * The owner
   */
  @ManyToOne({ entity: () => Player, references: (item) => item.gameId })
  public player?: Player
}
