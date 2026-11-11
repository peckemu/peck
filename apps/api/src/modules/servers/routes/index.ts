import { Hono } from 'hono'

import { validate, withAuth, withPermission } from '#api/middleware'
import { drainSchema, serverIdSchema } from '#api/modules/servers/schemas'
import { ServerService } from '#api/modules/servers/services'
import { serverView } from '#api/modules/servers/views'
import { type Context } from '#api/types'

/**
 * The server routes
 */
export const serversRouter = new Hono<Context>()
  .get('/', async (c) => {
    const servers = c.get('container').get<ServerService>(ServerService)
    const nodes = await servers.list()

    return c.json({ data: nodes.map(serverView) })
  })
  .get('/:id/rooms', validate('param', serverIdSchema), async (c) => {
    const { id } = c.req.valid('param')

    const servers = c.get('container').get<ServerService>(ServerService)

    return c.json({ data: await servers.rooms(id) })
  })
  .put(
    '/:id/drain',
    withAuth,
    withPermission('server.manage'),
    validate('param', serverIdSchema),
    validate('json', drainSchema),
    async (c) => {
      const { id } = c.req.valid('param')
      const { draining } = c.req.valid('json')
      const actor = c.get('account')

      const servers = c.get('container').get<ServerService>(ServerService)
      await servers.drain(actor.id, id, draining)

      return c.body(null, 204)
    },
  )
