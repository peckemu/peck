import { inject, injectable } from '@needle-di/core'
import { type SpinGift, SpinRepository } from '@peck/database'
import {
  DailySpin,
  Item,
  ItemCatalogue,
  type Player,
  ShopStock,
  SpinPrize,
} from '@peck/game'
import {
  CurrencyOutgoing,
  ItemListOutgoing,
  UserVariableChangedOutgoing,
} from '@peck/packets'
import { CURRENCIES, ShopListType, UserVar } from '@peck/shared'

import { type Session } from '#emulator/sessions/session'
import { PlayerVariables } from '#emulator/sessions/variables'

/**
 * Jam Mart Clothing's list
 */
const PRESENT_SHOP = 11

/**
 * The daily gem bonus's type
 */
const BONUS_TYPE = 2

/**
 * Spins the daily wheel
 * @class
 */
@injectable()
export class DailySpins {
  /**
   * The daily spin rules
   */
  private readonly rules = inject<DailySpin>(DailySpin)

  /**
   * Keeps daily spins
   */
  private readonly spins = inject<SpinRepository>(SpinRepository)

  /**
   * The shop stock
   */
  private readonly stock = inject<ShopStock>(ShopStock)

  /**
   * Every clothing item
   */
  private readonly items = inject<ItemCatalogue>(ItemCatalogue)

  /**
   * Raises the player's counters
   */
  private readonly variables = inject<PlayerVariables>(PlayerVariables)

  /**
   * The players spinning now
   */
  private readonly spinning = new Set<number>()

  /**
   * Spins the wheel
   * @param session The player's session
   */
  public async spin(session: Session): Promise<void> {
    const { player } = session
    if (!player || this.spinning.has(player.gameId)) return

    this.spinning.add(player.gameId)
    try {
      await this.play(session, player)
    } finally {
      this.spinning.delete(player.gameId)
    }
  }

  /**
   * Draws and pays a spin
   * @param session The player's session
   * @param player The player
   */
  private async play(session: Session, player: Player): Promise<void> {
    const today = this.rules.today()
    const kept = player.variables.get(UserVar.DailyGemBonus)
    const last = DailySpin.read(kept?.value)

    const refusal = DailySpin.refusal(last, today)
    if (refusal !== null) {
      session.log.info({ refusal }, 'daily spin refused')
      return this.undo(session, player)
    }

    const wheel = DailySpin.wheelOf(player.member)
    const multiplier = DailySpin.multiplier(last, today)
    const presents = this.presents(player, multiplier)
    const prize = this.rules.draw(wheel, presents.length > 0)
    const payout = DailySpin.payout(prize, multiplier)
    const present =
      prize === SpinPrize.Gift ? this.rules.pick<SpinGift>(presents) : null
    const value = DailySpin.pack({ prize, multiplier, day: today })

    const spun = await this.spins.spin(player.gameId, {
      varId: UserVar.DailyGemBonus,
      previous: kept?.value ?? null,
      type: BONUS_TYPE,
      value,
      currency: payout?.currency ?? null,
      amount: payout?.amount ?? 0,
      gifts: present ? Array.from({ length: multiplier }, () => present) : [],
    })
    if (!spun) {
      session.log.info({ refusal: 'spun elsewhere' }, 'daily spin refused')
      return this.undo(session, player)
    }

    player.variables.set(UserVar.DailyGemBonus, {
      varId: UserVar.DailyGemBonus,
      type: BONUS_TYPE,
      value,
    })
    await session.send<UserVariableChangedOutgoing>(
      UserVariableChangedOutgoing.of(UserVar.DailyGemBonus, value),
    )

    if (payout) {
      player.wallet.set(payout.currency, spun.balance)
      await session.send<CurrencyOutgoing>(
        CurrencyOutgoing.of(CURRENCIES.indexOf(payout.currency), spun.balance),
      )
    }
    if (payout?.currency === 'gems') {
      await this.variables.raise(session, UserVar.GemsEarned, payout.amount)
    }

    await this.give(session, player, spun.items)

    session.log.info({ wheel, prize, multiplier }, 'daily spin')
  }

  /**
   * Puts the client's sums back
   * @param session The player's session
   * @param player The player
   */
  private async undo(session: Session, player: Player): Promise<void> {
    const kept = player.variables.get(UserVar.DailyGemBonus)

    await session.send<UserVariableChangedOutgoing>(
      UserVariableChangedOutgoing.of(UserVar.DailyGemBonus, kept?.value ?? 0),
    )

    for (const currency of ['gems', 'diamonds'] as const) {
      await session.send<CurrencyOutgoing>(
        CurrencyOutgoing.of(
          CURRENCIES.indexOf(currency),
          player.wallet.balance(currency),
        ),
      )
    }
  }

  /**
   * Lists the clothing a present can be
   * @param player The player
   * @param multiplier How many are given
   * @returns The presents
   */
  private presents(player: Player, multiplier: number): SpinGift[] {
    if (player.items.size + multiplier > player.clothingLimit) return []

    const ids = this.stock.shelf(PRESENT_SHOP)?.get(ShopListType.Clothing) ?? []

    return ids.flatMap((defId) => {
      const item = this.items.get(defId)
      if (!item || (item.membersOnly && !player.member)) return []

      return [{ defId, color: (item.colors[0] ?? 0) >>> 0 }]
    })
  }

  /**
   * Hands over the presents
   * @param session The player's session
   * @param player The player
   * @param given The items given
   */
  private async give(
    session: Session,
    player: Player,
    given: readonly (SpinGift & { readonly invId: number })[],
  ): Promise<void> {
    const [first] = given
    const { avatar } = player
    if (!first) return

    for (const { invId, defId, color } of given) {
      player.items.add(new Item({ invId, defId, color }))
    }
    if (!avatar) return

    await session.send<ItemListOutgoing>(
      ItemListOutgoing.changed(player, avatar, {
        wear: false,
        color: first.color,
        added: given.map(({ invId, defId }) => ({ invId, defId })),
        removed: [],
      }),
    )
  }
}
