/**
 * The Flash policy exchange
 * @class
 */
export class SocketPolicy {
  /**
   * Flash's policy request
   */
  public static readonly REQUEST = '<policy-file-request/>'

  /**
   * The policy reply
   */
  public static readonly RESPONSE =
    '<cross-domain-policy><allow-access-from domain="*" to-ports="*"/></cross-domain-policy>'

  /**
   * Checks for a policy request
   * @param frame The frame to check
   * @returns Whether the frame is a policy request
   */
  public static isRequest(frame: string): boolean {
    return frame === SocketPolicy.REQUEST
  }
}
