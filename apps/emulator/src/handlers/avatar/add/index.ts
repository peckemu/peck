import { inject } from '@needle-di/core'
import { PlayerRepository, ShopRepository } from '@peck/database'
import {
  Avatar,
  AvatarCatalogue,
  AvatarRules,
  type AvatarTemplate,
  type Cost,
  type Player,
} from '@peck/game'
import {
  AvatarAddIncoming,
  AvatarAddOutgoing,
  CurrencyOutgoing,
  UserVariableChangedOutgoing,
} from '@peck/packets'
import { Handler, PacketHandler, Throttle } from '@peck/plugins'
import { CURRENCIES } from '@peck/shared'

import { type HandlerContext } from '#emulator/dispatch/context'

/**
 * The diamonds currency
 */
const DIAMONDS = 3

/**
 * Buys another animal
 * @class
 */
@Throttle({ limit: 3, per: 5_000 })
@Handler(AvatarAddIncoming)
export class AvatarAddHandler extends PacketHandler<AvatarAddIncoming> {
  /**
   * Every animal
   */
  private readonly animals = inject<AvatarCatalogue>(AvatarCatalogue)

  /**
   * What animals can do
   */
  private readonly rules = inject<AvatarRules>(AvatarRules)

  /**
   * Pays for animals
   */
  private readonly shops = inject<ShopRepository>(ShopRepository)

  /**
   * The players
   */
  private readonly players = inject<PlayerRepository>(PlayerRepository)

  /**
   * Pays for the animal and adds it
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: AvatarAddIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const { player, session } = context

    const animal = this.animals.get(packet.avTypeId)
    const name = this.rules.nameOf([
      packet.firstNameId,
      packet.middleNameId,
      packet.lastNameId,
    ])
    const cost = animal
      ? this.rules.price(player, animal, packet.diamondDefId)
      : null
    const slot = AvatarRules.freeSlot(player)

    const refusal = this.refusal(player, packet, animal, name, cost)
    if (
      refusal !== null ||
      !animal ||
      name === null ||
      !cost ||
      slot === null
    ) {
      context.log.info({ refusal: refusal ?? 'no free slot' }, 'animal refused')
      return session.send<AvatarAddOutgoing>(
        AvatarAddOutgoing.refused(packet.room),
      )
    }

    const [color1 = 0, color2 = 0, color3 = 0] = animal.colors
    const avatarSlotFlags = AvatarRules.opening(player, slot)

    const bought = await this.shops.buyAnimal(player.gameId, {
      look: {
        avTypeId: animal.defId,
        customAvId: -1,
        colors: [color1, color2, color3],
        eyesDefId: animal.eyesDefId,
        patternDefId: animal.patternDefId,
        avName: name,
      },
      slot,
      cost,
      diamondDefId: Math.max(packet.diamondDefId, 0),
      shopId: Math.max(packet.shopId, 0),
      avatarSlotFlags,
    })

    if (!bought) {
      context.log.info({ refusal: 'could not pay' }, 'animal refused')
      return session.send<AvatarAddOutgoing>(
        AvatarAddOutgoing.refused(packet.room),
      )
    }

    const avatar = player.avatars.add(new Avatar(bought.avatar))
    player.avatarSlotFlags = avatarSlotFlags
    player.wallet.update(bought.balances)

    const currency = CURRENCIES[cost.currency] ?? 'gems'

    await session.send<AvatarAddOutgoing>(
      AvatarAddOutgoing.added(packet.room, avatar.perUserId, avatar.invId),
    )
    await session.send<CurrencyOutgoing>(
      CurrencyOutgoing.of(cost.currency, player.wallet.balance(currency)),
    )

    if (cost.currency === DIAMONDS) await this.unlock(player, animal, context)
  }

  /**
   * Unlocks a diamond animal
   * @param player The player
   * @param animal The animal
   * @param context The packet context
   */
  private async unlock(
    player: Player,
    animal: AvatarTemplate,
    context: HandlerContext,
  ): Promise<void> {
    const unlocked = AvatarRules.unlocking(player, animal.defId)
    if (!unlocked) return

    player.variables.set(unlocked.varId, unlocked)
    await this.players.setVariable(
      player.gameId,
      unlocked.varId,
      unlocked.type,
      unlocked.value,
    )

    await context.session.send<UserVariableChangedOutgoing>(
      UserVariableChangedOutgoing.of(unlocked.varId, unlocked.value),
    )
  }

  /**
   * Finds why the animal can't be added
   * @param player The player
   * @param packet The packet
   * @param animal The wanted animal
   * @param name Its name, or null
   * @param cost What it costs, or null
   * @returns The reason, or null
   */
  private refusal(
    player: Player,
    packet: AvatarAddIncoming,
    animal: AvatarTemplate | null,
    name: string | null,
    cost: Cost | null,
  ): string | null {
    if (!player.avatar) return 'no first animal yet'
    if (packet.customAvId !== -1) return 'not an animal the creator offers'
    if (!animal || animal.availability <= 0) {
      return 'not an animal the creator offers'
    }
    if (animal.membersOnly && !player.member) return 'members only'
    if (name === null) return 'not a name the creator makes'
    if (!cost) return 'not a price the creator offers'
    if (!AvatarRules.canOpen(player)) return 'no open slot'

    const currency = CURRENCIES[cost.currency]
    if (!currency || !player.wallet.canAfford(currency, cost.amount)) {
      return 'cannot afford it'
    }

    return null
  }
}
