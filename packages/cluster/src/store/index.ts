/**
 * Where the cluster keeps its state
 */
export type ClusterStore = {
  /**
   * Reads a value
   * @param key The key
   */
  get(key: string): Promise<string | null>

  /**
   * Writes an expiring value
   * @param key The key
   * @param value The value
   * @param ttl The lifetime in milliseconds
   */
  put(key: string, value: string, ttl: number): Promise<void>

  /**
   * Writes a lasting value
   * @param key The key
   * @param value The value
   */
  keep(key: string, value: string): Promise<void>

  /**
   * Reads and deletes a value
   * @param key The key
   */
  take(key: string): Promise<string | null>

  /**
   * Deletes a value
   * @param key The key
   */
  delete(key: string): Promise<void>

  /**
   * Claims or renews a key
   * @param key The key
   * @param owner The owner
   * @param ttl The claim's lifetime in milliseconds
   */
  claim(key: string, owner: string, ttl: number): Promise<boolean>

  /**
   * Lets a claim go
   * @param key The key
   * @param owner The owner
   */
  release(key: string, owner: string): Promise<void>

  /**
   * Adds to a set
   * @param key The set
   * @param member The member
   */
  add(key: string, member: string): Promise<void>

  /**
   * Removes from a set
   * @param key The set
   * @param member The member
   */
  remove(key: string, member: string): Promise<void>

  /**
   * Lists a set
   * @param key The set
   */
  members(key: string): Promise<string[]>

  /**
   * Reads several values
   * @param keys The keys
   */
  many(keys: readonly string[]): Promise<(string | null)[]>

  /**
   * Sends a message to every node
   * @param channel The channel
   * @param message The message
   */
  publish(channel: string, message: string): Promise<void>

  /**
   * Listens to a channel
   * @param channel The channel
   * @param listener The message listener
   */
  subscribe(channel: string, listener: (message: string) => void): Promise<void>

  /**
   * Closes any connection of its own
   */
  close?(): void
}
