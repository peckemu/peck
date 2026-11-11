import { Hono } from 'hono'
import { bodyLimit } from 'hono/body-limit'

import { WallService } from '#api/modules/walls/services'
import { type Context } from '#api/types'

/**
 * The most a wall request may be
 */
const MOST_BYTES = 16 * 1024

/**
 * The Jammer Wall routes
 */
export const wallsRouter = new Hono<Context>().post(
  '/',
  bodyLimit({
    maxSize: MOST_BYTES,
    onError: (c) => c.json({ s: false, e: 'unavailable' }),
  }),
  async (c) => {
    const body: unknown = await c.req.json().catch(() => null)

    const walls = c.get('container').get<WallService>(WallService)

    return c.json(await walls.serve(body))
  },
)
