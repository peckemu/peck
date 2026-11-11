import { type SqlQuerier } from 'uql-orm'

import {
  AuditEntry,
  type AuditAction,
  type AuditTarget,
} from '#database/entities/access/audit'
import { type Database } from '#database/pool'

/**
 * An audit row being written
 */
export type AuditInput = {
  /**
   * Who did it
   */
  readonly actorId: string

  /**
   * What they did
   */
  readonly action: AuditAction

  /**
   * The target's kind
   */
  readonly targetKind: AuditTarget

  /**
   * The target's id
   */
  readonly targetId: string

  /**
   * The target's name
   */
  readonly targetName: string

  /**
   * The details
   */
  readonly detail?: Record<string, unknown>
}

/**
 * Writes an audit row
 * @param querier The querier
 * @param entry The row
 */
export const writeAudit = async (
  querier: SqlQuerier | Database,
  entry: AuditInput,
): Promise<void> => {
  await querier.insertOne(AuditEntry, { ...entry, detail: entry.detail ?? {} })
}

/**
 * Reads and writes the audit log
 * @class
 */
export class AuditRepository {
  /**
   * The database
   */
  private readonly database: Database

  /**
   * Creates the repository
   * @param database The database
   */
  public constructor(database: Database) {
    this.database = database
  }

  /**
   * Records a change
   * @param entry The change
   */
  public async record(entry: AuditInput): Promise<void> {
    await writeAudit(this.database, entry)
  }

  /**
   * Lists the audit log
   * @param limit The page size
   * @param offset The entries to skip
   * @returns The newest entries
   */
  public async list(limit: number, offset: number): Promise<AuditEntry[]> {
    return this.database.findMany(AuditEntry, {
      $sort: { at: 'desc' },
      $limit: limit,
      $skip: offset,
    })
  }
}
