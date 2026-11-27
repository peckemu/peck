import { inject, injectable } from '@needle-di/core'
import {
  EcoRepository,
  PrizeRepository,
  type StoredEcoGift,
  type WaitingPrize,
} from '@peck/database'
import { DenItemCatalogue, type Player } from '@peck/game'
import {
  DenItemsOutgoing,
  ItemPrizeOutgoing,
  UserVariableChangedOutgoing,
} from '@peck/packets'
import { PluginEvents } from '@peck/plugins'
import { BIT_FIELD_USER_VARS, UserVar } from '@peck/shared'

import { DenEcoSystem } from '../system/index.ts'
import { SessionManager } from '../../../../sessions/manager/index.ts'
import { type Session } from '../../../../sessions/session/index.ts'
import { PlayerVariables } from '../../../../sessions/variables/index.ts'

/**
 * The answer's bits
 */
const ANSWER = 0xf

/**
 * The prize is kept
 */
const KEPT = 3

/**
 * The prize is thrown away
 */
const DISCARDED = 2

/**
 * Hands out eco gift prizes
 * @class
 */
@injectable()
export class EcoPrizes {
  /**
   * Keeps den eco systems
   */
  private readonly eco = inject<EcoRepository>(EcoRepository)

  /**
   * Keeps offered prizes
   */
  private readonly prizes = inject<PrizeRepository>(PrizeRepository)

  /**
   * Keeps eco items powered
   */
  private readonly system = inject<DenEcoSystem>(DenEcoSystem)

  /**
   * Keeps the player's variables
   */
  private readonly variables = inject<PlayerVariables>(PlayerVariables)

  /**
   * Every den item
   */
  private readonly denItems = inject<DenItemCatalogue>(DenItemCatalogue)

  /**
   * Every open session
   */
  private readonly sessions = inject<SessionManager>(SessionManager)

  /**
   * The plugin events
   */
  private readonly plugins = inject<PluginEvents>(PluginEvents)

  /**
   * Starts offering prizes at login
   */
  public start(): void {
    this.plugins.on('login', async (session) => {
      const found = this.sessions.get(session.id)
      if (found) await this.offerWaiting(found)
    })
  }

  /**
   * Claims an eco gift
   * @param session The player's session
   * @param bitIdx The gift's bit
   */
  public async claim(session: Session, bitIdx: number): Promise<void> {
    const { player } = session
    if (!player) return

    const had = player.variables.get(UserVar.EcoGift)?.value ?? 0
    const next = await this.eco.nextGift(had)
    const gift = next?.bitIdx === bitIdx ? await this.eco.gift(bitIdx) : null
    const power = await this.system.settle(player)

    const refusal = this.refusal(gift, power.generation - power.consumption)
    const prize =
      refusal === null && gift
        ? await this.prizes.offer({
            gameId: player.gameId,
            userVarId: UserVar.EcoPrize,
            denItemDefId: gift.denItemDefId,
            color: gift.color,
            nameStrId: gift.nameStrId,
            descStrId: gift.descStrId,
            source: 'eco-gift',
            sourceRef: gift.bitIdx,
          })
        : null
    if (!prize || !gift) {
      session.log.info(
        { bitIdx, refusal: refusal ?? 'prize waiting' },
        'eco gift refused',
      )
      return session.send<UserVariableChangedOutgoing>(
        UserVariableChangedOutgoing.of(UserVar.EcoGift, had),
      )
    }

    await this.offer(session, prize)
    await this.variables.change(session, {
      varId: UserVar.EcoGift,
      type: BIT_FIELD_USER_VARS.get(UserVar.EcoGift) ?? 0,
      value: had | (1 << gift.bitIdx),
    })

    session.log.info({ bitIdx, defId: gift.denItemDefId }, 'eco gift earned')
  }

  /**
   * Takes a player's answer to a prize
   * @param session The player's session
   * @param varId The variable set
   * @param value Its value
   * @returns Whether it was a prize answer
   */
  public async answer(
    session: Session,
    varId: number,
    value: number,
  ): Promise<boolean> {
    const { player } = session
    if (!player || varId !== UserVar.EcoPrize) return false

    const answer = value & ANSWER
    if (answer !== KEPT && answer !== DISCARDED) {
      session.log.info({ varId, value }, 'prize answer refused')
      return true
    }

    const answered = await this.prizes.answer(
      player.gameId,
      varId,
      answer === KEPT,
    )
    if (!answered) {
      session.log.info({ varId, value }, 'no prize waiting')
      return true
    }

    if (answered.invIdx !== null) {
      await this.give(session, player, answered.prize, answered.invIdx)
    }

    const kept = player.variables.get(varId)
    await this.variables.change(session, {
      varId,
      type: kept?.type ?? 0,
      value,
    })
    await this.offerWaiting(session)

    return true
  }

  /**
   * Offers the oldest waiting prize
   * @param session The player's session
   */
  private async offerWaiting(session: Session): Promise<void> {
    const { player } = session
    if (!player) return

    const [prize] = await this.prizes.waiting(player.gameId)
    if (prize) await this.offer(session, prize)
  }

  /**
   * Offers a prize
   * @param session The player's session
   * @param prize The prize
   */
  private async offer(session: Session, prize: WaitingPrize): Promise<void> {
    await session.send<ItemPrizeOutgoing>(
      ItemPrizeOutgoing.of({
        userVarId: prize.userVarId,
        clothing: false,
        defId: prize.denItemDefId,
        nameStrId: prize.nameStrId,
        descStrId: prize.descStrId,
        color: prize.color,
      }),
    )
  }

  /**
   * Puts a kept prize in the den inventory
   * @param session The player's session
   * @param player The player
   * @param prize The prize
   * @param invIdx Its place in the inventory
   */
  private async give(
    session: Session,
    player: Player,
    prize: WaitingPrize,
    invIdx: number,
  ): Promise<void> {
    player.denItems.push({
      invIdx,
      defId: prize.denItemDefId,
      categoryId: 0,
      version: 0,
      x: 0,
      y: 0,
      flipped: false,
      userNameLink: '',
      denStoreInvIdx: 0,
      uniqueImageId: '',
    })

    await session.send<DenItemsOutgoing>(
      DenItemsOutgoing.of(
        -1,
        player.activeDenInvIdx,
        player.denItems,
        (id) => this.denItems.isMannequin(id),
        player.placedPets.map(({ invId }) => invId),
      ),
    )
  }

  /**
   * Checks an eco gift can be claimed
   * @param gift The gift
   * @param score The den's eco score
   * @returns The reason, or null
   */
  private refusal(gift: StoredEcoGift | null, score: number): string | null {
    if (!gift) return 'not the next gift'
    if (score < gift.scoreRequired) return 'score too low'

    return null
  }
}
