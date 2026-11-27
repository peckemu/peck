import { type Module } from '../module/index.ts'
import { authRouter } from './routes/index.ts'

/**
 * The auth module
 */
export const authModule = {
  prefix: '/auth',
  router: authRouter,
} as const satisfies Module
