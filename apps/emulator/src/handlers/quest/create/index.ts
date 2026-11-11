import { inject } from '@needle-di/core'
import { Adventures, QuestCatalogue } from '@peck/game'
import {
  QuestCreateIncoming,
  QuestCreateOutgoing,
  QuestRefusal,
} from '@peck/packets'
import { Handler, PacketHandler } from '@peck/plugins'

import { type HandlerContext } from '#emulator/dispatch/context'
import { QuestRunner } from '#emulator/handlers/quest/runner'

/**
 * Opens a private adventure
 * @class
 */
@Handler(QuestCreateIncoming)
export class QuestCreateHandler extends PacketHandler<QuestCreateIncoming> {
  /**
   * Every adventure
   */
  private readonly quests = inject<QuestCatalogue>(QuestCatalogue)

  /**
   * Every adventure being played
   */
  private readonly adventures = inject<Adventures>(Adventures)

  /**
   * Runs adventures
   */
  private readonly runner = inject<QuestRunner>(QuestRunner)

  /**
   * Opens the player's own lobby
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: QuestCreateIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const { player, session } = context
    const difficulty = packet.difficulty === 1 ? 1 : 0

    const template = this.quests.get(packet.scriptDefId)
    const refused = player.member
      ? this.runner.refusal(player, template, difficulty)
      : ([QuestRefusal.Members, null] as const)
    if (refused || !template) {
      const [refusal, detail] = refused ?? []
      context.log.info(
        { scriptDefId: packet.scriptDefId, refusal },
        'private adventure refused',
      )
      return session.send<QuestCreateOutgoing>(
        QuestCreateOutgoing.refused(
          packet.room,
          refusal ?? 'NV',
          detail ?? null,
        ),
      )
    }

    await this.runner.leaveLobby(session, false)
    const adventure = this.adventures.open(template, difficulty, player.gameId)
    await this.runner.enlist(session, adventure)

    await session.send<QuestCreateOutgoing>(
      QuestCreateOutgoing.joined(packet.room, adventure.id, template.defId),
    )
    await this.runner.tellLobby(adventure)
  }
}
