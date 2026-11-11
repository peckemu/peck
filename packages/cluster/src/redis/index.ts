import { type RedisClient } from '@peck/redis'

import { type ClusterStore } from '#cluster/store'

/**
 * Claims a key
 */
const CLAIM = `
local owner = redis.call('GET', KEYS[1])
if owner and owner ~= ARGV[1] then return 0 end
redis.call('SET', KEYS[1], ARGV[1], 'PX', ARGV[2])
return 1`

/**
 * Deletes an owned key
 */
const RELEASE = `
if redis.call('GET', KEYS[1]) == ARGV[1] then redis.call('DEL', KEYS[1]) end
return 1`

/**
 * The cluster's state in Redis
 * @class
 */
export class RedisStore implements ClusterStore {
  /**
   * The Redis client
   */
  private readonly redis: RedisClient

  /**
   * The listening connection
   */
  private subscriber: RedisClient | null = null

  /**
   * Creates the store
   * @param redis The Redis client
   */
  public constructor(redis: RedisClient) {
    this.redis = redis
  }

  /**
   * Reads a value
   * @param key The key
   * @returns The value, or null
   */
  public async get(key: string): Promise<string | null> {
    return this.redis.get(key)
  }

  /**
   * Writes an expiring value
   * @param key The key
   * @param value The value
   * @param ttl The lifetime in milliseconds
   */
  public async put(key: string, value: string, ttl: number): Promise<void> {
    await this.redis.send('SET', [key, value, 'PX', String(ttl)])
  }

  /**
   * Writes a lasting value
   * @param key The key
   * @param value The value
   */
  public async keep(key: string, value: string): Promise<void> {
    await this.redis.set(key, value)
  }

  /**
   * Reads and deletes a value
   * @param key The key
   * @returns The value, or null
   */
  public async take(key: string): Promise<string | null> {
    return (await this.redis.send('GETDEL', [key])) as string | null
  }

  /**
   * Deletes a value
   * @param key The key
   */
  public async delete(key: string): Promise<void> {
    await this.redis.del(key)
  }

  /**
   * Claims a key for an owner
   * @param key The key
   * @param owner The owner
   * @param ttl The claim's lifetime in milliseconds
   * @returns Whether the owner holds it
   */
  public async claim(
    key: string,
    owner: string,
    ttl: number,
  ): Promise<boolean> {
    const held: unknown = await this.redis.send('EVAL', [
      CLAIM,
      '1',
      key,
      owner,
      String(ttl),
    ])

    return held === 1
  }

  /**
   * Lets a claim go
   * @param key The key
   * @param owner The owner
   */
  public async release(key: string, owner: string): Promise<void> {
    await this.redis.send('EVAL', [RELEASE, '1', key, owner])
  }

  /**
   * Adds to a set
   * @param key The set
   * @param member The member
   */
  public async add(key: string, member: string): Promise<void> {
    await this.redis.sadd(key, member)
  }

  /**
   * Removes from a set
   * @param key The set
   * @param member The member
   */
  public async remove(key: string, member: string): Promise<void> {
    await this.redis.srem(key, member)
  }

  /**
   * Lists a set
   * @param key The set
   * @returns The members
   */
  public async members(key: string): Promise<string[]> {
    return this.redis.smembers(key)
  }

  /**
   * Reads several values
   * @param keys The keys
   * @returns The values
   */
  public async many(keys: readonly string[]): Promise<(string | null)[]> {
    if (keys.length === 0) return []

    return (await this.redis.send('MGET', [...keys])) as (string | null)[]
  }

  /**
   * Sends a message to every node
   * @param channel The channel
   * @param message The message
   */
  public async publish(channel: string, message: string): Promise<void> {
    await this.redis.publish(channel, message)
  }

  /**
   * Listens to a channel
   * @param channel The channel
   * @param listener The message listener
   */
  public async subscribe(
    channel: string,
    listener: (message: string) => void,
  ): Promise<void> {
    this.subscriber ??= await this.redis.duplicate()

    await this.subscriber.subscribe(channel, (message) => {
      listener(message)
    })
  }

  /**
   * Closes the listening connection
   */
  public close(): void {
    this.subscriber?.close()
    this.subscriber = null
  }
}
