import { masterpiecesRouter } from '#api/modules/masterpieces/routes'
import { type Module } from '#api/modules/module'

/**
 * The masterpieces module
 */
export const masterpiecesModule = {
  prefix: '/',
  router: masterpiecesRouter,
} as const satisfies Module
