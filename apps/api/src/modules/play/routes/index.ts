import { Hono } from 'hono'

import { withAuth } from '#api/middleware'
import { PlayService } from '#api/modules/play/services'
import { type Context } from '#api/types'

/**
 * The play routes
 */
export const playRouter = new Hono<Context>().post('/', withAuth, async (c) => {
  const { id } = c.get('account')

  const play = c.get('container').get<PlayService>(PlayService)

  return c.json(await play.play(id))
})
