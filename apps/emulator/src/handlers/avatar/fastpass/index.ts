import { inject } from '@needle-di/core'
import { AvatarRepository } from '@peck/database'
import {
  Avatar,
  AvatarCatalogue,
  AvatarRules,
  type AvatarTemplate,
} from '@peck/game'
import { AvatarFastPassIncoming, AvatarFastPassOutgoing } from '@peck/packets'
import { Handler, PacketHandler } from '@peck/plugins'
import { AccountType, PendingFlag } from '@peck/shared'

import { type HandlerContext } from '#emulator/dispatch/context'

/**
 * The land animal bit
 */
const LAND = 1

/**
 * Makes the first animal
 * @class
 */
@Handler(AvatarFastPassIncoming)
export class AvatarFastPassHandler extends PacketHandler<AvatarFastPassIncoming> {
  /**
   * Every animal
   */
  private readonly animals = inject<AvatarCatalogue>(AvatarCatalogue)

  /**
   * What animals can do
   */
  private readonly rules = inject<AvatarRules>(AvatarRules)

  /**
   * The players' animals
   */
  private readonly repository = inject<AvatarRepository>(AvatarRepository)

  /**
   * Makes the animal
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: AvatarFastPassIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const { player, session } = context
    const nameIds = [packet.firstNameId, packet.middleNameId, packet.lastNameId]

    const animal = this.animals.get(packet.avTypeId)
    const name = this.rules.nameOf(nameIds)
    const refusal = this.refusal(animal, name, player.accountType)
    if (refusal !== null || !animal || name === null) {
      context.log.info({ refusal }, 'first animal refused')
      return session.send<AvatarFastPassOutgoing>(
        AvatarFastPassOutgoing.failure(packet.room),
      )
    }

    const [color1 = 0, color2 = 0, color3 = 0] = animal.colors

    const added = await this.repository.addFirst(player.gameId, {
      avTypeId: animal.defId,
      customAvId: -1,
      colors: [color1, color2, color3],
      eyesDefId: animal.eyesDefId,
      patternDefId: animal.patternDefId,
      avName: name,
    })

    if (!added) {
      context.log.info(
        { refusal: 'the account has an animal' },
        'first animal refused',
      )
      return session.send<AvatarFastPassOutgoing>(
        AvatarFastPassOutgoing.failure(packet.room),
      )
    }

    player.avatar = player.avatars.add(new Avatar(added))
    player.pendingFlags &= ~PendingFlag.NeedsFirstAvatar

    context.log.info({ avTypeId: animal.defId }, 'first animal made')
    await session.send<AvatarFastPassOutgoing>(
      AvatarFastPassOutgoing.success(packet.room),
    )
  }

  /**
   * Finds why an animal can't be made
   * @param animal The wanted animal
   * @param name Its name, or null
   * @param accountType The player's account type
   * @returns The reason, or null
   */
  private refusal(
    animal: AvatarTemplate | null,
    name: string | null,
    accountType: number,
  ): string | null {
    if (!animal || animal.availability <= 0) {
      return 'not an animal the creator offers'
    }
    if ((animal.enviroTypeFlags & LAND) === 0) return 'not a land animal'
    if (animal.membersOnly && accountType < AccountType.Member) {
      return 'members only'
    }
    if (name === null) return 'not a name the creator makes'

    return null
  }
}
