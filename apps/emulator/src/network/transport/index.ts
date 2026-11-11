/**
 * A session's connection
 */
export type Transport = {
  /**
   * The address of the other end
   */
  readonly remoteAddress: string

  /**
   * Whether the connection takes no more frames
   */
  readonly closed: boolean

  /**
   * Sends one frame
   * @param frame The frame
   * @returns Once the frame is written
   */
  send(frame: string): Promise<void>

  /**
   * Closes the connection
   * @returns Once it is closed
   */
  close(): Promise<void>
}
