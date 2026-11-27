import { accessRouter } from './routes/index.ts'
import { type Module } from '../module/index.ts'

/**
 * The access module
 */
export const accessModule = {
  prefix: '/access',
  router: accessRouter,
} as const satisfies Module
