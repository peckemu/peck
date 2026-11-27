import { moderationRouter } from './routes/index.ts'
import { type Module } from '../module/index.ts'

/**
 * The moderation module
 */
export const moderationModule = {
  prefix: '/moderation',
  router: moderationRouter,
} as const satisfies Module
