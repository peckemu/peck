import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { secureHeaders } from 'hono/secure-headers'

import { type Container } from '@needle-di/core'
import { type Logger } from '@peck/logger'

import { ServiceError, type ServiceErrorCode } from '#api/errors'
import { exceptFlash, withContainer, withRequestLog } from '#api/middleware'
import { routes } from '#api/modules'
import { LoggerToken } from '#api/tokens'
import { type Context } from '#api/types'

/**
 * The status for each error
 */
const STATUS = {
  INVALID: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNAVAILABLE: 503,
} as const satisfies Record<ServiceErrorCode, number>

/**
 * Builds the API
 * @param container The container
 * @param origins The origins allowed to call it
 * @returns The app
 */
export const createApp = (
  container: Container,
  origins: readonly string[] = [],
): Hono<Context> => {
  const app = new Hono<Context>()
  const logger = container.get<Logger>(LoggerToken)

  app.use(withRequestLog(logger))
  app.use(
    exceptFlash(
      secureHeaders({
        crossOriginResourcePolicy: 'cross-origin',
      }),
    ),
  )
  app.use(
    /**
     * @sxip flash is when the request comes from the Flash client, and the middleware should not apply to such requests
     */
    exceptFlash(
      cors({
        origin: [...origins],
        allowHeaders: ['Authorization', 'Content-Type'],
      }),
    ),
  )

  app.use(withContainer(container))
  app.route('/', routes)

  app.onError((error, c) => {
    if (error instanceof ServiceError) {
      return c.json(
        { error: { code: error.code, message: error.message } },
        STATUS[error.code],
      )
    }

    logger.error(
      { err: error, method: c.req.method, path: c.req.path },
      'request failed',
    )
    return c.json(
      { error: { code: 'INTERNAL', message: 'Something went wrong' } },
      500,
    )
  })

  app.notFound((c) =>
    c.json({ error: { code: 'NOT_FOUND', message: 'Not found' } }, 404),
  )
  return app
}
