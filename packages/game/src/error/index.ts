/**
 * Why a game action failed
 */
export type GameErrorCode =
  | 'NOT_FOUND'
  | 'DUPLICATE'
  | 'INVENTORY_FULL'
  | 'INSUFFICIENT_FUNDS'
  | 'INVALID_AMOUNT'
  | 'ROOM_FULL'
  | 'BUDDY_LIST_FULL'
  | 'BLOCKED'

/**
 * A broken game rule
 * @class
 */
export class GameError extends Error {
  /**
   * The error's name
   */
  public override readonly name = 'GameError'

  /**
   * Why it failed
   */
  public readonly code: GameErrorCode

  /**
   * Creates a game error
   * @param message What went wrong
   * @param code Why it failed
   */
  public constructor(message: string, code: GameErrorCode) {
    super(message)
    this.code = code
  }
}
