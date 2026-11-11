import { inject } from '@needle-di/core'
import { EcoRepository } from '@peck/database'
import { ECO_CREDIT_SECONDS, EcoRules } from '@peck/game'
import {
  CurrencyOutgoing,
  DenEcoRedeemIncoming,
  DenEcoRedeemOutgoing,
} from '@peck/packets'
import { Handler, PacketHandler, Throttle } from '@peck/plugins'
import { CURRENCIES } from '@peck/shared'

import { type HandlerContext } from '#emulator/dispatch/context'

/**
 * The eco credits currency
 */
const ECO_CREDITS = CURRENCIES.indexOf('ecoCredits')

/**
 * Redeems the den's eco credits
 * @class
 */
@Throttle({ limit: 5, per: 5_000 })
@Handler(DenEcoRedeemIncoming)
export class DenEcoRedeemHandler extends PacketHandler<DenEcoRedeemIncoming> {
  /**
   * Keeps den eco systems
   */
  private readonly eco = inject<EcoRepository>(EcoRepository)

  /**
   * How a den's eco system works
   */
  private readonly rules = inject<EcoRules>(EcoRules)

  /**
   * Redeems the eco credits
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: DenEcoRedeemIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const { player, session } = context
    const now = new Date()

    const generating = this.rules.power(player.denItems).generation > 0
    const stored = await this.eco.meter(player.gameId)
    const meter = stored ? EcoRules.accrue(stored, generating, now) : null

    const balance =
      meter && meter.unredeemed > 0
        ? await this.eco.redeem(
            player.gameId,
            meter.unredeemed,
            generating ? now : null,
          )
        : null

    if (balance === null) {
      if (meter) await this.eco.keep(player.gameId, meter)
      context.log.info('eco redeem refused')
      return session.send<DenEcoRedeemOutgoing>(
        DenEcoRedeemOutgoing.refused(packet.room),
      )
    }

    player.wallet.set('ecoCredits', balance)
    await session.send<CurrencyOutgoing>(
      CurrencyOutgoing.of(ECO_CREDITS, balance),
    )
    await session.send<DenEcoRedeemOutgoing>(
      DenEcoRedeemOutgoing.redeemed(
        packet.room,
        generating ? ECO_CREDIT_SECONDS : 0,
      ),
    )
  }
}
