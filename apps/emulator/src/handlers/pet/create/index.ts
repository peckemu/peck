import { inject } from '@needle-di/core'
import {
  DiamondCatalogue,
  DiamondType,
  PetCatalogue,
  PetUnlocks,
} from '@peck/game'
import { PetCreateIncoming, PetCreateOutgoing } from '@peck/packets'
import { Handler, PacketHandler, Throttle } from '@peck/plugins'
import { ON_SALE } from '@peck/shared'

import { type HandlerContext } from '#emulator/dispatch/context'
import { PetAdoption } from '#emulator/handlers/pet/adoption'

/**
 * The gems currency
 */
const GEMS = 0

/**
 * Adopts a pet from the pet creator
 * @class
 */
@Throttle({ limit: 10, per: 5_000 })
@Handler(PetCreateIncoming)
export class PetCreateHandler extends PacketHandler<PetCreateIncoming> {
  /**
   * Every pet
   */
  private readonly pets = inject<PetCatalogue>(PetCatalogue)

  /**
   * Every diamond shop entry
   */
  private readonly diamonds = inject<DiamondCatalogue>(DiamondCatalogue)

  /**
   * Adopts pets
   */
  private readonly adoption = inject<PetAdoption>(PetAdoption)

  /**
   * Adopts the pet
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: PetCreateIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const { player, session } = context

    const definition =
      packet.fromRedemption === 1 ? null : this.pets.get(packet.lBits & 0xff)
    const cost = definition
      ? this.cost(definition.defId, player.unlockedPets)
      : null

    const adopted =
      definition && cost !== null && cost > 0
        ? await this.adoption.adopt(
            session,
            packet.room,
            definition,
            {
              shopId: packet.shopId,
              diamondDefId: 0,
              currency: GEMS,
              cost,
            },
            packet,
          )
        : false

    if (!adopted) {
      context.log.info({ lBits: packet.lBits }, 'pet not adopted')
      await session.send<PetCreateOutgoing>(
        PetCreateOutgoing.failure(packet.room),
      )
    }
  }

  /**
   * Prices a pet in gems
   * @param defId The pet's definition id
   * @param unlockedPets The pets the player has unlocked
   * @returns The cost, or null
   */
  private cost(defId: number, unlockedPets: string): number | null {
    const definition = this.pets.get(defId)
    if (!definition) return null

    const entry = this.diamonds.selling(DiamondType.Pet, defId)
    if (entry) {
      if (!PetUnlocks.has(unlockedPets, defId)) return null

      return entry.status === ON_SALE
        ? Math.ceil(definition.cost * 0.5)
        : definition.cost
    }

    return definition.reward || definition.egg ? null : definition.cost
  }
}
