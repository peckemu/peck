import {
  currentTimestamp,
  Entity,
  Field,
  type filledKey,
  Id,
  type idKey,
  ManyToOne,
} from 'uql-orm'

import { Player } from '#database/entities/player'

/**
 * A clothing item a player owns
 * @class
 */
@Entity<Item>({
  name: 'items',
  indexes: [{ name: 'items_def', columns: (item) => [item.defId] }],
  checks: [
    { name: 'items_inv_id_check', where: { invId: { $gt: 0 } } },
    {
      name: 'items_color_check',
      where: { color: { $gte: 0, $lte: 4_294_967_295 } },
    },
    {
      name: 'items_equipped_avatars_check',
      where: { equippedAvatars: { $regex: '^[0-9]+(,[0-9]+)*$' } },
    },
  ],
})
export class Item {
  /**
   * The key fields
   */
  declare public [idKey]?: 'gameId' | 'invId'

  /**
   * The fields the database fills
   */
  declare public [filledKey]?:
    'color' | 'equippedAvatars' | 'denStoreInvIdx' | 'createdAt'

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
   * Its place in the player's inventory
   */
  @Id({ type: Number, columnType: 'integer' })
  public invId!: number

  /**
   * The item's definition id
   */
  @Field({ type: Number, columnType: 'integer', nullable: false })
  public defId!: number

  /**
   * The item's colour
   */
  @Field({
    type: Number,
    columnType: 'bigint',
    nullable: false,
    defaultValue: 0,
  })
  public color!: number

  /**
   * The avatars wearing it
   */
  @Field({ type: 'text', nullable: false, defaultValue: '0' })
  public equippedAvatars!: string

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
