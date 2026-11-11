import type { AppType } from '@peck/api/rpc'
import { hc } from 'hono/client'

/**
 * The API client
 */
type ApiClient = ReturnType<typeof hc<AppType>>

/**
 * Talks to the API
 * @returns The client
 */
export const useApi = (): ApiClient =>
  hc<AppType>(useRuntimeConfig().public.BASE_URL)
