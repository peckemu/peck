import { Hono } from 'hono'

import { validate, withAuth, withPermission } from '#api/middleware'
import { moderationIdSchema } from '#api/modules/moderation/schemas'
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
