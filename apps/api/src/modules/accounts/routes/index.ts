import { Hono } from 'hono'

import { validate, withAuth } from '../../../middleware/index.ts'
import { registerSchema } from '../schemas/index.ts'
import { AccountService } from '../services/index.ts'
import { accountView, playerView } from '../views/index.ts'
import { type Context } from '../../../types/index.ts'

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
