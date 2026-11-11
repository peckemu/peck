import { type MiddlewareHandler } from 'hono'
import { createMiddleware } from 'hono/factory'

import { type Context } from '#api/types'

/**
 * Flash's paths
 */
const FLASH_PATHS: ReadonlySet<string> = new Set([
  '/wall',
  '/mp',
  '/crossdomain.xml',
])

/**
 * Checks for a Flash path
 * @param path The path
 * @returns Whether it is
 */
export const isFlashPath = (path: string): boolean => FLASH_PATHS.has(path)

/**
 * Skips a middleware on Flash's paths
 * @param middleware The middleware
 * @returns The middleware
 */
export const exceptFlash = (
  middleware: MiddlewareHandler<Context>,
): MiddlewareHandler<Context> =>
  createMiddleware<Context>(async (c, next) => {
    if (isFlashPath(c.req.path)) {
      await next()
      c.res.headers.set(
        'Cache-Control',
        c.res.headers.get('Cache-Control') ?? 'no-store',
      )
      return
    }

    await middleware(c, next)
  })
