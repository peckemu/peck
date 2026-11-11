import { inject, injectable } from '@needle-di/core'
import { PetRepository } from '@peck/database'
import { PetRules } from '@peck/game'
import { PetSwitchOutgoing } from '@peck/packets'

import { SessionManager } from '#emulator/sessions/manager'
import { type Session } from '#emulator/sessions/session'

/**
 * Brings pets out
 * @class
 */
@injectable()
export class PetWalk {
  /**
   * Changes pets
   */
  private readonly repository = inject<PetRepository>(PetRepository)

  /**
   * Every open session
   */
  private readonly sessions = inject<SessionManager>(SessionManager)

  /**
   * Brings a pet out
   * @param session The player's session
   * @param invIdx The pet, or 0
   * @param ocean Whether it is the ocean pet
   */
  public async bringOut(
    session: Session,
    invIdx: number,
    ocean: boolean,
  ): Promise<void> {
    const { player } = session
    const avatar = player?.avatar
    if (!player || !avatar) return

    if (ocean) avatar.oceanPetInvIdx = invIdx
    else avatar.landPetInvIdx = invIdx

    await this.repository.choose(player.gameId, avatar.perUserId, ocean, invIdx)
    await this.tellRoom(session)
  }

  /**
   * Shows a player's pet
   * @param session The player's session
   */
  public async tellRoom(session: Session): Promise<void> {
    const { player } = session
    if (!player?.shown) return

    const pet = player.petOut(PetRules.inOcean(player))

    await this.sessions.broadcast<PetSwitchOutgoing>(
      player.roomId,
      PetSwitchOutgoing.other(player.roomId, player.id, pet),
      session,
    )
  }
}
