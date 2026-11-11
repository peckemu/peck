import { inject } from '@needle-di/core'
import { EcoRepository } from '@peck/database'
import { EcoRules } from '@peck/game'
import { DenEcoStateIncoming, DenEcoStateOutgoing } from '@peck/packets'
import { Handler, PacketHandler, Throttle } from '@peck/plugins'
import { UserVar } from '@peck/shared'

import { type HandlerContext } from '#emulator/dispatch/context'
import { DenEcoSystem } from '#emulator/handlers/den/eco/system'

/**
 * Describes the den's eco system
 * @class
 */
@Throttle({ limit: 10, per: 5_000 })
@Handler(DenEcoStateIncoming)
export class DenEcoStateHandler extends PacketHandler<DenEcoStateIncoming> {
  /**
   * Keeps den eco systems
   */
  private readonly eco = inject<EcoRepository>(EcoRepository)

  /**
   * Keeps eco items powered
   */
  private readonly system = inject<DenEcoSystem>(DenEcoSystem)

  /**
   * Sends the eco system
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: DenEcoStateIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const { player, session } = context

    const power = await this.system.settle(player)
    const stored = await this.eco.meter(player.gameId)
    const meter = EcoRules.accrue(
      stored ?? { unredeemed: 0, accruedAt: null },
      power.generation > 0,
      new Date(),
    )
    if (stored) await this.eco.keep(player.gameId, meter)

    const had = player.variables.get(UserVar.EcoGift)?.value ?? 0
    const gift = await this.eco.nextGift(had)

    await session.send<DenEcoStateOutgoing>(
      DenEcoStateOutgoing.of(packet.room, {
        numActiveWindTurbines: power.turbines,
        numActiveSolarPanels: power.solarPanels,
        numConsumerItems: power.consumers.length,
        ecoPowerGeneration: power.generation,
        ecoPowerConsumption: power.consumption,
        ecoScoreRequired: gift?.scoreRequired ?? 0,
        nextRewardBitIndex: gift?.bitIdx ?? -1,
        unredeemedEcoCredits: meter.unredeemed,
        secondsUntilNextEcoCredit: meter.secondsToNext,
      }),
    )
  }
}
