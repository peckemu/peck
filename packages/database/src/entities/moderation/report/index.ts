import {
  currentTimestamp,
  Entity,
  Field,
  type filledKey,
  Id,
  type idKey,
  ManyToOne,
  uuid,
} from 'uql-orm'

import { Account } from '#database/entities/accounts/account'
import { Player } from '#database/entities/player'

/**
 * A report's status
 */
export const REPORT_STATUSES = ['open', 'resolved'] as const

/**
 * A report's status
 */
export type ReportStatus = (typeof REPORT_STATUSES)[number]

/**
 * A player reporting another
 * @class
 */
@Entity<Report>({
  name: 'reports',
  indexes: [
    {
      name: 'reports_status',
      columns: (report) => [report.status, report.createdAt],
    },
  ],
})
export class Report {
  /**
   * The key field
   */
  declare public [idKey]?: 'id'

  /**
   * The fields the database fills
   */
  declare public [filledKey]?:
    'id' | 'dataType' | 'data' | 'roomName' | 'status' | 'createdAt'

  /**
   * Its id
   */
  @Id({ type: 'uuid', defaultValue: uuid })
  public id!: string

  /**
   * The player reporting
   */
  @Field({
    type: Number,
    columnType: 'integer',
    nullable: false,
    references: () => Player,
    onDelete: 'CASCADE',
  })
  public reporterGameId!: number

  /**
   * The player reported
   */
  @Field({
    type: Number,
    columnType: 'integer',
    nullable: false,
    references: () => Player,
    onDelete: 'CASCADE',
  })
  public reportedGameId!: number

  /**
   * The rule broken
   */
  @Field({ type: Number, columnType: 'integer', nullable: false })
  public reasonId!: number

  /**
   * The kind of thing reported
   */
  @Field({
    type: Number,
    columnType: 'integer',
    nullable: false,
    defaultValue: 0,
  })
  public dataType!: number

  /**
   * The thing reported
   */
  @Field({ type: 'text', nullable: false, defaultValue: '' })
  public data!: string

  /**
   * The reporter's room
   */
  @Field({ type: 'text', nullable: false, defaultValue: '' })
  public roomName!: string

  /**
   * Its status
   */
  @Field({
    type: 'text',
    nullable: false,
    enum: REPORT_STATUSES,
    defaultValue: 'open',
  })
  public status!: ReportStatus

  /**
   * When it was made
   */
  @Field({ type: Date, nullable: false, defaultValue: currentTimestamp })
  public createdAt!: Date

  /**
   * When staff resolved it
   */
  @Field({ type: Date, nullable: true })
  public resolvedAt?: Date | null

  /**
   * The staff account resolving it
   */
  @Field({ references: () => Account, nullable: true, onDelete: 'SET NULL' })
  public resolvedBy?: string | null

  /**
   * The player reporting
   */
  @ManyToOne({
    entity: () => Player,
    references: (report) => report.reporterGameId,
  })
  public reporter?: Player

  /**
   * The player reported
   */
  @ManyToOne({
    entity: () => Player,
    references: (report) => report.reportedGameId,
  })
  public reported?: Player
}
