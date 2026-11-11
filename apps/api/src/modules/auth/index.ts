import { type Module } from '#api/modules/module'
import { authRouter } from '#api/modules/auth/routes'

/**
 * The auth module
 */
export const authModule = {
  prefix: '/auth',
  router: authRouter,
} as const satisfies Module
