import { type Module } from '../module/index.ts'
import { wallsRouter } from './routes/index.ts'

/**
 * The Jammer Wall module
 */
export const wallsModule = {
  prefix: '/wall',
  router: wallsRouter,
} as const satisfies Module
