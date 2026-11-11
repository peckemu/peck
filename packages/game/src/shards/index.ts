/**
 * How many shard numbers each node has
 */
export const SHARDS_PER_NODE = 1010

/**
 * Finds a node's first shard
 * @param nodeId The node id
 * @returns The shard number
 */
export const firstShardOf = (nodeId: number): number =>
  (nodeId - 1) * SHARDS_PER_NODE + 1

/**
 * Finds the node a shard is on
 * @param shard The shard number
 * @returns The node id, or null
 */
export const nodeOfShard = (shard: number): number | null =>
  Number.isSafeInteger(shard) && shard > 0
    ? Math.floor((shard - 1) / SHARDS_PER_NODE) + 1
    : null

/**
 * Reads the shard in a room name
 * @param name The room name
 * @returns The shard number, or null
 */
export const shardOfRoom = (name: string): number | null => {
  const at = name.lastIndexOf('#')
  if (at < 0) return null

  const shard = Number(name.slice(at + 1))

  return Number.isSafeInteger(shard) && shard > 0 ? shard : null
}
