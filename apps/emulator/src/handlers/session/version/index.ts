import { ApiOkOutgoing, VersionCheckIncoming } from '@peck/packets'
import { Handler, PacketHandler, Public } from '@peck/plugins'

import { type HandlerContext } from '#emulator/dispatch/context'

/**
 * Accepts any SmartFox version
 * @class
 */
@Public()
@Handler(VersionCheckIncoming)
export class VersionCheckHandler extends PacketHandler<VersionCheckIncoming> {
  /**
   * Accepts the version
   * @param _packet The version check
   * @param context The packet context
   */
  public async handle(
    _packet: VersionCheckIncoming,
    context: HandlerContext,
  ): Promise<void> {
    await context.reply(ApiOkOutgoing)
  }
}
