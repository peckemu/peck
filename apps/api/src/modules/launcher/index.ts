import { launcherRouter } from './routes/index.ts'
import { type Module } from '../module/index.ts'

/**
 * The launcher module
 */
export const launcherModule = {
  prefix: '/',
  router: launcherRouter,
} as const satisfies Module
