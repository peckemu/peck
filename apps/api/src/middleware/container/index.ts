import { type Container } from '@needle-di/core'
import { type MiddlewareHandler } from 'hono'
import { createMiddleware } from 'hono/factory'

import { type Context } from '../../types/index.ts'

/**
 * Puts the container on the context
 * @param container The container
 * @returns The middleware
 */
export const withContainer = (
  container: Container,
): MiddlewareHandler<Context> =>
  createMiddleware<Context>(async (c, next) => {
    c.set('container', container)
    await next()
  })
