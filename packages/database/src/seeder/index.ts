import { type SqlQuerier } from 'uql-orm'

/**
 * A transaction pool
 */
export type SeedPool = {
  /**
   * Runs a callback inside a transaction
   * @param callback The work to run
   * @returns What the callback returns
   */
  transaction<T>(callback: (querier: SqlQuerier) => Promise<T>): Promise<T>
}

/**
 * Fills the database with starting data
 * @class
 */
export abstract class Seed {
  /**
   * The seed name
   */
  public abstract readonly name: string

  /**
   * Whether the seed runs in production
   */
  public readonly production: boolean = false

  /**
   * Writes the seed's rows
   * @param querier The querier
   */
  public abstract run(querier: SqlQuerier): Promise<void>
}

/**
 * Runs the seeds
 * @class
 */
export class Seeder {
  /**
   * The database to seed
   */
  private readonly database: SeedPool

  /**
   * Every seed in order
   */
  private readonly seeds: readonly Seed[]

  /**
   * Creates a seeder
   * @param database The database to seed
   * @param seeds The ordered seeds
   */
  public constructor(database: SeedPool, seeds: readonly Seed[]) {
    this.database = database
    this.seeds = seeds
  }

  /**
   * Runs the seeds
   * @param only The seeds to run, or null
   * @param production Whether this is production
   * @returns The names of the seeds run
   */
  public async run(
    only: readonly string[] = [],
    production = false,
  ): Promise<string[]> {
    const unknown = only.filter(
      (name) => !this.seeds.some((seed) => seed.name === name),
    )
    if (unknown.length > 0) {
      throw new Error(`Unknown seed ${unknown.join(', ')}`)
    }

    const seeds = this.seeds.filter(
      (seed) =>
        (only.length === 0 || only.includes(seed.name)) &&
        (!production || seed.production),
    )
    for (const seed of seeds) {
      await this.database.transaction((querier) => seed.run(querier))
    }
    return seeds.map((seed) => seed.name)
  }
}
