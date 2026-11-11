import { Hono } from 'hono'

import { validate, withAuth } from '#api/middleware'
import { refreshSchema, signInSchema } from '#api/modules/auth/schemas'
import { AuthService } from '#api/modules/auth/services'
import { sessionView } from '#api/modules/auth/views'
import { type Context } from '#api/types'

/**
 * The auth routes
 */
export const authRouter = new Hono<Context>()
  .post('/sessions', validate('json', signInSchema), async (c) => {
    const { login, password, device } = c.req.valid('json')

    const auth = c.get('container').get<AuthService>(AuthService)
    return c.json(sessionView(await auth.signIn(login, password, device)), 201)
  })
  .post('/sessions/refresh', validate('json', refreshSchema), async (c) => {
    const { refreshToken } = c.req.valid('json')

    const auth = c.get('container').get<AuthService>(AuthService)
    return c.json(sessionView(await auth.refresh(refreshToken)))
  })
  .delete('/sessions/current', withAuth, async (c) => {
    const token = c.get('token')

    const auth = c.get('container').get<AuthService>(AuthService)
    await auth.signOut(token)

    return c.body(null, 204)
  })
