import { inject } from '@needle-di/core'
import { PetRules } from '@peck/game'
import { PetSwitchIncoming, PetSwitchOutgoing } from '@peck/packets'
import { Handler, PacketHandler } from '@peck/plugins'

import { type HandlerContext } from '#emulator/dispatch/context'
import { PetWalk } from '#emulator/handlers/pet/walk'

/**
 * Chooses the player's pet
 * @class
 */
@Handler(PetSwitchIncoming)
export class PetSwitchHandler extends PacketHandler<PetSwitchIncoming> {
  /**
   * Brings pets out
   */
  private readonly walk = inject<PetWalk>(PetWalk)

  /**
   * What pets can do
   */
  private readonly rules = inject<PetRules>(PetRules)

  /**
   * Brings the pet out
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: PetSwitchIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const { player, session } = context

    const ocean = PetRules.inOcean(player)
    const pet = packet.invId === 0 ? null : player.pets.get(packet.invId)
    const allowed =
      packet.invId === 0 || (!!pet && this.rules.canFollow(player, pet, ocean))

    if (!player.avatar || !allowed) {
      return session.send<PetSwitchOutgoing>(
        PetSwitchOutgoing.failure(packet.room),
      )
    }

    await session.send<PetSwitchOutgoing>(
      PetSwitchOutgoing.own(player.roomId, player.id, packet.invId),
    )
    await this.walk.bringOut(session, packet.invId, ocean)
  }
}
