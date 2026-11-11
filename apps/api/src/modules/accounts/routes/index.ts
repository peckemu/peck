import { Hono } from 'hono'

import { validate, withAuth } from '#api/middleware'
import { registerSchema } from '#api/modules/accounts/schemas'
import { AccountService } from '#api/modules/accounts/services'
import { accountView, playerView } from '#api/modules/accounts/views'
import { type Context } from '#api/types'

/**
 * The account routes
 */
export const accountsRouter = new Hono<Context>()
  .post('/', validate('json', registerSchema), async (c) => {
    const details = c.req.valid('json')

    const accounts = c.get('container').get<AccountService>(AccountService)
    return c.json(accountView(await accounts.register(details)), 201)
  })
  .get('/me', withAuth, (c) => c.json(accountView(c.get('account'))))
  .get('/me/players', withAuth, async (c) => {
    const { id } = c.get('account')

    const accounts = c.get('container').get<AccountService>(AccountService)
    const players = await accounts.playersOf(id)

    return c.json({ data: players.map(playerView) })
  })
