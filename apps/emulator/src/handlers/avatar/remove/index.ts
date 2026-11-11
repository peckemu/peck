import { inject } from '@needle-di/core'
import { ShopRepository } from '@peck/database'
import { type Avatar, AvatarRules, type Item, type Player } from '@peck/game'
import { AvatarRemoveIncoming, AvatarRemoveOutgoing } from '@peck/packets'
import { Handler, PacketHandler, Throttle } from '@peck/plugins'

import { type HandlerContext } from '#emulator/dispatch/context'

/**
 * Removes one of the player's animals for gems
 * @class
 */
@Throttle({ limit: 3, per: 5_000 })
@Handler(AvatarRemoveIncoming)
export class AvatarRemoveHandler extends PacketHandler<AvatarRemoveIncoming> {
  /**
   * What animals can do
   */
  private readonly rules = inject<AvatarRules>(AvatarRules)

  /**
   * Recycles animals
   */
  private readonly shops = inject<ShopRepository>(ShopRepository)

  /**
   * Removes an animal
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: AvatarRemoveIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const { player, session } = context

    const target = player.findAvatar(packet.perUserAvId)
    const refusal = this.refusal(player, target)
    if (refusal !== null || !target) {
      context.log.info({ refusal }, 'animal removal refused')
      return session.send<AvatarRemoveOutgoing>(
        AvatarRemoveOutgoing.refused(
          packet.room,
          player.wallet.balance('gems'),
        ),
      )
    }

    const worn = player.worn(target)
    for (const item of worn) target.takeOff(item)

    const gems = await this.shops.recycleAnimal(player.gameId, {
      perUserAvId: target.perUserId,
      gems: this.rules.recycleValue(target.typeId),
      items: worn.map((item) => ({
        invId: item.invId,
        equippedAvatars: item.equippedAvatars,
      })),
    })

    if (gems === null) {
      AvatarRemoveHandler.dress(target, worn)
      context.log.info({ refusal: 'not kept' }, 'animal removal refused')
      return session.send<AvatarRemoveOutgoing>(
        AvatarRemoveOutgoing.refused(
          packet.room,
          player.wallet.balance('gems'),
        ),
      )
    }

    player.avatars.remove(target.invId)
    player.wallet.set('gems', gems)

    await session.send<AvatarRemoveOutgoing>(
      AvatarRemoveOutgoing.removed(packet.room, gems),
    )
  }

  /**
   * Finds why the animal can't be removed
   * @param player The player
   * @param avatar The wanted animal
   * @returns The reason, or null
   */
  private refusal(player: Player, avatar: Avatar | null): string | null {
    if (!avatar) return 'no such animal'
    if (avatar === player.avatar) return 'playing as it'
    if (player.avatars.size <= 1) return 'the last animal'

    return null
  }

  /**
   * Puts clothing back on
   * @param avatar The animal
   * @param items The items
   */
  private static dress(avatar: Avatar, items: readonly Item[]): void {
    for (const item of items) avatar.wear(item)
  }
}
