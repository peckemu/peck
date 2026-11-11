import { inject } from '@needle-di/core'
import { PetListIncoming, PetListOutgoing } from '@peck/packets'
import { Handler, PacketHandler } from '@peck/plugins'

import { type HandlerContext } from '#emulator/dispatch/context'
import { PlayerFinder } from '#emulator/sessions/finder'

/**
 * Lists a player's pets
 * @class
 */
@Handler(PetListIncoming)
export class PetListHandler extends PacketHandler<PetListIncoming> {
  /**
   * Finds players
   */
  private readonly finder = inject<PlayerFinder>(PlayerFinder)

  /**
   * Sends a player's pets
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: PetListIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const { player, session } = context

    const own = packet.userName.toLowerCase() === player.username.toLowerCase()
    const owner = own ? player : await this.finder.find(packet.userName)

    if (!owner || (!own && player.buddies.blockedBy.has(owner.gameId))) {
      return session.send<PetListOutgoing>(PetListOutgoing.missing(packet.room))
    }

    await session.send<PetListOutgoing>(
      PetListOutgoing.of(packet.room, owner.username, [...owner.pets]),
    )
  }
}
