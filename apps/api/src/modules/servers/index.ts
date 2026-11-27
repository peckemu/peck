import { type Module } from '../module/index.ts'
import { serversRouter } from './routes/index.ts'

/**
 * The servers module
 */
export const serversModule = {
  prefix: '/servers',
  router: serversRouter,
} as const satisfies Module
