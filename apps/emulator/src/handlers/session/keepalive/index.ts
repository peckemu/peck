import { KeepAliveIncoming } from '@peck/packets'
import { Handler, PacketHandler, Public } from '@peck/plugins'

/**
 * Handles a keep alive
 * @class
 */
@Public()
@Handler(KeepAliveIncoming)
export class KeepAliveHandler extends PacketHandler<KeepAliveIncoming> {
  /**
   * Does nothing more
   */
  public handle(): void {
    return
  }
}
