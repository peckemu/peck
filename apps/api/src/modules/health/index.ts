import { type Module } from '../module/index.ts'
import { healthRouter } from './routes/index.ts'

/**
 * The health module
 */
export const healthModule = {
  prefix: '/health',
  router: healthRouter,
} as const satisfies Module
