import { createMiddleware } from 'hono/factory'

import { type Context } from '../../types/index.ts'
import { AuthService } from '../../modules/auth/services/index.ts'

/**
 * Requires a session token
 */
export const withAuth = createMiddleware<Context>(async (c, next) => {
  const [scheme, token = ''] = (c.req.header('Authorization') ?? '').split(' ')

  const auth = c.get('container').get<AuthService>(AuthService)
  const account = await auth.accountOf(scheme === 'Bearer' ? token : '')

  c.set('account', account)
  c.set('token', token)

  await next()
})
