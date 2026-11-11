import { type BuddyEvent, ClusterEvents, RedisStore } from '@peck/cluster'
import { createDatabase, PlayerRepository } from '@peck/database'
import { Command, type Options } from '@peck/plugins'
import { createRedis } from '@peck/redis'

/**
 * Changes a player's username
 * @class
 */
export class PlayerRenameCommand extends Command {
  /**
   * The command name
   */
  public readonly name = 'player:rename'

  /**
   * The command description
   */
  public readonly description = "Changes a player's username"

  /**
   * The command options
   */
  public override readonly options = {
    database: { description: 'Database URL', env: 'DATABASE_URL' },
    redis: { description: 'Redis URL', env: 'REDIS_URL' },
    player: { description: 'Their username now' },
    to: { description: 'Their new username' },
  }

  /**
   * Renames a player
   * @param options The options
   */
  public async run(options: Options): Promise<void> {
    const to = String(options['to']).trim()
    if (to === '') throw new Error('No new username')

    const database = createDatabase(String(options['database']))
    const redis = createRedis(String(options['redis']))

    try {
      const renamed = await new PlayerRepository(database).rename(
        String(options['player']),
        to,
      )
      if ('refusal' in renamed) throw new Error(`Player is ${renamed.refusal}`)

      await redis.connect()
      await new ClusterEvents<BuddyEvent>(new RedisStore(redis)).publish({
        type: 'player-renamed',
        gameId: renamed.gameId,
        from: renamed.from,
        to,
      })

      console.log(`Renamed ${renamed.from} to ${to}`)
    } finally {
      redis.close()
      await database.end()
    }
  }
}
