import type { InferRequestType, InferResponseType } from 'hono/client'

/**
 * The API client
 */
export type Api = ReturnType<typeof useApi>

/**
 * A signed in account
 */
export type Account = InferResponseType<Api['accounts']['me']['$get'], 200>

/**
 * The signed in account's access
 */
export type Access = InferResponseType<Api['access']['me']['$get'], 200>

/**
 * A game server
 */
export type Server = InferResponseType<
  Api['servers']['$get'],
  200
>['data'][number]

/**
 * A room open on a server
 */
export type Room = InferResponseType<
  Api['servers'][':id']['rooms']['$get'],
  200
>['data'][number]

/**
 * What signing in takes
 */
export type Credentials = InferRequestType<
  Api['auth']['sessions']['$post']
>['json']

/**
 * What registering takes
 */
export type Registration = InferRequestType<Api['accounts']['$post']>['json']

/**
 * An error the API sends
 */
export type ApiError = {
  /**
   * What went wrong
   */
  readonly error?: {
    /**
     * The message
     */
    readonly message?: string
  }
}

/**
 * A response with a body
 */
export type JsonResponse = {
  /**
   * Reads the body
   */
  readonly json: () => Promise<unknown>
}
