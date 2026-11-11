/**
 * Why a service refused
 */
export type ServiceErrorCode =
  | 'INVALID'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'UNAVAILABLE'

/**
 * A refused request
 * @class
 */
export class ServiceError extends Error {
  /**
   * The error name
   */
  public override readonly name = 'ServiceError'

  /**
   * Why it refused
   */
  public readonly code: ServiceErrorCode

  /**
   * Creates the error
   * @param message What went wrong
   * @param code Why it refused
   */
  public constructor(message: string, code: ServiceErrorCode) {
    super(message)
    this.code = code
  }
}
