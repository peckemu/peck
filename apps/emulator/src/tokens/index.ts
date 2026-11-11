import { InjectionToken } from '@needle-di/core'
import { type ClusterStore } from '@peck/cluster'

import { type Config } from '#emulator/config'

/**
 * The emulator config
 */
export const ConfigToken = new InjectionToken<Config>('Config')

/**
 * The cluster store
 */
export const ClusterStoreToken = new InjectionToken<ClusterStore>(
  'ClusterStore',
)

export { DatabaseToken, LoggerToken, RedisToken } from '@peck/plugins'
