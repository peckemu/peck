import { inject } from '@needle-di/core'
import { WallTokens } from '@peck/cluster'
import { WallRepository } from '@peck/database'
import { WallTokenIncoming, WallTokenOutgoing } from '@peck/packets'
import { Handler, PacketHandler, Throttle } from '@peck/plugins'

import { type HandlerContext } from '#emulator/dispatch/context'

/**
 * Gives a token for someone's wall
 * @class
 */
@Throttle({ limit: 10, per: 5_000 })
@Handler(WallTokenIncoming)
export class WallTokenHandler extends PacketHandler<WallTokenIncoming> {
  /**
   * Keeps walls
   */
  private readonly walls = inject<WallRepository>(WallRepository)

  /**
   * Wall tokens
   */
  private readonly tokens = inject<WallTokens>(WallTokens)

  /**
   * Gives the wall's token
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: WallTokenIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const { player, session } = context
    const owner = await this.walls.owner(packet.userName)
    const access = owner
      ? await this.walls.access(player.gameId, owner.gameId)
      : null

    if (!owner || !access?.read) {
      return session.send<WallTokenOutgoing>(
        WallTokenOutgoing.refused(packet.room, packet.userName),
      )
    }

    const token = await this.tokens.issue({
      holderGameId: player.gameId,
      ownerGameId: owner.gameId,
    })

    await session.send<WallTokenOutgoing>(
      WallTokenOutgoing.given(packet.room, token, access.write, owner.username),
    )
  }
}
