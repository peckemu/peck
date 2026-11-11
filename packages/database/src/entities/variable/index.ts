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
 * A player variable
 * @class
 */
@Entity<UserVariable>({
  name: 'user_vars',
  checks: [{ name: 'user_vars_var_id_check', where: { varId: { $gt: 0 } } }],
})
export class UserVariable {
  /**
   * The key fields
   */
  declare public [idKey]?: 'gameId' | 'varId'

  /**
   * The fields the database fills
   */
  declare public [filledKey]?: 'type' | 'updatedAt'

  /**
   * The player the value belongs to
   */
  @Id({
    type: Number,
    columnType: 'integer',
    references: () => Player,
    onDelete: 'CASCADE',
  })
  public gameId!: number

  /**
   * The variable's id
   */
  @Id({ type: Number, columnType: 'integer' })
  public varId!: number

  /**
   * The kind of value
   */
  @Field({
    type: Number,
    columnType: 'smallint',
    nullable: false,
    defaultValue: 0,
  })
  public type!: number

  /**
   * The value
   */
  @Field({ type: Number, columnType: 'double precision', nullable: false })
  public value!: number

  /**
   * When the value was last changed
   */
  @Field({
    type: Date,
    nullable: false,
    defaultValue: currentTimestamp,
    onUpdate: () => new Date(),
  })
  public updatedAt!: Date

  /**
   * The player the value belongs to
   */
  @ManyToOne({
    entity: () => Player,
    references: (variable) => variable.gameId,
  })
  public player?: Player
}
