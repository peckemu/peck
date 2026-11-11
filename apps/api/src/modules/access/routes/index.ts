import { Hono } from 'hono'

import { validate, withAuth, withPermission } from '#api/middleware'
import {
  accountIdSchema,
  assignSchema,
  overridePathSchema,
  overrideSchema,
  pageSchema,
  roleIdSchema,
  roleSchema,
} from '#api/modules/access/schemas'
import { AccessService } from '#api/modules/access/services'
import { auditView, permissionView } from '#api/modules/access/views'
import { type Context } from '#api/types'

/**
 * The access routes
 */
export const accessRouter = new Hono<Context>()
  .get('/me', withAuth, withPermission(), (c) => {
    const { role, rank, permissions, owner } = c.get('access')

    return c.json({ role, rank, permissions, owner })
  })
  .get('/permissions', withAuth, withPermission('roles.read'), async (c) => {
    const access = c.get('container').get<AccessService>(AccessService)
    const permissions = await access.permissions()

    return c.json({ data: permissions.map(permissionView) })
  })
  .get('/roles', withAuth, withPermission('roles.read'), async (c) => {
    const access = c.get('container').get<AccessService>(AccessService)

    return c.json({ data: await access.roles() })
  })
  .post(
    '/roles',
    withAuth,
    withPermission('roles.manage'),
    validate('json', roleSchema),
    async (c) => {
      const input = c.req.valid('json')

      const access = c.get('container').get<AccessService>(AccessService)
      return c.json(await access.createRole(c.get('access'), input), 201)
    },
  )
  .put(
    '/roles/:id',
    withAuth,
    withPermission('roles.manage'),
    validate('param', roleIdSchema),
    validate('json', roleSchema),
    async (c) => {
      const { id } = c.req.valid('param')
      const input = c.req.valid('json')

      const access = c.get('container').get<AccessService>(AccessService)
      return c.json(await access.updateRole(c.get('access'), id, input))
    },
  )
  .delete(
    '/roles/:id',
    withAuth,
    withPermission('roles.manage'),
    validate('param', roleIdSchema),
    async (c) => {
      const { id } = c.req.valid('param')

      const access = c.get('container').get<AccessService>(AccessService)
      await access.deleteRole(c.get('access'), id)

      return c.body(null, 204)
    },
  )
  .put(
    '/accounts/:id/role',
    withAuth,
    withPermission('roles.manage'),
    validate('param', accountIdSchema),
    validate('json', assignSchema),
    async (c) => {
      const { id } = c.req.valid('param')
      const { roleId } = c.req.valid('json')

      const access = c.get('container').get<AccessService>(AccessService)
      await access.assignRole(c.get('access'), id, roleId)

      return c.body(null, 204)
    },
  )
  .put(
    '/accounts/:id/overrides/:permission',
    withAuth,
    withPermission('accounts.grant'),
    validate('param', overridePathSchema),
    validate('json', overrideSchema),
    async (c) => {
      const { id, permission } = c.req.valid('param')
      const { effect } = c.req.valid('json')

      const access = c.get('container').get<AccessService>(AccessService)
      await access.setOverride(c.get('access'), id, permission, effect)

      return c.body(null, 204)
    },
  )
  .delete(
    '/accounts/:id/overrides/:permission',
    withAuth,
    withPermission('accounts.grant'),
    validate('param', overridePathSchema),
    async (c) => {
      const { id, permission } = c.req.valid('param')

      const access = c.get('container').get<AccessService>(AccessService)
      await access.setOverride(c.get('access'), id, permission, null)

      return c.body(null, 204)
    },
  )
  .get(
    '/audit',
    withAuth,
    withPermission('audit.read'),
    validate('query', pageSchema),
    async (c) => {
      const { limit, offset } = c.req.valid('query')

      const access = c.get('container').get<AccessService>(AccessService)
      const entries = await access.auditLog(limit, offset)

      return c.json({ data: entries.map(auditView), meta: { limit, offset } })
    },
  )
