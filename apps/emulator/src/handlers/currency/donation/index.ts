import { inject } from '@needle-di/core'
import { ShopRepository } from '@peck/database'
import {
  CurrencyOutgoing,
  GemDonationIncoming,
  GemDonationOutgoing,
} from '@peck/packets'
import { Handler, PacketHandler, Throttle } from '@peck/plugins'

import { type HandlerContext } from '#emulator/dispatch/context'

/**
 * The gems currency
 */
const GEMS = 0

/**
 * Donates gems
 * @class
 */
@Throttle({ limit: 5, per: 5_000 })
@Handler(GemDonationIncoming)
export class GemDonationHandler extends PacketHandler<GemDonationIncoming> {
  /**
   * Pays for things
   */
  private readonly shops = inject<ShopRepository>(ShopRepository)

  /**
   * Takes the donation
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: GemDonationIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const { player, session } = context

    const refusal = this.refusal(packet.amount)
    if (refusal !== null) {
      context.log.info({ amount: packet.amount, refusal }, 'donation refused')
      return session.send<GemDonationOutgoing>(
        GemDonationOutgoing.refused(packet.room),
      )
    }

    const gems = await this.shops.donate(player.gameId, packet.amount)
    if (gems === null) {
      context.log.info({ amount: packet.amount }, 'donation not paid for')
      return session.send<GemDonationOutgoing>(
        GemDonationOutgoing.refused(packet.room),
      )
    }

    player.wallet.set('gems', gems)

    await session.send<GemDonationOutgoing>(
      GemDonationOutgoing.donated(packet.room),
    )
    await session.send<CurrencyOutgoing>(CurrencyOutgoing.of(GEMS, gems))
  }

  /**
   * Finds why a donation can't be made
   * @param amount The gems
   * @returns The reason, or null
   */
  private refusal(amount: number): string | null {
    if (!Number.isSafeInteger(amount)) return 'bad amount'
    if (amount <= 0) return 'nothing given'

    return null
  }
}
