import { DenItem } from '#database/entities/den/item'
import { DenLayout } from '#database/entities/den/layout'
import { Pet } from '#database/entities/pet'
import { Player } from '#database/entities/player'
import { type Database, type Querier } from '#database/pool'

/**
 * Where a den item now stands
 */
export type DenItemPlacement = {
  /**
   * Its place in the player's den items
   */
  readonly invIdx: number

  /**
   * Its layer, or 0
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
   * Whether it is flipped
   */
  readonly flipped: boolean

  /**
   * The den door's owner
   */
  readonly userNameLink: string
}

/**
 * Where a den item or pet stands in a den room
 */
export type DenSpot = {
  /**
   * Den item 0 or pet 1
   */
  readonly refId: number

  /**
   * Its place in the player's den items or pets
   */
  readonly invIdx: number

  /**
   * Its layer
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
 * A den room switch
 */
export type DenSwitch = {
  /**
   * The den room left
   */
  readonly from: number

  /**
   * The den room now in use
   */
  readonly to: number

  /**
   * What stood in the den room left
   */
  readonly left: readonly DenSpot[]

  /**
   * What stands in the den room now in use
   */
  readonly placed: readonly DenSpot[]
}

/**
 * An eco item's switch
 */
export type EcoSwitchChange = {
  /**
   * Its place in the player's den items
   */
  readonly invIdx: number

  /**
   * Its switch
   */
  readonly stateId: number
}

/**
 * A pet
 */
const PET = 1

/**
 * Saves dens
 * @class
 */
export class DenRepository {
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
   * Saves den item places
   * @param gameId The player
   * @param placements Where they stand
   */
  public async save(
    gameId: number,
    placements: readonly DenItemPlacement[],
  ): Promise<void> {
    if (placements.length === 0) return

    await this.database.transaction(async (querier) => {
      for (const {
        invIdx,
        categoryId,
        x,
        y,
        flipped,
        userNameLink,
      } of placements) {
        await querier.updateMany(
          DenItem,
          { $where: { gameId, invIdx } },
          { categoryId, x, y, flipped, userNameLink },
        )
      }
    })
  }

  /**
   * Reads what stands in a den room not in use
   * @param gameId The player
   * @param denInvIdx The den room
   * @returns The spots
   */
  public async layout(gameId: number, denInvIdx: number): Promise<DenSpot[]> {
    const rows = await this.database.findMany(DenLayout, {
      $where: { gameId, denInvIdx },
      $sort: { refId: 'asc', invIdx: 'asc' },
    })

    return rows.map(({ refId, invIdx, categoryId, x, y, flipped }) => ({
      refId,
      invIdx,
      categoryId,
      x,
      y,
      flipped,
    }))
  }

  /**
   * Switches a player's den room
   * @param gameId The player
   * @param change The switch
   */
  public async switch(gameId: number, change: DenSwitch): Promise<void> {
    await this.database.transaction(async (querier) => {
      await querier.deleteMany(DenLayout, {
        $where: { gameId, denInvIdx: { $in: [change.from, change.to] } },
      })
      if (change.left.length > 0) {
        await querier.insertMany(
          DenLayout,
          change.left.map((spot) => ({
            ...spot,
            gameId,
            denInvIdx: change.from,
          })),
        )
      }

      await DenRepository.clear(querier, gameId)

      for (const spot of change.placed) {
        await DenRepository.place(querier, gameId, spot)
      }

      await querier.updateOneById(Player, gameId, {
        activeDenInvIdx: change.to,
      })
    })
  }

  /**
   * Puts everything in a den back in the drawer
   * @param gameId The player
   */
  public async empty(gameId: number): Promise<void> {
    await this.database.transaction(async (querier) => {
      await DenRepository.clear(querier, gameId)
    })
  }

  /**
   * Forgets the layouts of den rooms
   * @param gameId The player
   * @param denInvIdxs The den rooms
   */
  public async forget(
    gameId: number,
    denInvIdxs: readonly number[],
  ): Promise<void> {
    if (denInvIdxs.length === 0) return

    await this.database.deleteMany(DenLayout, {
      $where: { gameId, denInvIdx: { $in: [...denInvIdxs] } },
    })
  }

  /**
   * Changes who may visit a player's den
   * @param gameId The player
   * @param denPrivacy The setting
   */
  public async privacy(gameId: number, denPrivacy: number): Promise<void> {
    await this.database.updateOneById(Player, gameId, { denPrivacy })
  }

  /**
   * Saves eco item switches
   * @param gameId The player
   * @param changes The switches
   */
  public async ecoSwitches(
    gameId: number,
    changes: readonly EcoSwitchChange[],
  ): Promise<void> {
    if (changes.length === 0) return

    await this.database.transaction(async (querier) => {
      for (const { invIdx, stateId } of changes) {
        await querier.updateMany(
          DenItem,
          { $where: { gameId, invIdx } },
          { ecoConsumerState: stateId },
        )
      }
    })
  }

  /**
   * Puts every den item and pet in the drawer
   * @param querier The querier
   * @param gameId The player
   */
  private static async clear(querier: Querier, gameId: number): Promise<void> {
    await querier.updateMany(
      DenItem,
      { $where: { gameId, categoryId: { $ne: 0 } } },
      { categoryId: 0, x: 0, y: 0, flipped: false },
    )
    await querier.updateMany(
      Pet,
      { $where: { gameId, denCategoryId: { $ne: 0 } } },
      { denCategoryId: 0, denX: 0, denY: 0, denFlipped: 0 },
    )
  }

  /**
   * Places a den item or pet
   * @param querier The querier
   * @param gameId The player
   * @param spot Where it stands
   */
  private static async place(
    querier: Querier,
    gameId: number,
    spot: DenSpot,
  ): Promise<void> {
    const { invIdx, categoryId, x, y, flipped } = spot

    if (spot.refId === PET) {
      await querier.updateMany(
        Pet,
        { $where: { gameId, invIdx } },
        { denCategoryId: categoryId, denX: x, denY: y, denFlipped: flipped },
      )
      return
    }

    await querier.updateMany(
      DenItem,
      { $where: { gameId, invIdx } },
      { categoryId, x, y, flipped: flipped !== 0 },
    )
  }
}
