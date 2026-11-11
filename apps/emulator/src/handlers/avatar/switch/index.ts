import { inject } from '@needle-di/core'
import { AvatarRepository } from '@peck/database'
import { type Avatar, AvatarRules, type Player } from '@peck/game'
import { AvatarSwitchIncoming, AvatarSwitchOutgoing } from '@peck/packets'
import { Handler, PacketHandler, Throttle } from '@peck/plugins'

import { type HandlerContext } from '#emulator/dispatch/context'
import { SessionManager } from '#emulator/sessions/manager'

/**
 * Switches the player's animal
 * @class
 */
@Throttle({ limit: 5, per: 5_000 })
@Handler(AvatarSwitchIncoming)
export class AvatarSwitchHandler extends PacketHandler<AvatarSwitchIncoming> {
  /**
   * Keeps animals
   */
  private readonly avatars = inject<AvatarRepository>(AvatarRepository)

  /**
   * What animals can do
   */
  private readonly rules = inject<AvatarRules>(AvatarRules)

  /**
   * The sessions
   */
  private readonly sessions = inject<SessionManager>(SessionManager)

  /**
   * Switches the animal and shows the room
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: AvatarSwitchIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const { player, session } = context

    const next = player.findAvatar(packet.perUserAvId)
    const refusal = this.refusal(player, next)
    if (refusal !== null || !next) {
      context.log.info({ refusal }, 'animal switch refused')
      return session.send<AvatarSwitchOutgoing>(
        AvatarSwitchOutgoing.refused(packet.room),
      )
    }

    player.play(next.invId)
    await this.avatars.switch(player.gameId, next.perUserId)

    const pet = player.petWith(next)
    await session.send<AvatarSwitchOutgoing>(
      AvatarSwitchOutgoing.own(packet.room, player.id, next, pet?.invId ?? 0),
    )

    const { room } = player
    if (!room || !player.shown) return

    await this.sessions.broadcast<AvatarSwitchOutgoing>(
      room.id,
      AvatarSwitchOutgoing.other(room.id, player.id, next, pet),
      session,
    )
  }

  /**
   * Finds why the player can't switch
   * @param player The player
   * @param avatar The wanted animal
   * @returns The reason, or null
   */
  private refusal(player: Player, avatar: Avatar | null): string | null {
    if (!avatar) return 'no such animal'
    if (!AvatarRules.usable(player, avatar)) return 'slot locked'
    if (!player.member && this.rules.membersOnly(avatar.typeId)) {
      return 'members only'
    }

    const ocean = player.room?.template.enviroType === 1
    if (player.room && !this.rules.fits(avatar.typeId, ocean)) {
      return 'not an animal for this room'
    }

    return null
  }
}
