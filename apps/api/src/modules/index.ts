import { Hono } from 'hono'

import { accessModule } from '#api/modules/access'
import { accountsModule } from '#api/modules/accounts'
import { authModule } from '#api/modules/auth'
import { healthModule } from '#api/modules/health'
import { launcherModule } from '#api/modules/launcher'
import { masterpiecesModule } from '#api/modules/masterpieces'
import { moderationModule } from '#api/modules/moderation'
import { type Module } from '#api/modules/module'
import { playModule } from '#api/modules/play'
import { serversModule } from '#api/modules/servers'
import { wallsModule } from '#api/modules/walls'
import { type Context } from '#api/types'

/**
 * Every route
 */
export const routes = new Hono<Context>()
  .route(healthModule.prefix, healthModule.router)
  .route(authModule.prefix, authModule.router)
  .route(accountsModule.prefix, accountsModule.router)
  .route(accessModule.prefix, accessModule.router)
  .route(playModule.prefix, playModule.router)
  .route(serversModule.prefix, serversModule.router)
  .route(launcherModule.prefix, launcherModule.router)
  .route(masterpiecesModule.prefix, masterpiecesModule.router)
  .route(wallsModule.prefix, wallsModule.router)
  .route(moderationModule.prefix, moderationModule.router)

/**
 * The API's routes
 */
export type AppType = typeof routes

export { type Module }
