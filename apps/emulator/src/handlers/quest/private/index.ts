import { inject } from '@needle-di/core'
import { type Adventure, Adventures, type Player } from '@peck/game'
import {
  QuestJoinPrivateIncoming,
  QuestJoinPrivateOutgoing,
  QuestRefusal,
} from '@peck/packets'
import { Handler, PacketHandler } from '@peck/plugins'

import { type HandlerContext } from '#emulator/dispatch/context'
import { QuestRunner, type QuestRefused } from '#emulator/handlers/quest/runner'

/**
 * Joins a private adventure
 * @class
 */
@Handler(QuestJoinPrivateIncoming)
export class QuestJoinPrivateHandler extends PacketHandler<QuestJoinPrivateIncoming> {
  /**
   * Every adventure being played
   */
  private readonly adventures = inject<Adventures>(Adventures)

  /**
   * Runs adventures
   */
  private readonly runner = inject<QuestRunner>(QuestRunner)

  /**
   * Puts the player in the host's lobby
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: QuestJoinPrivateIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const { player, session } = context

    const host =
      context.sessions.byUsername(packet.hostUserName)?.player ?? null
    const adventure = host ? this.adventures.hostedBy(host.gameId) : null
    const refused = this.refusal(player, host, adventure)
    if (refused || !adventure) {
      const [refusal, detail] = refused ?? []
      context.log.info(
        { host: packet.hostUserName, refusal },
        'private adventure refused',
      )
      return session.send<QuestJoinPrivateOutgoing>(
        QuestJoinPrivateOutgoing.refused(
          packet.room,
          refusal ?? 'NQ',
          detail ?? null,
        ),
      )
    }

    await this.runner.enlist(session, adventure)

    await session.send<QuestJoinPrivateOutgoing>(
      QuestJoinPrivateOutgoing.joined(
        packet.room,
        adventure.id,
        adventure.template.defId,
        adventure.difficulty,
      ),
    )
    await this.runner.tellLobby(adventure)
  }

  /**
   * Checks a player can join a private adventure
   * @param player The player
   * @param host The host, or null
   * @param adventure The adventure, or null
   * @returns The refusal, or null
   */
  private refusal(
    player: Player,
    host: Player | null,
    adventure: Adventure | null,
  ): QuestRefused | null {
    if (!host || !adventure || adventure.started || host === player) {
      return [QuestRefusal.Missing, null]
    }
    if (host.buddies.blocks(player.username)) {
      return [QuestRefusal.Blocked, null]
    }
    if (adventure.full) return [QuestRefusal.Full, null]

    return this.runner.refusal(player, adventure.template, adventure.difficulty)
  }
}
