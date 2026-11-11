import { inject } from '@needle-di/core'
import { HostedParties } from '@peck/game'
import { HostedPartyNodeIncoming, HostedPartyNodeOutgoing } from '@peck/packets'
import { Handler, PacketHandler } from '@peck/plugins'

import { type Config } from '#emulator/config'
import { type HandlerContext } from '#emulator/dispatch/context'
import { ConfigToken } from '#emulator/tokens'

/**
 * Sends a hosted party's server
 * @class
 */
@Handler(HostedPartyNodeIncoming)
export class HostedPartyNodeHandler extends PacketHandler<HostedPartyNodeIncoming> {
  /**
   * The emulator config
   */
  private readonly config = inject<Config>(ConfigToken)

  /**
   * The parties players host
   */
  private readonly hosted = inject<HostedParties>(HostedParties)

  /**
   * Sends the node the party is on
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: HostedPartyNodeIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const party = this.hosted.byUuid(packet.hostUuid, Date.now())

    await context.session.send<HostedPartyNodeOutgoing>(
      party
        ? HostedPartyNodeOutgoing.found(
            packet.room,
            party.hostUuid,
            this.config.node.host,
          )
        : HostedPartyNodeOutgoing.missing(packet.room),
    )
  }
}
