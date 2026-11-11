import { inject, injectable } from '@needle-di/core'
import { AchievementRepository, PlayerRepository } from '@peck/database'
import { AchievementCatalogue, type Price, type UserVariable } from '@peck/game'
import { UserVariableChangedOutgoing } from '@peck/packets'
import { UserVar } from '@peck/shared'

import { type Session } from '#emulator/sessions/session'

/**
 * The gems currency
 */
const GEMS = 0

/**
 * Keeps a player's user variables and achievements
 * @class
 */
@injectable()
export class PlayerVariables {
  /**
   * The players
   */
  private readonly players = inject<PlayerRepository>(PlayerRepository)

  /**
   * Keeps achievements
   */
  private readonly achievements = inject<AchievementRepository>(
    AchievementRepository,
  )

  /**
   * Every achievement
   */
  private readonly catalogue =
    inject<AchievementCatalogue>(AchievementCatalogue)

  /**
   * Counts a purchase
   * @param session The player's session
   * @param price The price paid
   * @param count The purchase counter
   */
  public async purchased(
    session: Session,
    price: Price,
    count?: number,
  ): Promise<void> {
    const gems = price.costs
      .filter(({ currency }) => currency === GEMS)
      .reduce((sum, { amount }) => sum + amount, 0)

    if (gems > 0) await this.raise(session, UserVar.GemsSpent, gems)
    if (count !== undefined) await this.raise(session, count, 1)
  }

  /**
   * Sets a variable
   * @param session The player's session
   * @param varId The variable's id
   * @param value Its value
   */
  public async set(
    session: Session,
    varId: number,
    value: number,
  ): Promise<void> {
    const { player } = session
    if (!player) return

    const type = player.variables.get(varId)?.type ?? 0

    await this.change(session, { varId, type, value })
  }

  /**
   * Raises a variable
   * @param session The player's session
   * @param varId The variable's id
   * @param by How much
   */
  public async raise(
    session: Session,
    varId: number,
    by: number,
  ): Promise<void> {
    const { player } = session
    if (!player || by <= 0) return

    const kept = player.variables.get(varId)
    const value = (kept?.value ?? 0) + by

    await this.change(session, { varId, type: kept?.type ?? 0, value })
  }

  /**
   * Keeps a variable and gives what it earns
   * @param session The player's session
   * @param variable The variable
   */
  public async change(session: Session, variable: UserVariable): Promise<void> {
    const { player } = session
    if (!player) return

    player.variables.set(variable.varId, variable)
    await this.players.setVariable(
      player.gameId,
      variable.varId,
      variable.type,
      variable.value,
    )

    const reached = this.catalogue.reached(
      variable.varId,
      variable.value,
      player.achievements,
    )
    const earned = await this.achievements.award(player.gameId, reached)
    for (const defId of reached) player.achievements.add(defId)

    if (earned.length > 0) {
      session.log.info(
        {
          varId: variable.varId,
          achievements: earned.map(({ defId }) => defId),
        },
        'achievements earned',
      )
    }

    await session.send<UserVariableChangedOutgoing>(
      UserVariableChangedOutgoing.of(variable.varId, variable.value, earned),
    )
  }
}
