import { type Logger } from '@peck/logger'
import { type MiddlewareHandler } from 'hono'
import { createMiddleware } from 'hono/factory'

import { type Context } from '#api/types'

/**
 * Logs each request
 * @param logger The logger
 * @returns The middleware
 */
export const withRequestLog = (logger: Logger): MiddlewareHandler<Context> =>
  createMiddleware<Context>(async (c, next) => {
    const started = performance.now()

    await next()

    const ms = Math.round(performance.now() - started)
    logger.info(
      { method: c.req.method, path: c.req.path, status: c.res.status, ms },
      'request',
    )
  })
