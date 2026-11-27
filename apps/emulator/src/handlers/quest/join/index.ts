import { inject } from '@needle-di/core'
import { Adventures, QuestCatalogue } from '@peck/game'
import { QuestJoinIncoming, QuestJoinOutgoing } from '@peck/packets'
import { Handler, PacketHandler } from '@peck/plugins'

import { type HandlerContext } from '../../../dispatch/context/index.ts'
import { QuestRunner } from '../runner/index.ts'

/**
 * Joins or opens a public adventure
 * @class
 */
@Handler(QuestJoinIncoming)
export class QuestJoinHandler extends PacketHandler<QuestJoinIncoming> {
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
   * Puts the player in a lobby
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: QuestJoinIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const { player, session } = context
    const difficulty = packet.difficulty === 1 ? 1 : 0

    const template = this.quests.get(packet.scriptDefId)
    const refused = this.runner.refusal(player, template, difficulty)
    if (refused || !template) {
      const [refusal, detail] = refused ?? []
      context.log.info(
        { scriptDefId: packet.scriptDefId, refusal },
        'adventure refused',
      )
      return session.send<QuestJoinOutgoing>(
        QuestJoinOutgoing.refused(packet.room, refusal ?? 'NV', detail ?? null),
      )
    }

    const adventure =
      this.adventures.lobbyFor(template.defId, difficulty) ??
      this.adventures.open(template, difficulty)
    await this.runner.enlist(session, adventure)

    await session.send<QuestJoinOutgoing>(
      QuestJoinOutgoing.joined(
        packet.room,
        adventure.id,
        template.defId,
        difficulty,
      ),
    )
    await this.runner.tellLobby(adventure)
  }
}
