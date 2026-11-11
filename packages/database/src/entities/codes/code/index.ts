import {
  currentTimestamp,
  Entity,
  Field,
  type filledKey,
  Id,
  type idKey,
  type Json,
} from 'uql-orm'

/**
 * A thing a code gives
 */
export type CodeItem = {
  /**
   * The kind of thing
   */
  readonly kind: 'clothing' | 'den-item'

  /**
   * Its definition id
   */
  readonly defId: number

  /**
   * The clothing colour
   */
  readonly color: number
}

/**
 * A gift code
 * @class
 */
@Entity<RedemptionCode>({ name: 'codes' })
export class RedemptionCode {
  /**
   * The key field
   */
  declare public [idKey]?: 'code'

  /**
   * The fields the database fills
   */
  declare public [filledKey]?:
    | 'gems'
    | 'diamonds'
    | 'membershipDays'
    | 'items'
    | 'uses'
    | 'verifiedOnly'
    | 'createdAt'

  /**
   * The code
   */
  @Id({ type: 'text' })
  public code!: string

  /**
   * The gems it gives
   */
  @Field({
    type: Number,
    columnType: 'integer',
    nullable: false,
    defaultValue: 0,
  })
  public gems!: number

  /**
   * The diamonds it gives
   */
  @Field({
    type: Number,
    columnType: 'integer',
    nullable: false,
    defaultValue: 0,
  })
  public diamonds!: number

  /**
   * The membership days it gives
   */
  @Field({
    type: Number,
    columnType: 'integer',
    nullable: false,
    defaultValue: 0,
  })
  public membershipDays!: number

  /**
   * The things it gives
   */
  @Field({ type: 'jsonb', nullable: false, defaultValue: [] })
  public items!: Json<CodeItem[]>

  /**
   * How many times it can be used, or null
   */
  @Field({ type: Number, columnType: 'integer', nullable: true })
  public maxUses?: number | null

  /**
   * How many times it was used
   */
  @Field({
    type: Number,
    columnType: 'integer',
    nullable: false,
    defaultValue: 0,
  })
  public uses!: number

  /**
   * When it stops working, or null
   */
  @Field({ type: Date, nullable: true })
  public expiresAt?: Date | null

  /**
   * Whether it needs a confirmed email
   */
  @Field({ type: Boolean, nullable: false, defaultValue: false })
  public verifiedOnly!: boolean

  /**
   * When it was made
   */
  @Field({ type: Date, nullable: false, defaultValue: currentTimestamp })
  public createdAt!: Date
}
