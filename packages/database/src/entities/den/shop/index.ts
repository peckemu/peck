import {
  Entity,
  Field,
  type filledKey,
  Id,
  type idKey,
  ManyToOne,
} from 'uql-orm'

import { Player } from '#database/entities/player'

/**
 * A den shop stand
 * @class
 */
@Entity<DenShop>({
  name: 'den_shops',
  checks: [{ name: 'den_shops_state_check', where: { state: { $gte: 0 } } }],
})
export class DenShop {
  /**
   * The key fields
   */
  declare public [idKey]?: 'gameId' | 'storeInvIdx'

  /**
   * The fields the database fills
   */
  declare public [filledKey]?: 'state'

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
   * The stand's den item place
   */
  @Id({ type: Number, columnType: 'integer' })
  public storeInvIdx!: number

  /**
   * How many times it has changed
   */
  @Field({
    type: Number,
    columnType: 'integer',
    nullable: false,
    defaultValue: 0,
  })
  public state!: number

  /**
   * The owner
   */
  @ManyToOne({ entity: () => Player, references: (shop) => shop.gameId })
  public player?: Player
}
