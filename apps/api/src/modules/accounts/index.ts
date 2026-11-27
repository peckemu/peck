import { type Module } from '../module/index.ts'
import { accountsRouter } from './routes/index.ts'

/**
 * The accounts module
 */
export const accountsModule = {
  prefix: '/accounts',
  router: accountsRouter,
} as const satisfies Module
