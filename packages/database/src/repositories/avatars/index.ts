import { PendingFlag } from '@peck/shared'

import { Avatar } from '#database/entities/avatar'
import { Item } from '#database/entities/item'
import { Player } from '#database/entities/player'
import { type Database } from '#database/pool'

/**
 * How a new animal looks
 */
export type AvatarLook = {
  /**
   * The kind of animal
   */
  readonly avTypeId: number

  /**
   * The custom animal, or -1
   */
  readonly customAvId: number

  /**
   * Its three colours
   */
  readonly colors: readonly [number, number, number]

  /**
   * The eyes it wears
   */
  readonly eyesDefId: number

  /**
   * Its pattern, or 0
   */
  readonly patternDefId: number

  /**
   * Its name
   */
  readonly avName: string
}

/**
 * Reads and writes players' animals
 * @class
 */
export class AvatarRepository {
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
   * Lists a player's animals
   * @param gameId The player's id
   * @returns The animals, by slot
   */
  public async ofPlayer(gameId: number): Promise<Avatar[]> {
    return this.database.findMany(Avatar, {
      $where: { gameId },
      $sort: { avInvId: 'asc' },
    })
  }

  /**
   * Recolours an animal
   * @param gameId The player's id
   * @param perUserAvId The animal
   * @param colors Its new colours
   * @param nameBarData Their name bar
   */
  public async paint(
    gameId: number,
    perUserAvId: number,
    colors: readonly [number, number, number],
    nameBarData: number,
  ): Promise<void> {
    const [color1, color2, color3] = colors

    await this.database.transaction(async (querier) => {
      await querier.updateMany(
        Avatar,
        { $where: { gameId, perUserAvId } },
        { color1, color2, color3 },
      )
      await querier.updateOneById(Player, gameId, { nameBarData })
    })
  }

  /**
   * Saves what one of a player's animals wears
   * @param gameId The player's id
   * @param look The animal's eyes and pattern
   * @param items The changed items
   */
  public async dress(
    gameId: number,
    look: {
      readonly perUserAvId: number
      readonly eyesDefId: number
      readonly patternDefId: number
    },
    items: readonly {
      readonly invId: number
      readonly equippedAvatars: string
    }[],
  ): Promise<void> {
    const { perUserAvId, eyesDefId, patternDefId } = look

    await this.database.transaction(async (querier) => {
      await querier.updateMany(
        Avatar,
        { $where: { gameId, perUserAvId } },
        { eyesDefId, patternDefId },
      )

      for (const { invId, equippedAvatars } of items) {
        await querier.updateMany(
          Item,
          { $where: { gameId, invId } },
          { equippedAvatars },
        )
      }
    })
  }

  /**
   * Switches a player's animal
   * @param gameId The player's id
   * @param perUserAvId The animal
   */
  public async switch(gameId: number, perUserAvId: number): Promise<void> {
    await this.database.transaction(async (querier) => {
      await querier.updateMany(
        Avatar,
        { $where: { gameId, active: true } },
        { active: false },
      )
      await querier.updateMany(
        Avatar,
        { $where: { gameId, perUserAvId } },
        { active: true },
      )
    })
  }

  /**
   * Tracks animal slots
   * @param gameId The player's id
   * @param avatarSlotFlags The slot flags
   */
  public async ordain(gameId: number, avatarSlotFlags: number): Promise<void> {
    await this.database.updateOneById(Player, gameId, { avatarSlotFlags })
  }

  /**
   * Gives a player their first animal
   * @param gameId The player's id
   * @param look How it looks
   * @returns The animal, or null
   */
  public async addFirst(
    gameId: number,
    look: AvatarLook,
  ): Promise<Avatar | null> {
    return this.database.transaction(async (querier) => {
      if (await querier.exists(Avatar, { $where: { gameId } })) return null

      const [color1, color2, color3] = look.colors

      await querier.insertOne(Avatar, {
        gameId,
        perUserAvId: 1,
        avInvId: 0,
        avTypeId: look.avTypeId,
        customAvId: look.customAvId,
        color1,
        color2,
        color3,
        avName: look.avName,
        eyesDefId: look.eyesDefId,
        patternDefId: look.patternDefId,
        active: true,
      })

      const player = await querier.findOneById(Player, gameId)
      if (player) {
        await querier.updateOneById(Player, gameId, {
          pendingFlags: player.pendingFlags & ~PendingFlag.NeedsFirstAvatar,
        })
      }

      return (
        (await querier.findOneById(Avatar, { gameId, perUserAvId: 1 })) ?? null
      )
    })
  }
}
