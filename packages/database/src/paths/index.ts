import { join } from 'node:path'

/**
 * The migrations folder
 */
export const MIGRATIONS = join(import.meta.dir, '../../migrations')
