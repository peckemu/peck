import { Avatar } from '#database/entities/avatar'
import { DenShopListing } from '#database/entities/den/listing'
import { Pet } from '#database/entities/pet'
import { Player } from '#database/entities/player'
import { TransactionCurrency } from '#database/entities/transactions/currency'
import { Transaction } from '#database/entities/transactions/transaction'
import { type Database } from '#database/pool'

/**
 * A den shop listing a pet
 */
const PET_LISTING = 1

/**
 * A pet's new look
 */
export type PetLook = {
  /**
   * Its look
   */
  readonly lBits: number

  /**
   * Extra traits
   */
  readonly uBits: number

  /**
   * Unused look bits
   */
  readonly eBits: number

  /**
   * Its new name
   */
  readonly name?: string
}

/**
 * Where a pet stands in the den
 */
export type PetPlacement = {
  /**
   * Its place in the player's pets
   */
  readonly invIdx: number

  /**
   * Its place, or 0
   */
  readonly categoryId: number

  /**
   * Where it stands across
   */
  readonly x: number

  /**
   * Where it stands down
   */
  readonly y: number

  /**
   * How it is flipped
   */
  readonly flipped: number
}

/**
 * Changes players' pets
 * @class
 */
export class PetRepository {
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
   * Sets the pet an avatar walks with
   * @param gameId The player
   * @param perUserAvId The avatar
   * @param ocean Whether it is the ocean pet
   * @param invIdx The pet, or 0
   */
  public async choose(
    gameId: number,
    perUserAvId: number,
    ocean: boolean,
    invIdx: number,
  ): Promise<void> {
    const slot = ocean ? { oceanPetInvIdx: invIdx } : { landPetInvIdx: invIdx }

    await this.database.updateMany(
      Avatar,
      { $where: { gameId, perUserAvId } },
      slot,
    )
  }

  /**
   * Frees a pet
   * @param gameId The player
   * @param invIdx The pet
   * @returns Whether it was theirs
   */
  public async release(gameId: number, invIdx: number): Promise<boolean> {
    return this.database.transaction(async (querier) => {
      const removed = await querier.deleteMany(Pet, {
        $where: { gameId, invIdx },
      })
      if (removed === 0) return false

      await querier.updateMany(
        Avatar,
        { $where: { gameId, landPetInvIdx: invIdx } },
        { landPetInvIdx: 0 },
      )
      await querier.updateMany(
        Avatar,
        { $where: { gameId, oceanPetInvIdx: invIdx } },
        { oceanPetInvIdx: 0 },
      )
      await querier.deleteMany(DenShopListing, {
        $where: { gameId, itemKind: PET_LISTING, itemInvIdx: invIdx },
      })

      return true
    })
  }

  /**
   * Changes a pet's look
   * @param gameId The player
   * @param invIdx The pet
   * @param look The new look
   * @param gems What it costs
   * @returns The gems left, or null
   */
  public async change(
    gameId: number,
    invIdx: number,
    look: PetLook,
    gems = 0,
  ): Promise<number | null> {
    return this.database.transaction(async (querier) => {
      if (!(await querier.exists(Pet, { $where: { gameId, invIdx } }))) {
        return null
      }

      if (gems > 0) {
        const paid = await querier.updateMany(
          Player,
          { $where: { gameId, gems: { $gte: gems } } },
          { gems: { $inc: -gems } },
        )
        if (paid === 0) return null
      }

      await querier.updateMany(
        Pet,
        { $where: { gameId, invIdx } },
        {
          lBits: look.lBits >>> 0,
          uBits: look.uBits >>> 0,
          eBits: look.eBits >>> 0,
          ...(look.name === undefined ? {} : { name: look.name }),
        },
      )

      const balance = (await querier.findOneById(Player, gameId))?.gems ?? 0

      if (gems > 0) {
        const [row] = await querier.insertMany(
          Transaction,
          [{ gameId, kind: 'pet-salon' }],
          {
            returning: { id: true },
          },
        )
        await querier.insertOne(TransactionCurrency, {
          transactionId: row?.id ?? 0,
          currency: 0,
          change: -gems,
          balance,
        })
      }

      return balance
    })
  }

  /**
   * Adds mastery points to a pet
   * @param gameId The player
   * @param invIdx The pet
   * @param points The points
   * @returns The pet's points, or null
   */
  public async master(
    gameId: number,
    invIdx: number,
    points: number,
  ): Promise<number | null> {
    const changed = await this.database.updateMany(
      Pet,
      { $where: { gameId, invIdx } },
      { masteryCounter: { $inc: points } },
    )
    if (changed === 0) return null

    return (
      (await this.database.findOne(Pet, { $where: { gameId, invIdx } }))
        ?.masteryCounter ?? null
    )
  }

  /**
   * Saves pet places
   * @param gameId The player
   * @param placements Where they stand
   */
  public async place(
    gameId: number,
    placements: readonly PetPlacement[],
  ): Promise<void> {
    if (placements.length === 0) return

    await this.database.transaction(async (querier) => {
      for (const { invIdx, categoryId, x, y, flipped } of placements) {
        await querier.updateMany(
          Pet,
          { $where: { gameId, invIdx } },
          {
            denCategoryId: categoryId,
            denX: x,
            denY: y,
            denFlipped: flipped,
          },
        )
      }
    })
  }
}
