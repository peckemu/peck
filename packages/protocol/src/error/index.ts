/**
 * The kinds of protocol error
 */
export type ProtocolErrorCode =
  | 'FRAME_TOO_LARGE'
  | 'FRAME_DELIMITER'
  | 'UNKNOWN_FORMAT'
  | 'XML_SYNTAX'
  | 'XT_SYNTAX'
  | 'XT_VALUE'
  | 'JSON_SYNTAX'
  | 'PACKET_FIELD'
  | 'PACKET_FORMAT'
  | 'PACKET_TYPE'

/**
 * A malformed frame error
 * @class
 */
export class ProtocolError extends Error {
  /**
   * The name of the error
   */
  public override readonly name = 'ProtocolError'

  /**
   * The kind of protocol error
   */
  public readonly code: ProtocolErrorCode

  /**
   * Creates a new protocol error
   * @param message The error message
   * @param code The kind of protocol error
   * @param cause The error behind it
   */
  public constructor(
    message: string,
    code: ProtocolErrorCode,
    cause?: unknown,
  ) {
    super(message, cause === undefined ? undefined : { cause })
    this.code = code
  }

  /**
   * Creates a field error
   * @param header The packet header
   * @param field The name of the field
   * @param problem The problem
   * @returns The protocol error
   */
  public static field(
    header: string,
    field: string,
    problem: string,
  ): ProtocolError {
    return new ProtocolError(`${header}: ${field} ${problem}`, 'PACKET_FIELD')
  }
}
