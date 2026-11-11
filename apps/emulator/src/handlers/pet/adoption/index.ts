import { inject, injectable } from '@needle-di/core'
import { type Payment, ShopRepository } from '@peck/database'
import { Pet, PetRules, type PetTemplate, PetUnlocks } from '@peck/game'
import { PetCreateOutgoing, PetsUnlockedOutgoing } from '@peck/packets'
import { UserVar } from '@peck/shared'

import { PetWalk } from '#emulator/handlers/pet/walk'
import { type Session } from '#emulator/sessions/session'
import { PlayerVariables } from '#emulator/sessions/variables'

/**
 * The personality list
 */
const PERSONALITIES = 432

/**
 * The gems currency
 */
const GEMS = 0

/**
 * The diamonds currency
 */
const DIAMONDS = 3

/**
 * How a pet is paid for
 */
export type PetPrice = {
  /**
   * The shop's list id
   */
  readonly shopId: number

  /**
   * The diamond shop entry, or 0
   */
  readonly diamondDefId: number

  /**
   * Gems 0 or diamonds 3
   */
  readonly currency: number

  /**
   * What it costs
   */
  readonly cost: number
}

/**
 * The wanted pet
 */
export type PetRequest = {
  /**
   * Its look
   */
  readonly lBits: number

  /**
   * More traits
   */
  readonly uBits: number

  /**
   * Unused look bits
   */
  readonly eBits: number

  /**
   * The first part of its name
   */
  readonly firstNameId: number

  /**
   * The second part of its name
   */
  readonly secondNameId: number
}

/**
 * Adopts pets
 * @class
 */
@injectable()
export class PetAdoption {
  /**
   * What pets can do
   */
  private readonly rules = inject<PetRules>(PetRules)

  /**
   * Pays for pets
   */
  private readonly shops = inject<ShopRepository>(ShopRepository)

  /**
   * Raises the player's counters
   */
  private readonly variables = inject<PlayerVariables>(PlayerVariables)

  /**
   * Brings pets out
   */
  private readonly walk = inject<PetWalk>(PetWalk)

  /**
   * Adopts a pet
   * @param session The player's session
   * @param room The target room
   * @param definition The pet's definition
   * @param price The price
   * @param request The wanted pet
   * @returns Whether it was adopted
   */
  public async adopt(
    session: Session,
    room: number,
    definition: PetTemplate,
    price: PetPrice,
    request: PetRequest,
  ): Promise<boolean> {
    const { player } = session
    if (!player?.avatar) return false

    const name = definition.egg
      ? ''
      : this.rules.nameOf(request.firstNameId, request.secondNameId)
    const refusal = this.rules.adoptionRefusal(
      player,
      definition,
      request,
      name,
    )
    if (refusal !== null || name === null) return false

    const diamonds = price.currency === DIAMONDS
    const costs: Payment[] =
      price.cost > 0 ? [{ currency: price.currency, amount: price.cost }] : []
    const unlocked = diamonds
      ? PetUnlocks.with(player.unlockedPets, definition.defId)
      : player.unlockedPets

    const adopted = await this.shops.adopt(player.gameId, {
      shopId: Math.max(price.shopId, 0),
      diamondDefId: price.diamondDefId,
      costs,
      lBits: request.lBits,
      uBits: request.uBits,
      name,
      personalityDefId: this.rules.pick(PERSONALITIES),
      favoriteToyDefId: this.rules.pick(definition.toyListId),
      favoriteFoodDefId: this.rules.pick(definition.foodListId),
      unlockedPets: unlocked,
      limit: player.petLimit,
    })
    if ('refusal' in adopted) return false

    player.wallet.update(adopted.balances)
    const pet = player.pets.add(new Pet(adopted.pet))
    const newlyUnlocked = unlocked !== player.unlockedPets
    player.unlockedPets = unlocked

    const ocean = PetRules.inOcean(player)
    const broughtOut = this.rules.canFollow(player, pet, ocean)

    if (price.currency === GEMS && price.cost > 0) {
      await this.variables.raise(session, UserVar.GemsSpent, price.cost)
    }
    await this.variables.raise(session, UserVar.PetCounter, 1)

    const currency = diamonds ? DIAMONDS : GEMS
    const balance = player.wallet.balance(diamonds ? 'diamonds' : 'gems')
    await session.send<PetCreateOutgoing>(
      PetCreateOutgoing.success(room, balance, currency, pet, broughtOut),
    )

    if (newlyUnlocked) {
      await session.send<PetsUnlockedOutgoing>(
        PetsUnlockedOutgoing.of(-1, unlocked),
      )
    }

    if (broughtOut) await this.walk.bringOut(session, pet.invId, ocean)

    return true
  }
}
