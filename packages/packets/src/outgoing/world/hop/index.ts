import { Field, OutgoingPacket, Packet, PacketFactory } from '@peck/protocol'

import { Outgoing } from '#packets/outgoing/headers'

/**
 * The node to move to
 * @class
 */
@Packet(Outgoing.NodeHop, 'xt')
export class NodeHopOutgoing extends OutgoingPacket {
  /**
   * The node's host
   */
  @Field.string() public readonly host: string = ''

  /**
   * Names the node to move to
   * @param room The target room
   * @param host The node's host
   * @returns The packet
   */
  public static to(room: number, host: string): NodeHopOutgoing {
    return PacketFactory.create<NodeHopOutgoing>(NodeHopOutgoing, {
      room,
      host,
    })
  }
}
