import { type Module } from '#api/modules/module'
import { accountsRouter } from '#api/modules/accounts/routes'

/**
 * The accounts module
 */
export const accountsModule = {
  prefix: '/accounts',
  router: accountsRouter,
} as const satisfies Module
