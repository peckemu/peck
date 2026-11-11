import { inject } from '@needle-di/core'
import { type Adventure, Adventures, type Player } from '@peck/game'
import {
  QuestJoinBuddyIncoming,
  QuestJoinOutgoing,
  QuestRefusal,
} from '@peck/packets'
import { Handler, PacketHandler } from '@peck/plugins'

import { type HandlerContext } from '#emulator/dispatch/context'
import { QuestRunner, type QuestRefused } from '#emulator/handlers/quest/runner'

/**
 * Joins a buddy's adventure
 * @class
 */
@Handler(QuestJoinBuddyIncoming)
export class QuestJoinBuddyHandler extends PacketHandler<QuestJoinBuddyIncoming> {
  /**
   * Every adventure being played
   */
  private readonly adventures = inject<Adventures>(Adventures)

  /**
   * Runs adventures
   */
  private readonly runner = inject<QuestRunner>(QuestRunner)

  /**
   * Puts the player in their buddy's lobby
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: QuestJoinBuddyIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const { player, session } = context

    const buddy =
      context.sessions.byUsername(packet.buddyUserName)?.player ?? null
    const adventure = buddy ? this.adventures.of(buddy.gameId) : null
    const refused = this.refusal(player, buddy, adventure)
    if (refused || !adventure) {
      const [refusal, detail] = refused ?? []
      context.log.info(
        { buddy: packet.buddyUserName, refusal },
        'buddy adventure refused',
      )
      return session.send<QuestJoinOutgoing>(
        QuestJoinOutgoing.refused(packet.room, refusal ?? 'NV', detail ?? null),
      )
    }

    await this.runner.enlist(session, adventure)

    await session.send<QuestJoinOutgoing>(
      QuestJoinOutgoing.joined(
        packet.room,
        adventure.id,
        adventure.template.defId,
        adventure.difficulty,
      ),
    )
    await this.runner.tellLobby(adventure)
  }

  /**
   * Checks a player can join a buddy's adventure
   * @param player The player
   * @param buddy The buddy, or null
   * @param adventure The adventure, or null
   * @returns The refusal, or null
   */
  private refusal(
    player: Player,
    buddy: Player | null,
    adventure: Adventure | null,
  ): QuestRefused | null {
    if (!buddy || !adventure || adventure.started || buddy === player) {
      return [QuestRefusal.Invalid, null]
    }
    if (!player.buddies.has(buddy.username)) return [QuestRefusal.Invalid, null]
    if (buddy.buddies.blocks(player.username)) {
      return [QuestRefusal.Blocked, null]
    }
    if (adventure.full) return [QuestRefusal.Full, null]

    return this.runner.refusal(player, adventure.template, adventure.difficulty)
  }
}
