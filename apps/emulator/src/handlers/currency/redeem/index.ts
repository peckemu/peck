import { inject } from '@needle-di/core'
import { CodeRepository } from '@peck/database'
import {
  RedeemCodeIncoming,
  RedeemCodeOutgoing,
  RedeemResult,
} from '@peck/packets'
import { Handler, PacketHandler, Throttle } from '@peck/plugins'

import { type HandlerContext } from '#emulator/dispatch/context'
import { RewardDelivery } from '#emulator/sessions/rewards'

/**
 * The longest code
 */
const LONGEST = 64

/**
 * Redeems a code
 * @class
 */
@Throttle({ limit: 5, per: 10_000 })
@Handler(RedeemCodeIncoming)
export class RedeemCodeHandler extends PacketHandler<RedeemCodeIncoming> {
  /**
   * Keeps gift codes
   */
  private readonly codes = inject<CodeRepository>(CodeRepository)

  /**
   * Hands rewards over
   */
  private readonly rewards = inject<RewardDelivery>(RewardDelivery)

  /**
   * Gives what the code holds
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: RedeemCodeIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const { player, session } = context

    const refusal = this.refusal(packet.code)
    if (refusal !== null) {
      context.log.info({ refusal }, 'code refused')
      return session.send<RedeemCodeOutgoing>(
        RedeemCodeOutgoing.of(packet.room, RedeemResult.Invalid),
      )
    }

    const redeemed = await this.codes.redeem(
      packet.code,
      player.accountId,
      player.gameId,
    )
    if ('refusal' in redeemed) {
      context.log.info({ refusal: redeemed.refusal }, 'code refused')
      return session.send<RedeemCodeOutgoing>(
        RedeemCodeOutgoing.of(
          packet.room,
          redeemed.refusal === 'unverified'
            ? RedeemResult.Unverified
            : RedeemResult.Invalid,
        ),
      )
    }

    context.log.info(
      { code: CodeRepository.normal(packet.code) },
      'code redeemed',
    )

    await this.rewards.deliver(session, redeemed.granted)
    await session.send<RedeemCodeOutgoing>(
      RedeemCodeOutgoing.of(packet.room, RedeemResult.Redeemed),
    )
  }

  /**
   * Finds why a code can't be tried
   * @param code The code
   * @returns The reason, or null
   */
  private refusal(code: string): string | null {
    const trimmed = code.trim()
    if (trimmed === '') return 'no code'
    if (trimmed.length > LONGEST) return 'too long'

    return null
  }
}
