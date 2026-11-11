/**
 * The account types
 */
export const AccountType = {
  /**
   * An archived account
   */
  Archived: -2,
  /**
   * A newly created account
   */
  New: -1,
  /**
   * No account type
   */
  None: 0,
  /**
   * A free account
   */
  NonMember: 1,
  /**
   * A paying member
   */
  Member: 2,
  /**
   * A member in the beta
   */
  BetaMember: 3,
  /**
   * A staff account
   */
  Internal: 4,
  /**
   * A community account
   */
  Community: 5,
} as const

/**
 * One of the account type values
 */
export type AccountType = (typeof AccountType)[keyof typeof AccountType]
