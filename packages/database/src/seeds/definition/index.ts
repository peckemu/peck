import { join } from 'node:path'

import {
  type EntityWrite,
  type QueryConflictPaths,
  type SqlQuerier,
  type Type,
} from 'uql-orm'

import { Seed } from '#database/seeder'

/**
 * The content directory
 */
const CONTENT = join(import.meta.dir, '../../../content')

/**
 * The upsert batch size
 */
const BATCH = 500

/**
 * An exported definition
 */
export type Timed<E> = Omit<E, 'availableFrom' | 'availableUntil'> & {
  readonly availableFrom: number | null
  readonly availableUntil: number | null
}

/**
 * Converts sale times to dates
 * @param entry The exported definition
 * @returns The definition
 */
export const timed = <E>(
  entry: Timed<E>,
): Omit<E, 'availableFrom' | 'availableUntil'> & {
  availableFrom: Date | null
  availableUntil: Date | null
} => ({
  ...entry,
  availableFrom:
    entry.availableFrom === null ? null : new Date(entry.availableFrom * 1000),
  availableUntil:
    entry.availableUntil === null
      ? null
      : new Date(entry.availableUntil * 1000),
})

/**
 * Seeds a definitions table
 * @class
 */
export abstract class DefinitionSeed<E extends { defId: number }> extends Seed {
  /**
   * Whether the seed runs in production
   */
  public override readonly production = true

  /**
   * Whether the content file can be missing
   */
  protected readonly optional: boolean = false

  /**
   * The definitions table
   */
  protected abstract readonly entity: Type<E>

  /**
   * Reads the definitions
   * @param rows The exported rows
   * @returns The definitions
   */
  protected abstract definitions(rows: unknown[]): readonly EntityWrite<E>[]

  /**
   * Writes the definitions
   * @param querier The querier
   */
  public async run(querier: SqlQuerier): Promise<void> {
    const definitions = this.definitions(await this.content())
    for (let start = 0; start < definitions.length; start += BATCH) {
      await querier.upsertMany(
        this.entity,
        { defId: true } as QueryConflictPaths<E>,
        definitions.slice(start, start + BATCH),
      )
    }
  }

  /**
   * Reads the seed's content file
   * @returns The rows
   */
  private async content(): Promise<unknown[]> {
    const file = Bun.file(join(CONTENT, `${this.name}.json`))
    if (!(await file.exists())) {
      if (this.optional) return []

      throw new Error(
        `Missing content/${this.name}.json, run bun peck content:import first`,
      )
    }
    return (await file.json()) as unknown[]
  }
}
