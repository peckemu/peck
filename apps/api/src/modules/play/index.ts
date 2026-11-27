import { type Module } from '../module/index.ts'
import { playRouter } from './routes/index.ts'

/**
 * The play module
 */
export const playModule = {
  prefix: '/play',
  router: playRouter,
} as const satisfies Module
