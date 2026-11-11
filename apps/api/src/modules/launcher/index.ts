import { launcherRouter } from '#api/modules/launcher/routes'
import { type Module } from '#api/modules/module'

/**
 * The launcher module
 */
export const launcherModule = {
  prefix: '/',
  router: launcherRouter,
} as const satisfies Module
