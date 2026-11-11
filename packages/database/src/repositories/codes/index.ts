import { Account } from '#database/entities/accounts/account'
import { type CodeItem, RedemptionCode } from '#database/entities/codes/code'
import { CodeRedemption } from '#database/entities/codes/redemption'
import { type Database } from '#database/pool'
import {
  type GrantedReward,
  RewardRepository,
} from '#database/repositories/rewards'

/**
 * A code to make
 */
export type NewCode = {
  /**
   * The code
   */
  readonly code: string

  /**
   * The gems it gives
   */
  readonly gems: number

  /**
   * The diamonds it gives
   */
  readonly diamonds: number

  /**
   * The membership days it gives
   */
  readonly membershipDays: number

  /**
   * The things it gives
   */
  readonly items: readonly CodeItem[]

  /**
   * How many times it can be used, or null
   */
  readonly maxUses: number | null

  /**
   * When it stops working, or null
   */
  readonly expiresAt: Date | null

  /**
   * Whether it needs a confirmed email
   */
  readonly verifiedOnly: boolean
}

/**
 * Why a code was turned down
 */
export type CodeRefusal = 'invalid' | 'unverified'

/**
 * What redeeming a code came to
 */
export type Redeemed =
  | {
      /**
       * Why it was turned down
       */
      readonly refusal: CodeRefusal
    }
  | {
      /**
       * What it gave
       */
      readonly granted: GrantedReward
    }

/**
 * Keeps gift codes
 * @class
 */
export class CodeRepository {
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
   * Writes a code the way it is kept
   * @param code The code
   * @returns The code
   */
  public static normal(code: string): string {
    return code.trim().toUpperCase()
  }

  /**
   * Makes a code
   * @param code The code
   * @returns Whether it is new
   */
  public async create(code: NewCode): Promise<boolean> {
    const key = CodeRepository.normal(code.code)
    if (await this.database.exists(RedemptionCode, { $where: { code: key } })) {
      return false
    }

    await this.database.insertOne(RedemptionCode, {
      ...code,
      code: key,
      items: [...code.items],
    })

    return true
  }

  /**
   * Lists every code
   * @returns The codes
   */
  public async list(): Promise<RedemptionCode[]> {
    return this.database.findMany(RedemptionCode, {
      $sort: { createdAt: 'desc' },
    })
  }

  /**
   * Finds a code
   * @param code The code
   * @returns The code, or null
   */
  public async find(code: string): Promise<RedemptionCode | null> {
    const found = await this.database.findOneById(
      RedemptionCode,
      CodeRepository.normal(code),
    )

    return found ?? null
  }

  /**
   * Redeems a code
   * @param code The code
   * @param accountId The account
   * @param gameId The player
   * @returns What it came to
   */
  public async redeem(
    code: string,
    accountId: string,
    gameId: number,
  ): Promise<Redeemed> {
    const key = CodeRepository.normal(code)

    return this.database.transaction(async (querier): Promise<Redeemed> => {
      await querier.all`SELECT code FROM codes WHERE code = ${key} FOR UPDATE`

      const found = await querier.findOneById(RedemptionCode, key)
      if (!found) return { refusal: 'invalid' }
      if (found.expiresAt && found.expiresAt.getTime() <= Date.now()) {
        return { refusal: 'invalid' }
      }
      if (
        found.maxUses !== null &&
        found.maxUses !== undefined &&
        found.uses >= found.maxUses
      ) {
        return { refusal: 'invalid' }
      }

      const used = await querier.exists(CodeRedemption, {
        $where: { code: key, accountId },
      })
      if (used) return { refusal: 'invalid' }

      if (found.verifiedOnly) {
        const account = await querier.findOneById(Account, accountId)
        if (!account?.emailConfirmed) return { refusal: 'unverified' }
      }

      await querier.insertOne(CodeRedemption, { code: key, accountId, gameId })
      await querier.updateOneById(RedemptionCode, key, {
        uses: { $inc: 1 },
      })

      const granted = await RewardRepository.within(querier, gameId, {
        gems: found.gems,
        diamonds: found.diamonds,
        membershipDays: found.membershipDays,
        items: found.items,
      })

      return { granted }
    })
  }
}
