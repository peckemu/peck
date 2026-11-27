import { Hono } from 'hono'

import { accessModule } from './access/index.ts'
import { accountsModule } from './accounts/index.ts'
import { authModule } from './auth/index.ts'
import { healthModule } from './health/index.ts'
import { launcherModule } from './launcher/index.ts'
import { masterpiecesModule } from './masterpieces/index.ts'
import { moderationModule } from './moderation/index.ts'
import { type Module } from './module/index.ts'
import { playModule } from './play/index.ts'
import { serversModule } from './servers/index.ts'
import { wallsModule } from './walls/index.ts'
import { type Context } from '../types/index.ts'

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
