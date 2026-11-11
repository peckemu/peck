import { inject } from '@needle-di/core'
import { PlayerRepository, ReferralRepository } from '@peck/database'
import { type Player } from '@peck/game'
import {
  ReferralAssociateIncoming,
  ReferralAssociateOutgoing,
  type ReferralRefusal,
} from '@peck/packets'
import { Handler, PacketHandler, Throttle } from '@peck/plugins'

import { type HandlerContext } from '#emulator/dispatch/context'
import { SessionManager } from '#emulator/sessions/manager'
import { RewardDelivery } from '#emulator/sessions/rewards'
import { PlayerVariables } from '#emulator/sessions/variables'

/**
 * How long a new player can name a referrer
 */
const WINDOW = 4 * 24 * 60 * 60 * 1000

/**
 * Keeps the player's referrer
 * @class
 */
@Throttle({ limit: 5, per: 10_000 })
@Handler(ReferralAssociateIncoming)
export class ReferralAssociateHandler extends PacketHandler<ReferralAssociateIncoming> {
  /**
   * Keeps who referred whom
   */
  private readonly referrals = inject<ReferralRepository>(ReferralRepository)

  /**
   * Reads players
   */
  private readonly players = inject<PlayerRepository>(PlayerRepository)

  /**
   * Every open session
   */
  private readonly sessions = inject<SessionManager>(SessionManager)

  /**
   * Hands rewards over
   */
  private readonly rewards = inject<RewardDelivery>(RewardDelivery)

  /**
   * Keeps players' variables
   */
  private readonly variables = inject<PlayerVariables>(PlayerVariables)

  /**
   * Keeps the referrer
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: ReferralAssociateIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const { player, session } = context

    const referrer = await this.players.named(packet.username)
    if (!referrer) {
      context.log.info('referrer not found')
      return session.send<ReferralAssociateOutgoing>(
        ReferralAssociateOutgoing.refused(packet.room, 'unknown'),
      )
    }

    const refusal = await this.refusal(player, referrer.gameId)
    if (refusal !== null) {
      context.log.info({ refusal }, 'referrer refused')
      return session.send<ReferralAssociateOutgoing>(
        ReferralAssociateOutgoing.refused(packet.room, refusal),
      )
    }

    const kept = await this.referrals.associate(player.gameId, referrer.gameId)

    await session.send<ReferralAssociateOutgoing>(
      kept
        ? ReferralAssociateOutgoing.recorded(packet.room)
        : ReferralAssociateOutgoing.refused(packet.room, 'failed'),
    )
    if (kept) await this.reward(referrer.gameId, context)
  }

  /**
   * Opens the treasures the referrer has reached
   * @param referrerGameId The referrer
   * @param context The packet context
   */
  private async reward(
    referrerGameId: number,
    context: HandlerContext,
  ): Promise<void> {
    const reward = await this.referrals.reward(referrerGameId)
    if (reward.levels.length > 0) {
      context.log.info(
        { referrer: referrerGameId, levels: reward.levels },
        'referral treasures opened',
      )
    }

    const online = this.sessions.byPlayer(referrerGameId)
    if (!online) return

    for (const variable of reward.variables) {
      await this.variables.change(online, variable)
    }
    for (const granted of reward.granted) {
      await this.rewards.deliver(online, granted)
    }
  }

  /**
   * Finds why a referrer can't be kept
   * @param player The player
   * @param referrerGameId The referrer's id
   * @returns The reason, or null
   */
  private async refusal(
    player: Player,
    referrerGameId: number,
  ): Promise<ReferralRefusal | null> {
    if (referrerGameId === player.gameId) return 'unknown'

    const [joined, current, theirs] = await Promise.all([
      this.referrals.joined(player.gameId),
      this.referrals.referrerOf(player.gameId),
      this.referrals.referrerOf(referrerGameId),
    ])
    if (current !== null) return 'failed'
    if (theirs === player.gameId) return 'failed'
    if (!joined || Date.now() - joined.getTime() >= WINDOW) return 'failed'

    return null
  }
}
