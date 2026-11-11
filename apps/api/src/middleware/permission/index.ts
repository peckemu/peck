import { type Permission } from '@peck/permissions'
import { type MiddlewareHandler } from 'hono'
import { createMiddleware } from 'hono/factory'

import { ServiceError } from '#api/errors'
import { AccessService } from '#api/modules/access/services'
import { type Context } from '#api/types'

/**
 * Requires permissions
 * @param permissions The permissions needed
 * @returns The middleware
 */
export const withPermission = (
  ...permissions: Permission[]
): MiddlewareHandler<Context> =>
  createMiddleware<Context>(async (c, next) => {
    const { id } = c.get('account')

    const access = await c
      .get('container')
      .get<AccessService>(AccessService)
      .of(id)

    const missing = permissions.filter(
      (permission) => !access.permissions.includes(permission),
    )
    if (missing.length > 0) {
      throw new ServiceError("You don't have permission", 'FORBIDDEN')
    }

    c.set('access', access)

    await next()
  })
