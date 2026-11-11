import { inject } from '@needle-di/core'
import { PetRepository } from '@peck/database'
import { PetCatalogue, PetRules } from '@peck/game'
import { PetNameIncoming, PetNameOutgoing } from '@peck/packets'
import { Handler, PacketHandler } from '@peck/plugins'

import { type HandlerContext } from '#emulator/dispatch/context'
import { PetWalk } from '#emulator/handlers/pet/walk'

/**
 * Names a hatched egg
 * @class
 */
@Handler(PetNameIncoming)
export class PetNameHandler extends PacketHandler<PetNameIncoming> {
  /**
   * Every pet
   */
  private readonly pets = inject<PetCatalogue>(PetCatalogue)

  /**
   * Changes pets
   */
  private readonly repository = inject<PetRepository>(PetRepository)

  /**
   * Brings pets out
   */
  private readonly walk = inject<PetWalk>(PetWalk)

  /**
   * What pets can do
   */
  private readonly rules = inject<PetRules>(PetRules)

  /**
   * Names the pet
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: PetNameIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const { player, session } = context

    const pet = player.pets.get(packet.invId)
    const now = Math.floor(Date.now() / 1000)
    const name = this.rules.nameOf(packet.firstNameId, packet.secondNameId)
    const egg = pet ? this.pets.get(pet.defId)?.egg === true : false

    const named =
      pet && egg && pet.name === '' && pet.hatched(now) && name !== null
        ? (await this.repository.change(player.gameId, pet.invId, {
            lBits: pet.lBits,
            uBits: pet.uBits,
            eBits: pet.eBits,
            name,
          })) !== null
        : false

    if (!pet || !named || name === null) {
      return session.send<PetNameOutgoing>(PetNameOutgoing.failure(packet.room))
    }

    pet.name = name
    await session.send<PetNameOutgoing>(
      PetNameOutgoing.success(packet.room, pet.invId, name),
    )
    await this.walk.tellRoom(session)
  }
}
