import { ClusterEvents, RedisStore, type StaffEvent } from '@peck/cluster'
import { createDatabase, PlayerRepository } from '@peck/database'
import { Command, type Options } from '@peck/plugins'
import { createRedis } from '@peck/redis'

/**
 * Ends a player's hosted party
 * @class
 */
export class PartyEndCommand extends Command {
  /**
   * The command name
   */
  public readonly name = 'party:end'

  /**
   * The command description
   */
  public readonly description = "Ends a player's hosted party"

  /**
   * The command options
   */
  public override readonly options = {
    database: { description: 'Database URL', env: 'DATABASE_URL' },
    redis: { description: 'Redis URL', env: 'REDIS_URL' },
    player: { description: 'The host' },
  }

  /**
   * Ends the party
   * @param options The options
   */
  public async run(options: Options): Promise<void> {
    const database = createDatabase(String(options['database']))
    const redis = createRedis(String(options['redis']))

    try {
      const host = await new PlayerRepository(database).named(
        String(options['player']),
      )
      if (!host) throw new Error('No such player')

      await redis.connect()
      await new ClusterEvents<StaffEvent>(new RedisStore(redis)).publish({
        type: 'party-ended',
        hostGameId: host.gameId,
      })

      console.log(`Ended ${host.username}'s party`)
    } finally {
      redis.close()
      await database.end()
    }
  }
}
