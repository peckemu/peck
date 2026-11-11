import { type Module } from '#api/modules/module'
import { serversRouter } from '#api/modules/servers/routes'

/**
 * The servers module
 */
export const serversModule = {
  prefix: '/servers',
  router: serversRouter,
} as const satisfies Module
