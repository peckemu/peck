import { JamagramClearIncoming } from '@peck/packets'
import { Handler, PacketHandler } from '@peck/plugins'

/**
 * Clears the inbox cache
 * @class
 */
@Handler(JamagramClearIncoming)
export class JamagramClearHandler extends PacketHandler<JamagramClearIncoming> {
  /**
   * Does nothing
   */
  public async handle(): Promise<void> {
    await Promise.resolve()
  }
}
