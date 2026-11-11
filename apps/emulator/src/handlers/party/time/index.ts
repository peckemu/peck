import { inject } from '@needle-di/core'
import { HostedParties } from '@peck/game'
import { HostingTimeIncoming, HostingTimeOutgoing } from '@peck/packets'
import { Handler, PacketHandler } from '@peck/plugins'

import { type HandlerContext } from '#emulator/dispatch/context'

/**
 * Sends a host's time left
 * @class
 */
@Handler(HostingTimeIncoming)
export class HostingTimeHandler extends PacketHandler<HostingTimeIncoming> {
  /**
   * The parties players host
   */
  private readonly hosted = inject<HostedParties>(HostedParties)

  /**
   * Sends the seconds left
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: HostingTimeIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const now = Date.now()
    const party =
      packet.uuid === '' ? null : this.hosted.byUuid(packet.uuid, now)
    const seconds = party ? Math.ceil((party.endsAt - now) / 1000) : 0

    await context.session.send<HostingTimeOutgoing>(
      HostingTimeOutgoing.of(packet.room, seconds),
    )
  }
}
