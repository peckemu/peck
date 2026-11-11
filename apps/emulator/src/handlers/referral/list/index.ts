import { inject } from '@needle-di/core'
import { ReferralRepository } from '@peck/database'
import { ReferralListIncoming, ReferralListOutgoing } from '@peck/packets'
import { Handler, PacketHandler, Throttle } from '@peck/plugins'
import { AccountType } from '@peck/shared'

import { type HandlerContext } from '#emulator/dispatch/context'

/**
 * The largest page
 */
const MOST = 50

/**
 * Sends a page of the player's referrals
 * @class
 */
@Throttle({ limit: 10, per: 10_000 })
@Handler(ReferralListIncoming)
export class ReferralListHandler extends PacketHandler<ReferralListIncoming> {
  /**
   * Keeps who referred whom
   */
  private readonly referrals = inject<ReferralRepository>(ReferralRepository)

  /**
   * Sends the page
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: ReferralListIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const { player, session } = context

    const refusal = this.refusal(packet)
    if (refusal !== null) {
      context.log.info({ refusal }, 'referrals refused')
      return session.send<ReferralListOutgoing>(
        ReferralListOutgoing.refused(packet.room),
      )
    }

    const referred = await this.referrals.referred(
      player.gameId,
      packet.size,
      (packet.page - 1) * packet.size,
    )
    const entries = referred.map((each) => ({
      username: each.username,
      nameBarData: each.nameBarData,
      member: each.accountType >= AccountType.Member,
    }))

    await session.send<ReferralListOutgoing>(
      ReferralListOutgoing.of(packet.room, entries),
    )
  }

  /**
   * Finds why a page can't be sent
   * @param packet The packet
   * @returns The reason, or null
   */
  private refusal(packet: ReferralListIncoming): string | null {
    if (packet.page < 1) return 'bad page'
    if (packet.size < 1 || packet.size > MOST) return 'bad size'
    if (!Number.isSafeInteger((packet.page - 1) * packet.size)) {
      return 'bad page'
    }

    return null
  }
}
