import { accessRouter } from '#api/modules/access/routes'
import { type Module } from '#api/modules/module'

/**
 * The access module
 */
export const accessModule = {
  prefix: '/access',
  router: accessRouter,
} as const satisfies Module
