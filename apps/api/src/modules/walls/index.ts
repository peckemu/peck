import { type Module } from '#api/modules/module'
import { wallsRouter } from '#api/modules/walls/routes'

/**
 * The Jammer Wall module
 */
export const wallsModule = {
  prefix: '/wall',
  router: wallsRouter,
} as const satisfies Module
