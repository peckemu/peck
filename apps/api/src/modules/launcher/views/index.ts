/**
 * A player for the launcher
 */
export type PlayerSessionView = {
  /**
   * The account id
   */
  readonly id: string

  /**
   * The player's username
   */
  readonly screen_name: string

  /**
   * The player's account type
   */
  readonly game_account_type: number

  /**
   * The player's language
   */
  readonly language: string

  /**
   * The node to connect to
   */
  readonly game_server: string

  /**
   * Whether the player must pick a new name
   */
  readonly rename_required: boolean
}
