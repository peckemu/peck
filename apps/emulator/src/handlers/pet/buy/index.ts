import { inject } from '@needle-di/core'
import { DiamondCatalogue, DiamondType, PetCatalogue } from '@peck/game'
import { PetBuyIncoming, PetCreateOutgoing } from '@peck/packets'
import { Handler, PacketHandler, Throttle } from '@peck/plugins'
import { ON_SALE } from '@peck/shared'

import { type HandlerContext } from '#emulator/dispatch/context'
import { PetAdoption } from '#emulator/handlers/pet/adoption'

/**
 * The diamonds currency
 */
const DIAMONDS = 3

/**
 * Adopts a diamond pet
 * @class
 */
@Throttle({ limit: 10, per: 5_000 })
@Handler(PetBuyIncoming)
export class PetBuyHandler extends PacketHandler<PetBuyIncoming> {
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
    packet: PetBuyIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const { session } = context

    const entry = this.diamonds.get(packet.itemDefId)
    const definition = this.pets.get(packet.lBits & 0xff)
    const sells =
      !!entry &&
      !!definition &&
      packet.fromRedemption !== 1 &&
      this.diamonds.selling(DiamondType.Pet, definition.defId)?.defId ===
        entry.defId

    let adopted = false
    if (sells) {
      adopted = await this.adoption.adopt(
        session,
        packet.room,
        definition,
        {
          shopId: packet.shopId,
          diamondDefId: entry.defId,
          currency: DIAMONDS,
          cost:
            entry.status === ON_SALE ? Math.ceil(entry.cost * 0.5) : entry.cost,
        },
        packet,
      )
    }

    if (!adopted) {
      context.log.info(
        { itemDefId: packet.itemDefId },
        'diamond pet not adopted',
      )
      await session.send<PetCreateOutgoing>(
        PetCreateOutgoing.failure(packet.room),
      )
    }
  }
}
