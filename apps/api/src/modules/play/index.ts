import { type Module } from '#api/modules/module'
import { playRouter } from '#api/modules/play/routes'

/**
 * The play module
 */
export const playModule = {
  prefix: '/play',
  router: playRouter,
} as const satisfies Module
