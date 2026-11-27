import {
  ByteBuf,
  type HandlerContext,
  MessageToByteEncoder,
} from '@netifyjs/netify'
import { FrameEncoder } from '@peck/protocol'

/**
 * Ends each outgoing frame with a NUL
 * @class
 */
export class Terminator extends MessageToByteEncoder<string> {
  /**
   * Turns the text into bytes and refuses a stray NUL
   */
  private static readonly encoder = new FrameEncoder()

  /**
   * Only takes frames as text
   * @param message whatever came down the pipeline
   */
  protected accepts(message: unknown): message is string {
    return typeof message === 'string'
  }

  /**
   * Adds the NUL the client splits on
   * @param _context where it sits in the pipeline
   * @param message frame text
   */
  protected encode(_context: HandlerContext, message: string): ByteBuf {
    return ByteBuf.wrap(Terminator.encoder.encode(message))
  }
}
