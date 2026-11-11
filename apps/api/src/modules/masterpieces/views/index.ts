import { type MasterpieceInfo } from '@peck/database'

/**
 * A pending masterpiece
 */
export type PendingView = {
  /**
   * Its id
   */
  readonly id: string

  /**
   * Who painted it
   */
  readonly creator: {
    /**
     * Their game id
     */
    readonly gameId: number

    /**
     * Their username
     */
    readonly username: string
  }
}

/**
 * Shows a pending masterpiece
 * @param art The masterpiece
 * @returns The view
 */
export const pendingView = (art: MasterpieceInfo): PendingView => ({
  id: art.uniqueImageId,
  creator: { gameId: art.creatorGameId, username: art.creatorName },
})
