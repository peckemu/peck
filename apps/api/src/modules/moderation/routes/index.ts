import { Hono } from 'hono'

import { validate, withAuth, withPermission } from '#api/middleware'
import {
  broadcastSchema,
  hostIdSchema,
  jamagramIdSchema,
  moderationIdSchema,
  redactSchema,
} from '#api/modules/moderation/schemas'
import { ModerationService } from '#api/modules/moderation/services'
import { reportView, sanctionView } from '#api/modules/moderation/views'
import { type Context } from '#api/types'

/**
 * The moderation routes
 */
export const moderationRouter = new Hono<Context>()
  .get('/reports', withAuth, withPermission('players.moderate'), async (c) => {
    const moderation = c
      .get('container')
      .get<ModerationService>(ModerationService)
    const reports = await moderation.reports()

    return c.json({ data: reports.map(reportView) })
  })
  .put(
    '/reports/:id',
    withAuth,
    withPermission('players.moderate'),
    validate('param', moderationIdSchema),
    async (c) => {
      const { id } = c.req.valid('param')

      const moderation = c
        .get('container')
        .get<ModerationService>(ModerationService)
      await moderation.resolve(c.get('account').id, id)

      return c.body(null, 204)
    },
  )
  .get(
    '/sanctions',
    withAuth,
    withPermission('players.moderate'),
    async (c) => {
      const moderation = c
        .get('container')
        .get<ModerationService>(ModerationService)
      const sanctions = await moderation.sanctions()

      return c.json({ data: sanctions.map(sanctionView) })
    },
  )
  .delete(
    '/sanctions/:id',
    withAuth,
    withPermission('players.moderate'),
    validate('param', moderationIdSchema),
    async (c) => {
      const { id } = c.req.valid('param')

      const moderation = c
        .get('container')
        .get<ModerationService>(ModerationService)
      await moderation.lift(c.get('account').id, id)

      return c.body(null, 204)
    },
  )
  .post(
    '/broadcast',
    withAuth,
    withPermission('server.manage'),
    validate('json', broadcastSchema),
    async (c) => {
      const { text, system } = c.req.valid('json')

      const moderation = c
        .get('container')
        .get<ModerationService>(ModerationService)
      await moderation.broadcast(c.get('account').id, text, system)

      return c.body(null, 202)
    },
  )
  .delete(
    '/parties/:gameId',
    withAuth,
    withPermission('players.moderate'),
    validate('param', hostIdSchema),
    async (c) => {
      const { gameId } = c.req.valid('param')

      const moderation = c
        .get('container')
        .get<ModerationService>(ModerationService)
      await moderation.endParty(c.get('account').id, gameId)

      return c.body(null, 202)
    },
  )
  .put(
    '/jamagrams/:id',
    withAuth,
    withPermission('players.moderate'),
    validate('param', jamagramIdSchema),
    validate('json', redactSchema),
    async (c) => {
      const { id } = c.req.valid('param')
      const { message } = c.req.valid('json')

      const moderation = c
        .get('container')
        .get<ModerationService>(ModerationService)
      await moderation.redact(c.get('account').id, id, message)

      return c.body(null, 204)
    },
  )
