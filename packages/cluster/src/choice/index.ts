import { type NodeInfo } from '#cluster/nodes'

/**
 * The node pack ratio
 */
export const PACK_RATIO = 0.85

/**
 * Picks a node
 * @param nodes The live nodes
 * @returns The node, or null
 */
export const chooseNode = (nodes: readonly NodeInfo[]): NodeInfo | null => {
  const open = nodes
    .filter((node) => !node.draining && node.players < node.capacity)
    .sort((a, b) => a.id - b.id)

  const fill = (node: NodeInfo): number => node.players / node.capacity

  const roomy = open.find((node) => fill(node) < PACK_RATIO)
  if (roomy) return roomy

  return [...open].sort((a, b) => fill(a) - fill(b))[0] ?? null
}
