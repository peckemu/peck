import { type Account, type Player } from '@peck/database'
import { type AccountType } from '@peck/shared'

/**
 * An account view
 */
export type AccountView = {
  /**
   * The account id
   */
  readonly id: string

  /**
   * The username
   */
  readonly username: string

  /**
   * The email address
   */
  readonly email: string

  /**
   * Whether the email is confirmed
   */
  readonly emailConfirmed: boolean

  /**
   * When the account was made
   */
  readonly createdAt: string
}

/**
 * A player view
 */
export type PlayerView = {
  /**
   * The player's game id
   */
  readonly gameId: number

  /**
   * The player's username
   */
  readonly username: string

  /**
   * The player's slot on the account
   */
  readonly slot: number

  /**
   * The player's account type
   */
  readonly accountType: AccountType

  /**
   * When the player was made
   */
  readonly createdAt: string

  /**
   * The last login, or null
   */
  readonly lastLoginAt: string | null
}

/**
 * Turns an account into a response
 * @param account The account
 * @returns The account
 */
export const accountView = (account: Account): AccountView => ({
  id: account.id,
  username: account.username,
  email: account.email,
  emailConfirmed: account.emailConfirmed,
  createdAt: account.createdAt.toISOString(),
})

/**
 * Turns a player into a response
 * @param player The player
 * @returns The player
 */
export const playerView = (player: Player): PlayerView => ({
  gameId: player.gameId,
  username: player.username,
  slot: player.slot,
  accountType: player.accountType,
  createdAt: player.createdAt.toISOString(),
  lastLoginAt: player.lastLoginAt?.toISOString() ?? null,
})
