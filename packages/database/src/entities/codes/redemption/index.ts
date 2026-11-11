import {
  currentTimestamp,
  Entity,
  Field,
  type filledKey,
  Id,
  type idKey,
} from 'uql-orm'

import { Account } from '#database/entities/accounts/account'
import { RedemptionCode } from '#database/entities/codes/code'
import { Player } from '#database/entities/player'

/**
 * An account using a gift code
 * @class
 */
@Entity<CodeRedemption>({ name: 'code_redemptions' })
export class CodeRedemption {
  /**
   * The key fields
   */
  declare public [idKey]?: 'code' | 'accountId'

  /**
   * The fields the database fills
   */
  declare public [filledKey]?: 'redeemedAt'

  /**
   * The code
   */
  @Id({ type: 'text', references: () => RedemptionCode, onDelete: 'CASCADE' })
  public code!: string

  /**
   * The account
   */
  @Id({ type: 'uuid', references: () => Account, onDelete: 'CASCADE' })
  public accountId!: string

  /**
   * The player who used it
   */
  @Field({
    type: Number,
    columnType: 'integer',
    nullable: false,
    references: () => Player,
    onDelete: 'CASCADE',
  })
  public gameId!: number

  /**
   * When it was used
   */
  @Field({ type: Date, nullable: false, defaultValue: currentTimestamp })
  public redeemedAt!: Date
}
