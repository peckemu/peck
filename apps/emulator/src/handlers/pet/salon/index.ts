import { inject } from '@needle-di/core'
import { PetRepository } from '@peck/database'
import { PetSalonIncoming, PetSalonOutgoing } from '@peck/packets'
import { Handler, PacketHandler } from '@peck/plugins'

import { type HandlerContext } from '#emulator/dispatch/context'
import { PetWalk } from '#emulator/handlers/pet/walk'

/**
 * The salon price in gems
 */
const SALON_GEMS = 200

/**
 * The salon looks' place in the bits
 */
const SALON_MASK = 0xfff000

/**
 * Changes the pet out in the salon
 * @class
 */
@Handler(PetSalonIncoming)
export class PetSalonHandler extends PacketHandler<PetSalonIncoming> {
  /**
   * Changes pets
   */
  private readonly repository = inject<PetRepository>(PetRepository)

  /**
   * Brings pets out
   */
  private readonly walk = inject<PetWalk>(PetWalk)

  /**
   * Pays for new looks
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: PetSalonIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const { player, session } = context

    const pet = player.petOut(packet.enviroType === 1)
    const looks = [packet.cat9, packet.cat10, packet.cat11]
    const valid = looks.every(
      (look) => Number.isInteger(look) && look >= 0 && look <= 15,
    )

    const uBits =
      (((pet?.uBits ?? 0) & ~SALON_MASK) |
        (packet.cat9 << 12) |
        (packet.cat10 << 16) |
        (packet.cat11 << 20)) >>>
      0
    const gems =
      pet && valid
        ? await this.repository.change(
            player.gameId,
            pet.invId,
            { lBits: pet.lBits, uBits, eBits: pet.eBits },
            SALON_GEMS,
          )
        : null

    if (!pet || gems === null) {
      return session.send<PetSalonOutgoing>(
        PetSalonOutgoing.failure(packet.room),
      )
    }

    pet.uBits = uBits
    player.wallet.set('gems', gems)

    await session.send<PetSalonOutgoing>(
      PetSalonOutgoing.success(packet.room, gems, pet),
    )
    await this.walk.tellRoom(session)
  }
}
