import { Hono } from 'hono'
import { bodyLimit } from 'hono/body-limit'

import { validate, withAuth, withPermission } from '#api/middleware'
import { MOST_BYTES } from '#api/modules/masterpieces/images'
import {
  decisionSchema,
  masterpieceIdSchema,
} from '#api/modules/masterpieces/schemas'
import { MasterpieceService } from '#api/modules/masterpieces/services'
import { pendingView } from '#api/modules/masterpieces/views'
import { type Context } from '#api/types'

/**
 * Flash's policy file
 */
const POLICY =
  '<?xml version="1.0"?><cross-domain-policy><allow-access-from domain="*" secure="false"/>' +
  '<allow-http-request-headers-from domain="*" headers="Content-Type,Cache-Control" secure="false"/>' +
  '</cross-domain-policy>'

/**
 * The form overhead in bytes
 */
const FORM_BYTES = 16 * 1024

/**
 * The masterpiece routes
 */
export const masterpiecesRouter = new Hono<Context>()
  .get('/crossdomain.xml', (c) =>
    c.body(POLICY, 200, {
      'Content-Type': 'text/x-cross-domain-policy',
      'Cache-Control': 'public, max-age=3600',
    }),
  )
  .post(
    '/mp',
    bodyLimit({
      maxSize: MOST_BYTES + FORM_BYTES,
      onError: (c) => c.json({ success: false }),
    }),
    async (c) => {
      const form = await c.req.parseBody().catch(() => null)
      const token = form?.['authToken']
      const image = form?.['image']

      const masterpieces = c
        .get('container')
        .get<MasterpieceService>(MasterpieceService)
      const reply = await masterpieces.upload(
        typeof token === 'string' ? token.trim() : '',
        image instanceof File
          ? new Uint8Array(await image.arrayBuffer())
          : null,
      )

      return c.json(reply)
    },
  )
  .get(
    '/masterpieces/pending',
    withAuth,
    withPermission('masterpieces.review'),
    async (c) => {
      const masterpieces = c
        .get('container')
        .get<MasterpieceService>(MasterpieceService)
      const pending = await masterpieces.pending()

      return c.json({ data: pending.map(pendingView) })
    },
  )
  .get(
    '/masterpieces/:id/review',
    withAuth,
    withPermission('masterpieces.review'),
    validate('param', masterpieceIdSchema),
    async (c) => {
      const { id } = c.req.valid('param')

      const masterpieces = c
        .get('container')
        .get<MasterpieceService>(MasterpieceService)
      const picture = await masterpieces.picture(id, true)
      if (!picture) {
        return c.json(
          { error: { code: 'NOT_FOUND', message: 'Not found' } },
          404,
        )
      }

      return c.body(picture.file.stream(), 200, {
        'Content-Type': picture.type,
      })
    },
  )
  .put(
    '/masterpieces/:id/decision',
    withAuth,
    withPermission('masterpieces.review'),
    validate('param', masterpieceIdSchema),
    validate('json', decisionSchema),
    async (c) => {
      const { id } = c.req.valid('param')
      const { approve } = c.req.valid('json')

      const masterpieces = c
        .get('container')
        .get<MasterpieceService>(MasterpieceService)
      await masterpieces.decide(c.get('account').id, id, approve)

      return c.body(null, 204)
    },
  )
  .get(
    '/masterpieces/:id',
    validate('param', masterpieceIdSchema),
    async (c) => {
      const { id } = c.req.valid('param')

      const masterpieces = c
        .get('container')
        .get<MasterpieceService>(MasterpieceService)
      const picture = await masterpieces.picture(id)
      if (!picture) {
        return c.json(
          { error: { code: 'NOT_FOUND', message: 'Not found' } },
          404,
        )
      }

      return c.body(picture.file.stream(), 200, {
        'Content-Type': picture.type,
        'Cache-Control': 'public, max-age=600',
      })
    },
  )
