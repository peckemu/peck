import { type Container } from '@needle-di/core'
import { type Account } from '@peck/database'

import { type Access } from '../modules/access/services/index.ts'

/**
 * The request context
 */
export type Context = {
  Variables: {
    /**
     * The container
     */
    container: Container

    /**
     * The signed in account
     */
    account: Account

    /**
     * The session token
     */
    token: string

    /**
     * What the account may do
     */
    access: Access
  }
}
