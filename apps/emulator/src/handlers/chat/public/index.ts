import { inject } from '@needle-di/core'
import { type Player } from '@peck/game'
import { PublicChatIncoming, RoomChatOutgoing } from '@peck/packets'
import { Handler, PacketHandler, Throttle } from '@peck/plugins'
import { ChatKind } from '@peck/shared'

import { type HandlerContext } from '#emulator/dispatch/context'
import { MinigameTables } from '#emulator/handlers/minigame/tables'

/**
 * The typed chat kinds
 */
const TYPED: ReadonlySet<number> = new Set([
  ChatKind.Free,
  ChatKind.FreeSafeChat,
])

/**
 * Repeats a public chat message to the room
 * @class
 */
@Handler(PublicChatIncoming)
@Throttle({ limit: 5, per: 1000 })
export class PublicChatHandler extends PacketHandler<PublicChatIncoming> {
  /**
   * Seats players at games
   */
  private readonly tables = inject<MinigameTables>(MinigameTables)

  /**
   * Sends a room message
   * @param packet The chat packet
   * @param context The packet context
   */
  public async handle(
    packet: PublicChatIncoming,
    context: HandlerContext,
  ): Promise<void> {
    if (packet.kind === ChatKind.CustomPvp) {
      return this.tables.host(
        context.session,
        packet.text === 'on',
        Number(packet.extra),
      )
    }

    const refusal = this.refusal(packet, context.player)
    if (refusal !== null) {
      context.log.info({ refusal }, 'chat refused')
      return
    }

    await context.room.send<RoomChatOutgoing>(RoomChatOutgoing, {
      userId: context.player.id,
      text: packet.text,
      kind: packet.kind,
      room: packet.room,
    })
  }

  /**
   * Finds why the player can't chat
   * @param packet The chat packet
   * @param player The player
   * @returns The reason, or null
   */
  private refusal(packet: PublicChatIncoming, player: Player): string | null {
    if (player.invisible) return 'invisible'
    if (TYPED.has(packet.kind) && player.muted()) return 'muted'

    return null
  }
}
