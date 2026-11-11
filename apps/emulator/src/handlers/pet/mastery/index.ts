import { inject } from '@needle-di/core'
import { PetRepository } from '@peck/database'
import { PetMasteryIncoming, PetMasteryOutgoing } from '@peck/packets'
import { Handler, PacketHandler } from '@peck/plugins'

import { type HandlerContext } from '#emulator/dispatch/context'
import { PetWalk } from '#emulator/handlers/pet/walk'

/**
 * The mastery points the badge needs
 */
const MASTERY = 100

/**
 * The badge's place in the bits
 */
const BADGE_MASK = 0xf00

/**
 * Shows or hides a pet's mastery badge
 * @class
 */
@Handler(PetMasteryIncoming)
export class PetMasteryHandler extends PacketHandler<PetMasteryIncoming> {
  /**
   * Changes pets
   */
  private readonly repository = inject<PetRepository>(PetRepository)

  /**
   * Brings pets out
   */
  private readonly walk = inject<PetWalk>(PetWalk)

  /**
   * Sets the pet's mastery
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: PetMasteryIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const { player, session } = context

    const pet = player.pets.get(packet.invId)
    const show = packet.show === 1
    const uBits =
      (((pet?.uBits ?? 0) & ~BADGE_MASK) | ((show ? 1 : 0) << 8)) >>> 0

    const changed =
      pet && !(show && pet.masteryCounter < MASTERY)
        ? (await this.repository.change(player.gameId, pet.invId, {
            lBits: pet.lBits,
            uBits,
            eBits: pet.eBits,
          })) !== null
        : false

    if (!pet || !changed) {
      return session.send<PetMasteryOutgoing>(
        PetMasteryOutgoing.failure(packet.room),
      )
    }

    pet.uBits = uBits
    await session.send<PetMasteryOutgoing>(
      PetMasteryOutgoing.success(packet.room, pet),
    )
    await this.walk.tellRoom(session)
  }
}
