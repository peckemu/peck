import { inject } from '@needle-di/core'
import { PetRepository } from '@peck/database'
import { PetRules } from '@peck/game'
import { PetReleaseIncoming, PetReleaseOutgoing } from '@peck/packets'
import { Handler, PacketHandler } from '@peck/plugins'

import { type HandlerContext } from '#emulator/dispatch/context'
import { PetWalk } from '#emulator/handlers/pet/walk'

/**
 * Frees a pet
 * @class
 */
@Handler(PetReleaseIncoming)
export class PetReleaseHandler extends PacketHandler<PetReleaseIncoming> {
  /**
   * Changes pets
   */
  private readonly repository = inject<PetRepository>(PetRepository)

  /**
   * Brings pets out
   */
  private readonly walk = inject<PetWalk>(PetWalk)

  /**
   * Frees and puts away a pet
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: PetReleaseIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const { player, session } = context

    const owned = player.pets.get(packet.invId) !== null
    if (
      !owned ||
      !(await this.repository.release(player.gameId, packet.invId))
    ) {
      return session.send<PetReleaseOutgoing>(
        PetReleaseOutgoing.failure(packet.room),
      )
    }

    const wasOut =
      player.petOut(PetRules.inOcean(player))?.invId === packet.invId

    player.pets.remove(packet.invId)
    for (const avatar of player.avatars) {
      if (avatar.landPetInvIdx === packet.invId) avatar.landPetInvIdx = 0
      if (avatar.oceanPetInvIdx === packet.invId) avatar.oceanPetInvIdx = 0
    }

    await session.send<PetReleaseOutgoing>(
      PetReleaseOutgoing.success(packet.room, packet.invId),
    )
    if (wasOut) await this.walk.tellRoom(session)
  }
}
