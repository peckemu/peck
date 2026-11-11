import { inject } from '@needle-di/core'
import { AvatarRepository } from '@peck/database'
import { AvatarRules, type Player } from '@peck/game'
import { AvatarOrdainIncoming, AvatarOrdainOutgoing } from '@peck/packets'
import { Handler, PacketHandler, Throttle } from '@peck/plugins'

import { type HandlerContext } from '#emulator/dispatch/context'

/**
 * The most animals a non-member keeps
 */
const MOST_KEPT = 2

/**
 * Chooses the animals a non-member keeps
 * @class
 */
@Throttle({ limit: 3, per: 5_000 })
@Handler(AvatarOrdainIncoming)
export class AvatarOrdainHandler extends PacketHandler<AvatarOrdainIncoming> {
  /**
   * Keeps animals
   */
  private readonly avatars = inject<AvatarRepository>(AvatarRepository)

  /**
   * Keeps the slots chosen
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: AvatarOrdainIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const { player, session } = context
    const slots = packet.avInvIds.map(Number)

    const refusal = this.refusal(player, slots)
    if (refusal !== null) {
      context.log.info({ refusal }, 'animals kept refused')
      return session.send<AvatarOrdainOutgoing>(
        AvatarOrdainOutgoing.refused(packet.room),
      )
    }

    player.avatarSlotFlags = AvatarRules.choosing(player, slots)
    await this.avatars.ordain(player.gameId, player.avatarSlotFlags)

    await session.send<AvatarOrdainOutgoing>(
      AvatarOrdainOutgoing.chosen(packet.room),
    )
  }

  /**
   * Checks the slots
   * @param player The player
   * @param slots The slots chosen
   * @returns The reason, or null
   */
  private refusal(player: Player, slots: readonly number[]): string | null {
    if (slots.length === 0 || slots.length > MOST_KEPT) {
      return 'not one or two animals'
    }
    if (new Set(slots).size !== slots.length) return 'the same animal twice'
    if (
      !slots.every((slot) => Number.isInteger(slot) && player.avatars.has(slot))
    ) {
      return 'no such animal'
    }

    return null
  }
}
