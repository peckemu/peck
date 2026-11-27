import { inject, injectable } from '@needle-di/core'
import { type GrantedReward } from '@peck/database'
import { DenItemCatalogue, Item } from '@peck/game'
import {
  CurrencyOutgoing,
  DenItemsOutgoing,
  ItemListOutgoing,
  MembershipRedeemedOutgoing,
} from '@peck/packets'
import { type AccountType } from '@peck/shared'

import { type Session } from '../session/index.ts'

/**
 * The gems currency
 */
const GEMS = 0

/**
 * The diamonds currency
 */
const DIAMONDS = 3

/**
 * Where a membership came from
 */
const SOURCE = '0'

/**
 * Hands granted rewards to a player
 * @class
 */
@injectable()
export class RewardDelivery {
  /**
   * Every den item
   */
  private readonly denItems = inject<DenItemCatalogue>(DenItemCatalogue)

  /**
   * Hands a reward over
   * @param session The session
   * @param granted What the reward gave
   */
  public async deliver(
    session: Session,
    granted: GrantedReward,
  ): Promise<void> {
    const { player } = session
    if (!player) return

    if (granted.gems !== null) {
      player.wallet.set('gems', granted.gems)
      await session.send<CurrencyOutgoing>(
        CurrencyOutgoing.of(GEMS, granted.gems),
      )
    }
    if (granted.diamonds !== null) {
      player.wallet.set('diamonds', granted.diamonds)
      await session.send<CurrencyOutgoing>(
        CurrencyOutgoing.of(DIAMONDS, granted.diamonds),
      )
    }

    const clothing = granted.items.filter(({ kind }) => kind === 'clothing')
    const denItems = granted.items.filter(({ kind }) => kind === 'den-item')

    for (const { invIdx, defId, color } of clothing) {
      player.items.add(new Item({ invId: invIdx, defId, color }))
    }
    for (const { invIdx, defId } of denItems) {
      player.denItems.push({
        invIdx,
        defId,
        categoryId: 0,
        version: 0,
        x: 0,
        y: 0,
        flipped: false,
        userNameLink: '',
        denStoreInvIdx: 0,
      })
    }

    const [first] = clothing
    if (first && player.avatar) {
      await session.send<ItemListOutgoing>(
        ItemListOutgoing.changed(player, player.avatar, {
          wear: false,
          color: first.color,
          added: clothing.map(({ invIdx, defId }) => ({
            invId: invIdx,
            defId,
          })),
          removed: [],
        }),
      )
    }
    if (denItems.length > 0) {
      await session.send<DenItemsOutgoing>(
        DenItemsOutgoing.of(
          -1,
          player.activeDenInvIdx,
          player.denItems,
          (id) => this.denItems.isMannequin(id),
          player.placedPets.map(({ invId }) => invId),
        ),
      )
    }

    if (granted.membershipDays > 0) {
      player.accountType = granted.accountType as AccountType
      await session.send<MembershipRedeemedOutgoing>(
        MembershipRedeemedOutgoing.redeemed(
          granted.accountType,
          granted.membershipDays,
          SOURCE,
        ),
      )
    }
  }
}
