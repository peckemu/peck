import { inject } from '@needle-di/core'
import { HostedParties } from '@peck/game'
import { HostedPartyListIncoming, HostedPartyListOutgoing } from '@peck/packets'
import { Handler, PacketHandler } from '@peck/plugins'

import { type Config } from '#emulator/config'
import { type HandlerContext } from '#emulator/dispatch/context'
import { ConfigToken } from '#emulator/tokens'

/**
 * The most a page holds
 */
const MOST_LISTED = 200

/**
 * Lists the parties players host here
 * @class
 */
@Handler(HostedPartyListIncoming)
export class HostedPartyListHandler extends PacketHandler<HostedPartyListIncoming> {
  /**
   * The emulator config
   */
  private readonly config = inject<Config>(ConfigToken)

  /**
   * The parties players host
   */
  private readonly hosted = inject<HostedParties>(HostedParties)

  /**
   * Sends a page of the parties
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: HostedPartyListIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const now = Date.now()
    const running = this.hosted.running(now)
    const start = Math.max(packet.start, 0)

    const page = running
      .slice(start, start + Math.min(Math.max(packet.limit, 0), MOST_LISTED))
      .map((party) => ({
        hostUuid: party.hostUuid,
        name: party.name,
        node: this.config.node.host,
        defId: party.defId,
        secondsLeft: Math.ceil((party.endsAt - now) / 1000),
      }))

    await context.session.send<HostedPartyListOutgoing>(
      HostedPartyListOutgoing.of(packet.room, running.length, start, page),
    )
  }
}
