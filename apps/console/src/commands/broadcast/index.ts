import { ClusterEvents, RedisStore, type StaffEvent } from '@peck/cluster'
import { Command, type Options } from '@peck/plugins'
import { createRedis } from '@peck/redis'

/**
 * Characters a message can't hold
 */
const RESERVED = /[%|]/

/**
 * Shows a message to every player
 * @class
 */
export class BroadcastCommand extends Command {
  /**
   * The command name
   */
  public readonly name = 'broadcast'

  /**
   * The command description
   */
  public readonly description = 'Shows a message to every player'

  /**
   * The command options
   */
  public override readonly options = {
    redis: { description: 'Redis URL', env: 'REDIS_URL' },
    text: { description: 'The message' },
    quiet: { description: 'Sends it as a broadcast', flag: true },
  }

  /**
   * Sends the message
   * @param options The options
   */
  public async run(options: Options): Promise<void> {
    const text = String(options['text']).trim()
    if (text === '') throw new Error('No message')
    if (RESERVED.test(text)) throw new Error('Message has a reserved character')

    const redis = createRedis(String(options['redis']))

    try {
      await redis.connect()
      await new ClusterEvents<StaffEvent>(new RedisStore(redis)).publish({
        type: 'staff-broadcast',
        text,
        system: options['quiet'] !== true,
      })

      console.log('Message sent')
    } finally {
      redis.close()
    }
  }
}
