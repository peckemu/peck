import { Entity, Field, type filledKey, Id, type idKey } from 'uql-orm'

/**
 * How often a party comes round
 */
export const PARTY_REPEATS = ['none', 'daily', 'weekly', 'yearly'] as const

/**
 * How often a party comes round
 */
export type PartyRepeat = (typeof PARTY_REPEATS)[number]

/**
 * When a party is on
 * @class
 */
@Entity<PartySchedule>({
  name: 'party_schedule',
  checks: [
    { name: 'party_schedule_def_id_check', where: { partyDefId: { $gt: 0 } } },
  ],
})
export class PartySchedule {
  /**
   * The key field
   */
  declare public [idKey]?: 'id'

  /**
   * The fields the database fills
   */
  declare public [filledKey]?: 'id' | 'membersOnly'

  /**
   * The entry's id
   */
  @Id({ type: Number, columnType: 'integer', autoIncrement: true })
  public id!: number

  /**
   * The party
   */
  @Field({ type: Number, columnType: 'integer', nullable: false })
  public partyDefId!: number

  /**
   * When it first starts
   */
  @Field({ type: Date, nullable: false })
  public startsAt!: Date

  /**
   * When it first ends
   */
  @Field({ type: Date, nullable: false })
  public endsAt!: Date

  /**
   * How often it comes round
   */
  @Field({ type: 'text', nullable: false, enum: PARTY_REPEATS })
  public repeat!: PartyRepeat

  /**
   * Whether only members can come
   */
  @Field({ type: Boolean, nullable: false, defaultValue: false })
  public membersOnly!: boolean
}
