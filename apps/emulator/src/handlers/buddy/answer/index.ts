import { inject } from '@needle-di/core'
import { BuddyRepository } from '@peck/database'
import {
  BuddyAnswerIncoming,
  BuddyChange,
  BuddyRequestOutgoing,
  BuddyRequestStatus,
} from '@peck/packets'
import { Handler, PacketHandler } from '@peck/plugins'
import { UserVar } from '@peck/shared'

import { BuddyService } from '../../../cluster/buddies/index.ts'
import { type HandlerContext } from '../../../dispatch/context/index.ts'
import { PlayerFinder } from '../../../sessions/finder/index.ts'
import { PlayerVariables } from '../../../sessions/variables/index.ts'

/**
 * Answers a buddy request
 * @class
 */
@Handler(BuddyAnswerIncoming)
export class BuddyAnswerHandler extends PacketHandler<BuddyAnswerIncoming> {
  /**
   * Finds players
   */
  private readonly finder = inject<PlayerFinder>(PlayerFinder)

  /**
   * The buddies and blocks
   */
  private readonly repository = inject<BuddyRepository>(BuddyRepository)

  /**
   * Buddies across the cluster
   */
  private readonly buddies = inject<BuddyService>(BuddyService)

  /**
   * Raises the player's counters
   */
  private readonly variables = inject<PlayerVariables>(PlayerVariables)

  /**
   * Answers a buddy request
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: BuddyAnswerIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const { player, session } = context

    const asker = await this.finder.find(packet.userName)
    if (!asker) return

    const accept = packet.accept === 1
    const outcome = await this.repository.answer(
      player.gameId,
      asker.gameId,
      accept,
      player.buddyLimit,
      asker.buddyLimit,
    )

    switch (outcome) {
      case 'became': {
        const buddy = BuddyService.entry(asker)
        player.buddies.add(buddy)

        await this.variables.raise(session, UserVar.BuddiesAdded, 1)
        await this.buddies.tell(session, buddy, true, BuddyChange.Added)
        return this.buddies.publish({
          type: 'buddy-added',
          to: asker.gameId,
          buddy: BuddyService.entry(player),
        })
      }

      case 'my-list-full':
        return session.send<BuddyRequestOutgoing>(
          BuddyRequestOutgoing.of(
            -1,
            BuddyRequestStatus.MyListFull,
            asker.username,
          ),
        )

      case 'their-list-full':
        return session.send<BuddyRequestOutgoing>(
          BuddyRequestOutgoing.of(
            -1,
            BuddyRequestStatus.TheirListFull,
            asker.username,
          ),
        )

      case 'declined':
        return this.buddies.publish({
          type: 'buddy-declined',
          to: asker.gameId,
          username: player.username,
        })

      case 'none':
        return
    }
  }
}
