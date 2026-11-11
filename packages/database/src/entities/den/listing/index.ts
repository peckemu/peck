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
 * A stand listing
 * @class
 */
@Entity<DenShopListing>({
  name: 'den_shop_listings',
  indexes: [
    {
      name: 'den_shop_listings_stand',
      columns: (listing) => [listing.gameId, listing.storeInvIdx],
    },
  ],
  checks: [
    {
      name: 'den_shop_listings_item_kind_check',
      where: { itemKind: { $gte: 0, $lte: 2 } },
    },
    {
      name: 'den_shop_listings_currency_check',
      where: { currency: { $in: [0, 3] } },
    },
    { name: 'den_shop_listings_cost_check', where: { cost: { $gt: 0 } } },
  ],
})
export class DenShopListing {
  /**
   * The key fields
   */
  declare public [idKey]?: 'gameId' | 'itemKind' | 'itemInvIdx'

  /**
   * The fields the database fills
   */
  declare public [filledKey]?: 'listedAt'

  /**
   * The player selling it
   */
  @Id({
    type: Number,
    columnType: 'integer',
    references: () => Player,
    onDelete: 'CASCADE',
  })
  public gameId!: number

  /**
   * Den item 0, pet 1 or clothing 2
   */
  @Id({ type: Number, columnType: 'smallint' })
  public itemKind!: number

  /**
   * Its place in the seller's inventory
   */
  @Id({ type: Number, columnType: 'integer' })
  public itemInvIdx!: number

  /**
   * Its stand
   */
  @Field({ type: Number, columnType: 'integer', nullable: false })
  public storeInvIdx!: number

  /**
   * Gems 0 or diamonds 3
   */
  @Field({ type: Number, columnType: 'smallint', nullable: false })
  public currency!: number

  /**
   * What it costs
   */
  @Field({ type: Number, columnType: 'integer', nullable: false })
  public cost!: number

  /**
   * When it was listed
   */
  @Field({ type: Date, nullable: false, defaultValue: currentTimestamp })
  public listedAt!: Date

  /**
   * The player selling it
   */
  @ManyToOne({ entity: () => Player, references: (listing) => listing.gameId })
  public player?: Player
}
