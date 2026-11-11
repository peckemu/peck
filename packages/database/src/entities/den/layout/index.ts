import { Entity, Field, Id, type idKey } from 'uql-orm'

import { Player } from '#database/entities/player'

/**
 * Where something stands in a den room not in use
 * @class
 */
@Entity<DenLayout>({
  name: 'den_layouts',
  checks: [
    {
      name: 'den_layouts_den_inv_idx_check',
      where: { denInvIdx: { $gte: 0 } },
    },
    {
      name: 'den_layouts_ref_id_check',
      where: { refId: { $between: [0, 1] } },
    },
    {
      name: 'den_layouts_category_id_check',
      where: { categoryId: { $gt: 0 } },
    },
    {
      name: 'den_layouts_flipped_check',
      where: { flipped: { $between: [0, 3] } },
    },
  ],
})
export class DenLayout {
  /**
   * The key fields
   */
  declare public [idKey]?: 'gameId' | 'denInvIdx' | 'refId' | 'invIdx'

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
   * The den room's place in the player's den rooms
   */
  @Id({ type: Number, columnType: 'integer' })
  public denInvIdx!: number

  /**
   * Den item 0 or pet 1
   */
  @Id({ type: Number, columnType: 'smallint' })
  public refId!: number

  /**
   * Its place in the player's den items or pets
   */
  @Id({ type: Number, columnType: 'integer' })
  public invIdx!: number

  /**
   * Its layer
   */
  @Field({ type: Number, columnType: 'smallint', nullable: false })
  public categoryId!: number

  /**
   * Where it stands across
   */
  @Field({ type: Number, columnType: 'integer', nullable: false })
  public x!: number

  /**
   * Where it stands down
   */
  @Field({ type: Number, columnType: 'integer', nullable: false })
  public y!: number

  /**
   * How it is flipped
   */
  @Field({ type: Number, columnType: 'smallint', nullable: false })
  public flipped!: number
}
