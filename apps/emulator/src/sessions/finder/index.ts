import { inject, injectable } from '@needle-di/core'
import { PlayerRepository } from '@peck/database'
import { Player } from '@peck/game'

import { SessionManager } from '#emulator/sessions/manager'
import { MasterpieceFrames } from '#emulator/handlers/masterpiece/frames'

/**
 * Finds players online or offline
 * @class
 */
@injectable()
export class PlayerFinder {
  /**
   * Every open session
   */
  private readonly sessions = inject<SessionManager>(SessionManager)

  /**
   * The players
   */
  private readonly players = inject<PlayerRepository>(PlayerRepository)

  /**
   * Puts masterpieces on den items
   */
  private readonly frames = inject<MasterpieceFrames>(MasterpieceFrames)

  /**
   * Finds a player
   * @param username Their username
   * @returns The player, or null
   */
  public async find(username: string): Promise<Player | null> {
    const online = this.sessions.byUsername(username)?.player
    if (online) return online

    const stored = await this.players.byUsername(username)

    if (!stored) return null

    const player = new Player(0, stored)
    await this.frames.dress(player)

    return player
  }
}
