import { inject } from '@needle-di/core'
import { type NodeInfo } from '@peck/cluster'
import { NodeHopIncoming, NodeHopOutgoing } from '@peck/packets'
import { Handler, PacketHandler, Throttle } from '@peck/plugins'

import { ClusterNode } from '../../../cluster/node/index.ts'
import { type HandlerContext } from '../../../dispatch/context/index.ts'

/**
 * Sends a player to another node
 * @class
 */
@Throttle({ limit: 3, per: 10_000 })
@Handler(NodeHopIncoming)
export class NodeHopHandler extends PacketHandler<NodeHopIncoming> {
  /**
   * This emulator's place in the cluster
   */
  private readonly node = inject<ClusterNode>(ClusterNode)

  /**
   * Names the emptiest open node
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: NodeHopIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const others = await this.node.others()

    const target = NodeHopHandler.emptiest(others)
    if (!target) context.log.info('no node to move to')

    await context.session.send<NodeHopOutgoing>(
      NodeHopOutgoing.to(packet.room, target?.host ?? ''),
    )
  }

  /**
   * Picks the emptiest node with room
   * @param nodes The nodes
   * @returns The node, or null
   */
  private static emptiest(nodes: readonly NodeInfo[]): NodeInfo | null {
    const open = nodes.filter(
      (node) => !node.draining && node.players < node.capacity,
    )

    return open.toSorted((a, b) => a.players - b.players)[0] ?? null
  }
}
