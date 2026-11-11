import { Hono } from 'hono'

import { LauncherService } from '#api/modules/launcher/services'
import { type Context } from '#api/types'

/**
 * The launcher routes
 */
export const launcherRouter = new Hono<Context>()
  .get('/flashvars', async (c) => {
    const launcher = c.get('container').get<LauncherService>(LauncherService)

    return c.json(await launcher.flashvars())
  })
  .get('/player', async (c) => {
    const [scheme, token = ''] = (c.req.header('Authorization') ?? '').split(
      ' ',
    )

    const launcher = c.get('container').get<LauncherService>(LauncherService)

    return c.json(await launcher.player(scheme === 'Bearer' ? token : ''))
  })
