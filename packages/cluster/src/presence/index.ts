import { type ClusterStore } from '#cluster/store'

/**
 * The presence lifetime
 */
export const PRESENCE_TTL = 60_000

/**
 * Where a player is playing
 */
export type PlayerPresence = {
  /**
   * The player's id in the database
   */
  readonly gameId: number

  /**
   * The player's username
   */
  readonly username: string

  /**
   * Their node
   */
  readonly nodeId: number

  /**
   * Their room, or null
   */
  readonly room: string | null

  /**
   * Whether they are hidden
   */
  readonly invisible: boolean
}

/**
 * Who is playing
 * @class
 */
export class Presence {
  /**
   * The cluster store
   */
  private readonly store: ClusterStore

  /**
   * Creates the presence
   * @param store The cluster store
   */
  public constructor(store: ClusterStore) {
    this.store = store
  }

  /**
   * Says where a player is
   * @param presence Where they are
   */
  public async put(presence: PlayerPresence): Promise<void> {
    await this.store.put(
      Presence.key(presence.gameId),
      JSON.stringify(presence),
      PRESENCE_TTL,
    )
  }

  /**
   * Says a player has stopped playing
   * @param gameId The player's id
   */
  public async remove(gameId: number): Promise<void> {
    await this.store.delete(Presence.key(gameId))
  }

  /**
   * Finds where a player is
   * @param gameId The player's id
   * @returns Where they are, or null
   */
  public async get(gameId: number): Promise<PlayerPresence | null> {
    const [found] = await this.many([gameId])

    return found ?? null
  }

  /**
   * Finds who is playing
   * @param gameIds The players' ids
   * @returns Where each is
   */
  public async many(gameIds: readonly number[]): Promise<PlayerPresence[]> {
    const values = await this.store.many(
      gameIds.map((gameId) => Presence.key(gameId)),
    )

    return values.flatMap((value) =>
      value ? [JSON.parse(value) as PlayerPresence] : [],
    )
  }

  /**
   * Builds a player's key
   * @param gameId The player's id
   * @returns The key
   */
  private static key(gameId: number): string {
    return `presence:${String(gameId)}`
  }
}
