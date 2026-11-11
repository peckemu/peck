import { Hono } from 'hono'

import { type Context } from '#api/types'

/**
 * The health routes
 */
export const healthRouter = new Hono<Context>().get('/', (c) =>
  c.json({ status: 'ok' }),
)
