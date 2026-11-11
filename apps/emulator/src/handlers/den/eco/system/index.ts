import { inject, injectable } from '@needle-di/core'
import { DenRepository } from '@peck/database'
import { type EcoPower, EcoRules, type Player } from '@peck/game'

/**
 * Keeps a den's eco items powered
 * @class
 */
@injectable()
export class DenEcoSystem {
  /**
   * How a den's eco system works
   */
  private readonly rules = inject<EcoRules>(EcoRules)

  /**
   * Saves dens
   */
  private readonly dens = inject<DenRepository>(DenRepository)

  /**
   * Works out the den's power and saves the switches
   * @param player The owner
   * @param asked The eco item switched
   * @returns The power
   */
  public async settle(player: Player, asked = -1): Promise<EcoPower> {
    const power = this.rules.power(player.denItems)

    const changed = power.consumers.filter(({ invIdx, stateId }) => {
      const at = player.denItems.findIndex((item) => item.invIdx === invIdx)
      const item = player.denItems[at]
      if (!item || (item.ecoConsumerState === stateId && invIdx !== asked)) {
        return false
      }

      player.denItems[at] = { ...item, ecoConsumerState: stateId }
      return true
    })

    await this.dens.ecoSwitches(player.gameId, changed)

    return power
  }
}
