/**
 * Why a login failed
 */
export const LoginStatus = {
  /**
   * An unknown message
   */
  Failed: -1,
  /**
   * Already logged in
   */
  AccountInUse: -11,
  /**
   * Account maintenance
   */
  AccountMaintenance: -12,
  /**
   * Too many connections
   */
  TooManyConnections: -14,
  /**
   * A banned account
   */
  Banned: -15,
  /**
   * Server maintenance
   */
  ServerMaintenance: -16,
  /**
   * An outdated client
   */
  OutdatedClient: -24,
} as const

/**
 * One of the login status values
 */
export type LoginStatus = (typeof LoginStatus)[keyof typeof LoginStatus]
