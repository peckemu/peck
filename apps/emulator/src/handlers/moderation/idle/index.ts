import { IdleTimeoutIncoming } from '@peck/packets'
import { Handler, PacketHandler } from '@peck/plugins'

import { type HandlerContext } from '#emulator/dispatch/context'

/**
 * Disconnects an idle player
 * @class
 */
@Handler(IdleTimeoutIncoming)
export class IdleTimeoutHandler extends PacketHandler<IdleTimeoutIncoming> {
  /**
   * Closes the connection
   * @param _packet The packet
   * @param context The packet context
   */
  public async handle(
    _packet: IdleTimeoutIncoming,
    context: HandlerContext,
  ): Promise<void> {
    context.log.info('idle timeout')

    await context.session.close()
  }
}
