import { RedemptionCode } from '#database/entities/codes/code'
import { Player } from '#database/entities/player'
import { ReferralLevel } from '#database/entities/referrals/level'
import { Referral } from '#database/entities/referrals/referral'
import { UserVariable } from '#database/entities/variable'
import { type Database, type Querier } from '#database/pool'
import { CodeRepository } from '#database/repositories/codes'
import {
  type GrantedReward,
  RewardRepository,
} from '#database/repositories/rewards'

/**
 * The first treasure's user variable
 */
const FIRST_TREASURE = 461

/**
 * The other treasures' user variable
 */
const TREASURES = 462

/**
 * The bit field variable type
 */
const BIT_FIELD = 3

/**
 * The last treasure
 */
const LAST_LEVEL = 4

/**
 * A user variable a reward changed
 */
export type ChangedVariable = {
  /**
   * The variable's id
   */
  readonly varId: number

  /**
   * The kind of value
   */
  readonly type: number

  /**
   * The value now
   */
  readonly value: number
}

/**
 * What a referral came to for the referrer
 */
export type ReferralReward = {
  /**
   * The treasures opened
   */
  readonly levels: readonly number[]

  /**
   * The user variables changed
   */
  readonly variables: readonly ChangedVariable[]

  /**
   * What the treasures gave
   */
  readonly granted: readonly GrantedReward[]
}

/**
 * A player who joined with a code
 */
export type ReferredPlayer = {
  /**
   * Their username
   */
  readonly username: string

  /**
   * Their name bar
   */
  readonly nameBarData: number

  /**
   * Their account type
   */
  readonly accountType: number
}

/**
 * Keeps who referred whom
 * @class
 */
export class ReferralRepository {
  /**
   * The database
   */
  private readonly database: Database

  /**
   * Creates the repository
   * @param database The database
   */
  public constructor(database: Database) {
    this.database = database
  }

  /**
   * Finds who referred a player
   * @param gameId The player
   * @returns The referrer's id, or null
   */
  public async referrerOf(gameId: number): Promise<number | null> {
    const found = await this.database.findOneById(Referral, gameId)

    return found?.referrerGameId ?? null
  }

  /**
   * Finds a player's join date
   * @param gameId The player
   * @returns The date, or null
   */
  public async joined(gameId: number): Promise<Date | null> {
    const found = await this.database.findOneById(Player, gameId)

    return found?.createdAt ?? null
  }

  /**
   * Keeps a player's referrer
   * @param gameId The player
   * @param referrerGameId Who referred them
   * @returns Whether it is new
   */
  public async associate(
    gameId: number,
    referrerGameId: number,
  ): Promise<boolean> {
    if (await this.database.exists(Referral, { $where: { gameId } })) {
      return false
    }

    await this.database.insertOne(Referral, { gameId, referrerGameId })

    return true
  }

  /**
   * Lists the treasures
   * @returns The treasures
   */
  public async levels(): Promise<ReferralLevel[]> {
    return this.database.findMany(ReferralLevel, { $sort: { level: 'asc' } })
  }

  /**
   * Sets up a treasure
   * @param level The treasure, from 1
   * @param referrals The referrals it takes
   * @param code The code whose rewards it gives, or null
   */
  public async setLevel(
    level: number,
    referrals: number,
    code: string | null,
  ): Promise<void> {
    await this.database.upsertOne(
      ReferralLevel,
      { level: true },
      {
        level,
        referrals,
        code: code === null ? null : CodeRepository.normal(code),
      },
    )
  }

  /**
   * Opens the treasures a referrer has reached
   * @param referrerGameId The referrer
   * @returns What it came to
   */
  public async reward(referrerGameId: number): Promise<ReferralReward> {
    return this.database.transaction(async (querier) => {
      await querier.all`SELECT game_id FROM players WHERE game_id = ${referrerGameId} FOR UPDATE`

      const [count, levels, first, rest] = await Promise.all([
        querier.count(Referral, { $where: { referrerGameId } }),
        querier.findMany(ReferralLevel, { $sort: { level: 'asc' } }),
        ReferralRepository.variable(querier, referrerGameId, FIRST_TREASURE),
        ReferralRepository.variable(querier, referrerGameId, TREASURES),
      ])

      let opened = first?.value ?? 0
      let bits = rest?.value ?? 0
      const reached: ReferralLevel[] = []

      for (const level of levels) {
        if (count < level.referrals) continue
        if (level.level < 1 || level.level > LAST_LEVEL) continue

        if (level.level === 1) {
          if (opened > 0) continue
          opened = 1
        } else {
          const bit = 2 ** (level.level - 2)
          if (Math.floor(bits / bit) % 2 === 1) continue
          bits += bit
        }
        reached.push(level)
      }

      const variables: ChangedVariable[] = []
      if (opened !== (first?.value ?? 0)) {
        variables.push({
          varId: FIRST_TREASURE,
          type: first?.type ?? 0,
          value: opened,
        })
      }
      if (bits !== (rest?.value ?? 0)) {
        variables.push({
          varId: TREASURES,
          type: rest?.type ?? BIT_FIELD,
          value: bits,
        })
      }
      for (const variable of variables) {
        await querier.upsertOne(
          UserVariable,
          { gameId: true, varId: true },
          { gameId: referrerGameId, ...variable, updatedAt: new Date() },
        )
      }

      const granted: GrantedReward[] = []
      for (const level of reached) {
        const code = level.code
          ? await querier.findOneById(RedemptionCode, level.code)
          : null
        if (!code) continue

        granted.push(
          await RewardRepository.within(querier, referrerGameId, {
            gems: code.gems,
            diamonds: code.diamonds,
            membershipDays: code.membershipDays,
            items: code.items,
          }),
        )
      }

      return {
        levels: reached.map(({ level }) => level),
        variables,
        granted,
      }
    })
  }

  /**
   * Reads a user variable
   * @param querier The querier
   * @param gameId The player
   * @param varId The variable's id
   * @returns The variable, or null
   */
  private static async variable(
    querier: Querier,
    gameId: number,
    varId: number,
  ): Promise<{ readonly type: number; readonly value: number } | null> {
    const kept = await querier.findOne(UserVariable, {
      $where: { gameId, varId },
    })
    if (!kept) return null

    return { type: kept.type, value: kept.value === -1 ? 0 : kept.value }
  }

  /**
   * Lists a page of the players a player referred
   * @param referrerGameId The referrer
   * @param limit The page size
   * @param offset The players to skip
   * @returns The players
   */
  public async referred(
    referrerGameId: number,
    limit: number,
    offset: number,
  ): Promise<ReferredPlayer[]> {
    const rows = await this.database.findMany(Referral, {
      $where: { referrerGameId },
      $populate: { player: true },
      $sort: { createdAt: 'asc', gameId: 'asc' },
      $limit: limit,
      $skip: offset,
    })

    return rows.flatMap(({ player }) =>
      player
        ? [
            {
              username: player.username,
              nameBarData: player.nameBarData,
              accountType: player.accountType,
            },
          ]
        : [],
    )
  }
}
