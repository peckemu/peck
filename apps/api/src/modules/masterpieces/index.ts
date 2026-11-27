import { masterpiecesRouter } from './routes/index.ts'
import { type Module } from '../module/index.ts'

/**
 * The masterpieces module
 */
export const masterpiecesModule = {
  prefix: '/',
  router: masterpiecesRouter,
} as const satisfies Module
