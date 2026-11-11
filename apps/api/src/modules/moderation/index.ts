import { moderationRouter } from '#api/modules/moderation/routes'
import { type Module } from '#api/modules/module'

/**
 * The moderation module
 */
export const moderationModule = {
  prefix: '/moderation',
  router: moderationRouter,
} as const satisfies Module
