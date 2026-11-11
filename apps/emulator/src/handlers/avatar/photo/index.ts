import { inject } from '@needle-di/core'
import { ShopRepository } from '@peck/database'
import {
  AvatarPhotoCheckIncoming,
  AvatarPhotoCheckOutgoing,
  AvatarPhotoIncoming,
  AvatarPhotoOutgoing,
} from '@peck/packets'
import { Handler, PacketHandler, Throttle } from '@peck/plugins'

import { type HandlerContext } from '#emulator/dispatch/context'

/**
 * The photo booth price in gems
 */
const PHOTO_COST = 50

/**
 * Pays for a photo booth picture
 * @class
 */
@Throttle({ limit: 3, per: 5_000 })
@Handler(AvatarPhotoIncoming)
export class AvatarPhotoHandler extends PacketHandler<AvatarPhotoIncoming> {
  /**
   * Pays for photos
   */
  private readonly shops = inject<ShopRepository>(ShopRepository)

  /**
   * Takes the gems
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: AvatarPhotoIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const { player, session } = context

    const gems = await this.shops.payForPhoto(player.gameId, PHOTO_COST)

    if (gems === null) {
      context.log.info({ refusal: 'cannot afford it' }, 'photo refused')
    } else {
      player.wallet.set('gems', gems)
    }

    await session.send<AvatarPhotoOutgoing>(
      AvatarPhotoOutgoing.of(packet.room, player.wallet.balance('gems')),
    )
  }
}

/**
 * Asks about a photo booth picture
 * @class
 */
@Throttle({ limit: 5, per: 5_000 })
@Handler(AvatarPhotoCheckIncoming)
export class AvatarPhotoCheckHandler extends PacketHandler<AvatarPhotoCheckIncoming> {
  /**
   * Says whether the player has the gems
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: AvatarPhotoCheckIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const { player, session } = context

    const gems = player.wallet.balance('gems')

    await session.send<AvatarPhotoCheckOutgoing>(
      gems >= PHOTO_COST
        ? AvatarPhotoCheckOutgoing.affordable(packet.room, gems)
        : AvatarPhotoCheckOutgoing.refused(packet.room),
    )
  }
}
