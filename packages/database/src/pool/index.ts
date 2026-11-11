import { SnakeCaseNamingStrategy } from 'uql-orm'
import { BunSqlQuerierPool } from 'uql-orm/bun-sql'

/**
 * The database connection pool
 */
export type Database = BunSqlQuerierPool

/**
 * A querier inside a transaction
 */
export type Querier = Parameters<Parameters<Database['transaction']>[0]>[0]

/**
 * Names tables and columns in snake case
 */
export const NAMING = new SnakeCaseNamingStrategy()

/**
 * Creates a database pool
 * @param url The Postgres connection URL
 * @param max The most connections the pool opens
 * @returns The database pool
 */
export const createDatabase = (url: string, max = 10): Database =>
  new BunSqlQuerierPool({ url, max }, { namingStrategy: NAMING })
