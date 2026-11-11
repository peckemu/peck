import { Entity, Field, Id, type idKey } from 'uql-orm'

/**
 * A referral treasure
 * @class
 */
@Entity<ReferralLevel>({ name: 'referral_levels' })
export class ReferralLevel {
  /**
   * The key field
   */
  declare public [idKey]?: 'level'

  /**
   * The treasure, from 1
   */
  @Id({ type: Number, columnType: 'smallint' })
  public level!: number

  /**
   * The referrals it takes
   */
  @Field({ type: Number, columnType: 'integer', nullable: false })
  public referrals!: number

  /**
   * The code whose rewards it gives, or null
   */
  @Field({ type: 'text', nullable: true })
  public code?: string | null
}
