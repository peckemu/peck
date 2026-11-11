import { type Account } from '#database/entities/accounts/account'
import { DenRoom } from '#database/entities/den/room'
import { NewspaperSeen } from '#database/entities/newspaper'
import { Player } from '#database/entities/player'
import { UserVariable } from '#database/entities/variable'
import { type Database } from '#database/pool'

/**
 * The starting den
 */
const FIRST_DEN = { invIdx: 0, defId: 1 } as const

/**
 * Reads and writes players
 * @class
 */
export class PlayerRepository {
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
   * Logs a player in
   * @param account The account signed in
   * @param username The player's username
   * @returns The player, or null
   */
  public async logIn(
    account: Account,
    username: string,
  ): Promise<Player | null> {
    if (
      !(await this.database.exists(Player, {
        $where: { accountId: account.id },
      }))
    ) {
      await this.database.insertOne(Player, {
        accountId: account.id,
        username: account.username,
      })
    }
    const players = await this.database.findMany(Player, {
      $where: { accountId: account.id },
      $populate: {
        variables: true,
        achievements: true,
        newspapersSeen: true,
        avatars: true,
        items: true,
        denRooms: true,
        denItems: true,
        pets: true,
        tradeList: true,
      },
    })
    const found = players.find(
      (each) => each.username.toLowerCase() === username.toLowerCase(),
    )
    if (!found) return null

    const player = await this.withFirstDen(found)
    const lastLoginAt = new Date()

    await this.database.updateOneById(Player, player.gameId, {
      numLogins: { $inc: 1 },
      lastLoginAt,
    })

    player.numLogins += 1
    player.lastLoginAt = lastLoginAt

    return player
  }

  /**
   * Lists an account's players
   * @param accountId The account id
   * @returns The players
   */
  public async ofAccount(accountId: string): Promise<Player[]> {
    return this.database.findMany(Player, {
      $where: { accountId },
      $sort: { slot: 'asc' },
    })
  }

  /**
   * Finds a player by username
   * @param username The username
   * @returns The player, or null
   */
  public async byUsername(username: string): Promise<Player | null> {
    const found = await this.database.findOne(Player, {
      $where: { username: { $ilike: PlayerRepository.exact(username) } },
      $populate: {
        avatars: true,
        items: true,
        denRooms: true,
        denItems: true,
        pets: true,
        tradeList: true,
      },
    })

    return found ?? null
  }

  /**
   * Finds a player by name
   * @param username Their username
   * @returns The player, or null
   */
  public async named(username: string): Promise<Player | null> {
    const found = await this.database.findOne(Player, {
      $where: { username: { $ilike: PlayerRepository.exact(username) } },
    })

    return found ?? null
  }

  /**
   * Changes a player's username
   * @param username Their username now
   * @param to Their new username
   * @returns The player's id, or the refusal
   */
  public async rename(
    username: string,
    to: string,
  ): Promise<
    | { readonly gameId: number; readonly from: string }
    | { readonly refusal: 'missing' | 'taken' }
  > {
    return this.database.transaction(async (querier) => {
      const player = await querier.findOne(Player, {
        $where: { username: { $ilike: PlayerRepository.exact(username) } },
      })
      if (!player) return { refusal: 'missing' }

      const taken = await querier.findOne(Player, {
        $where: { username: { $ilike: PlayerRepository.exact(to) } },
      })
      if (taken && taken.gameId !== player.gameId) return { refusal: 'taken' }

      await querier.updateOneById(Player, player.gameId, { username: to })

      return { gameId: player.gameId, from: player.username }
    })
  }

  /**
   * Sets one of a player's user variables
   * @param gameId The player
   * @param varId The variable's id
   * @param type The kind of value
   * @param value The value
   */
  public async setVariable(
    gameId: number,
    varId: number,
    type: number,
    value: number,
  ): Promise<void> {
    await this.database.upsertOne(
      UserVariable,
      { gameId: true, varId: true },
      { gameId, varId, type, value, updatedAt: new Date() },
    )
  }

  /**
   * Keeps a player's pending flags
   * @param gameId The player
   * @param pendingFlags The pending flags
   */
  public async flag(gameId: number, pendingFlags: number): Promise<void> {
    await this.database.updateOneById(Player, gameId, { pendingFlags })
  }

  /**
   * Marks a newspaper page seen
   * @param gameId The player
   * @param defId The page's definition id
   * @param seenTs The seen time in seconds
   */
  public async seeNewspaper(
    gameId: number,
    defId: number,
    seenTs: number,
  ): Promise<void> {
    await this.database.upsertOne(
      NewspaperSeen,
      { gameId: true, defId: true },
      { gameId, defId, seenTs },
    )
  }

  /**
   * Gives a player their first den
   * @param player The player
   * @returns The player
   */
  private async withFirstDen(player: Player): Promise<Player> {
    if (player.denRooms?.length) return player

    await this.database.insertOne(DenRoom, {
      gameId: player.gameId,
      ...FIRST_DEN,
    })

    player.denRooms = [
      { gameId: player.gameId, ...FIRST_DEN, createdAt: new Date() },
    ]

    return player
  }

  /**
   * Escapes a username
   * @param username The username
   * @returns The pattern
   */
  private static exact(username: string): string {
    return username.replace(/[\\%_]/g, '\\$&')
  }
}
