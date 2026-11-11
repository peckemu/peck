import { DenEpicIncoming, DenEpicOutgoing } from '@peck/packets'
import { Handler, PacketHandler, Throttle } from '@peck/plugins'

import { type HandlerContext } from '#emulator/dispatch/context'

/**
 * Lists the epic dens
 * @class
 */
@Throttle({ limit: 5, per: 5_000 })
@Handler(DenEpicIncoming)
export class DenEpicHandler extends PacketHandler<DenEpicIncoming> {
  /**
   * Sends the epic dens
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: DenEpicIncoming,
    context: HandlerContext,
  ): Promise<void> {
    await context.session.send<DenEpicOutgoing>(
      DenEpicOutgoing.of(packet.room, []),
    )
  }
}
