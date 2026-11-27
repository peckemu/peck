import { type Hono } from 'hono'

import { type Context } from '../../types/index.ts'

/**
 * A feature of the API
 */
export type Module = {
  /**
   * Where it is mounted
   */
  readonly prefix: string

  /**
   * Its routes
   */
  readonly router: Hono<Context>
}
