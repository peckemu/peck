import { type NodeInfo } from '@peck/cluster'

/**
 * How open a server is
 */
export type ServerStatus = 'open' | 'full' | 'draining'

/**
 * A server view
 */
export type ServerView = {
  /**
   * The node id
   */
  readonly id: number

  /**
   * The name players see
   */
  readonly name: string

  /**
   * How many are playing
   */
  readonly players: number

  /**
   * The player limit
   */
  readonly capacity: number

  /**
   * How open it is
   */
  readonly status: ServerStatus
}

/**
 * Works out a node's status
 * @param node The node
 * @returns The status
 */
export const serverStatus = (node: NodeInfo): ServerStatus => {
  if (node.draining) return 'draining'
  if (node.players >= node.capacity) return 'full'

  return 'open'
}

/**
 * Turns a node into a response
 * @param node The node
 * @returns The server
 */
export const serverView = (node: NodeInfo): ServerView => ({
  id: node.id,
  name: node.name,
  players: node.players,
  capacity: node.capacity,
  status: serverStatus(node),
})
