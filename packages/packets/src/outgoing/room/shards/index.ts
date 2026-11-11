import { Field, OutgoingPacket, Packet, PacketFactory } from '@peck/protocol'

import { Outgoing } from '#packets/outgoing/headers'

/**
 * A shard in the server selector
 */
export type Shard = {
  /**
   * The shard's id
   */
  readonly id: number

  /**
   * Its language id
   */
  readonly language: number

  /**
   * How full it is
   */
  readonly population: number

  /**
   * How many buddies are on it
   */
  readonly buddies: number
}

/**
 * A server node and its shards
 */
export type ShardNode = {
  /**
   * The node's host
   */
  readonly host: string

  /**
   * Its shards
   */
  readonly shards: readonly Shard[]
}

/**
 * The shards on each node
 * @class
 */
@Packet(Outgoing.ShardList, 'xt')
export class ShardListOutgoing extends OutgoingPacket {
  /**
   * Each host and its shards
   */
  @Field.rest() public readonly body: readonly string[] = []

  /**
   * Lists the shards
   * @param room The target room
   * @param nodes The nodes
   * @returns The packet
   */
  public static of(
    room: number,
    nodes: readonly ShardNode[],
  ): ShardListOutgoing {
    const body = nodes.flatMap(({ host, shards }) => [
      host,
      ...shards.flatMap((shard) =>
        [shard.id, shard.language, shard.population, shard.buddies].map(String),
      ),
    ])

    return PacketFactory.create<ShardListOutgoing>(ShardListOutgoing, {
      room,
      body,
    })
  }
}
