import { Hono } from 'hono'

import { withAuth } from '../../../middleware/index.ts'
import { PlayService } from '../services/index.ts'
import { type Context } from '../../../types/index.ts'

/**
 * The play routes
 */
export const playRouter = new Hono<Context>().post('/', withAuth, async (c) => {
  const { id } = c.get('account')

  const play = c.get('container').get<PlayService>(PlayService)

  return c.json(await play.play(id))
})
