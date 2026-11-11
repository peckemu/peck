import { inject } from '@needle-di/core'
import { Presence } from '@peck/cluster'
import { BuddyRepository, type RequestOutcome } from '@peck/database'
import { type Player } from '@peck/game'
import {
  BuddyChange,
  BuddyRequestIncoming,
  BuddyRequestOutgoing,
  BuddyRequestStatus,
} from '@peck/packets'
import { Handler, PacketHandler, Throttle } from '@peck/plugins'
import { UserVar } from '@peck/shared'

import { BuddyService } from '#emulator/cluster/buddies'
import { type HandlerContext } from '#emulator/dispatch/context'
import { PlayerFinder } from '#emulator/sessions/finder'
import { PlayerVariables } from '#emulator/sessions/variables'

/**
 * The outcome codes
 */
const STATUS: Partial<Record<RequestOutcome, BuddyRequestStatus>> = {
  'not-taking': BuddyRequestStatus.NotTaking,
  'unblock-first': BuddyRequestStatus.UnblockFirst,
  'my-list-full': BuddyRequestStatus.MyListFull,
  'their-list-full': BuddyRequestStatus.TheirListFull,
  sent: BuddyRequestStatus.Sent,
}

/**
 * Asks a player to be a buddy
 * @class
 */
@Throttle({ limit: 5, per: 15_000 })
@Handler(BuddyRequestIncoming)
export class BuddyRequestHandler extends PacketHandler<BuddyRequestIncoming> {
  /**
   * Finds players
   */
  private readonly finder = inject<PlayerFinder>(PlayerFinder)

  /**
   * Who is playing where
   */
  private readonly presence = inject<Presence>(Presence)

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
   * Asks to be buddies
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: BuddyRequestIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const { player, session } = context

    const target = await this.finder.find(packet.userName)
    const outcome = target ? await this.outcome(player, target) : 'not-taking'
    const name = target?.username ?? packet.userName

    if (outcome === 'already') return

    if (outcome === 'became' && target) {
      const buddy = BuddyService.entry(target)
      player.buddies.add(buddy)

      await this.variables.raise(session, UserVar.BuddiesAdded, 1)
      await this.buddies.tell(session, buddy, true, BuddyChange.Added)
      await this.buddies.publish({
        type: 'buddy-added',
        to: target.gameId,
        buddy: BuddyService.entry(player),
      })
      return
    }

    const status = STATUS[outcome] ?? BuddyRequestStatus.NotTaking
    await session.send<BuddyRequestOutgoing>(
      BuddyRequestOutgoing.of(packet.room, status, name),
    )

    if (outcome === 'sent' && target) {
      await this.buddies.publish({
        type: 'buddy-request',
        to: target.gameId,
        from: player.username,
      })
    }
  }

  /**
   * Works out what asking comes to
   * @param player The player asking
   * @param target The player asked
   * @returns What it came to
   */
  private async outcome(
    player: Player,
    target: Player,
  ): Promise<RequestOutcome> {
    const playing = (await this.presence.get(target.gameId)) !== null
    const takes =
      playing && (await this.repository.takesRequests(target.gameId))

    if (!takes) {
      return player.buddies.blocks(target.username)
        ? 'unblock-first'
        : 'not-taking'
    }

    return this.repository.request(
      player.gameId,
      target.gameId,
      player.buddyLimit,
      target.buddyLimit,
    )
  }
}
