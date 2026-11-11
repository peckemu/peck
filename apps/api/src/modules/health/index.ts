import { type Module } from '#api/modules/module'
import { healthRouter } from '#api/modules/health/routes'

/**
 * The health module
 */
export const healthModule = {
  prefix: '/health',
  router: healthRouter,
} as const satisfies Module
