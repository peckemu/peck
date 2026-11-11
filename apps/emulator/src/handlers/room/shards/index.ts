import { inject } from '@needle-di/core'
import { type NodeRoom, Presence } from '@peck/cluster'
import {
  firstShardOf,
  nodeOfShard,
  type Player,
  type Room,
  RoomManager,
  shardOfRoom,
} from '@peck/game'
import {
  type Shard,
  ShardListIncoming,
  ShardListOutgoing,
  type ShardNode,
} from '@peck/packets'
import { Handler, PacketHandler, Throttle } from '@peck/plugins'

import { ClusterNode } from '#emulator/cluster/node'
import { type Config } from '#emulator/config'
import { type HandlerContext } from '#emulator/dispatch/context'
import { SessionManager } from '#emulator/sessions/manager'
import { ConfigToken } from '#emulator/tokens'

/**
 * The language every shard is in
 */
const ENGLISH = 0

/**
 * A full shard
 */
const FULL = 4

/**
 * The most bars a shard shows
 */
const BARS = 3

/**
 * A shard's players
 */
type ShardCount = {
  /**
   * How many play on it
   */
  players: number

  /**
   * Its start room, or null
   */
  start: NodeRoom | null
}

/**
 * Lists the shards
 * @class
 */
@Throttle({ limit: 5, per: 10_000 })
@Handler(ShardListIncoming)
export class ShardListHandler extends PacketHandler<ShardListIncoming> {
  /**
   * The emulator config
   */
  private readonly config = inject<Config>(ConfigToken)

  /**
   * Every room and its instances
   */
  private readonly rooms = inject<RoomManager>(RoomManager)

  /**
   * Every open session
   */
  private readonly sessions = inject<SessionManager>(SessionManager)

  /**
   * Who is playing where
   */
  private readonly presence = inject<Presence>(Presence)

  /**
   * This node in the cluster
   */
  private readonly node = inject<ClusterNode>(ClusterNode)

  /**
   * Sends every node's shards
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: ShardListIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const { player, session } = context

    const buddies = await this.buddies(player)
    const here = this.list(this.node.id, this.local(), buddies, false)
    const others = await this.node.others()

    const nodes: ShardNode[] = [{ host: this.config.node.host, shards: here }]
    for (const other of others) {
      const rooms = await this.node.roomsOn(other.id)
      nodes.push({
        host: other.host,
        shards: this.list(other.id, rooms, buddies, other.draining),
      })
    }

    await session.send<ShardListOutgoing>(
      ShardListOutgoing.of(packet.room, nodes),
    )
  }

  /**
   * Lists this node's sharded rooms
   * @returns The rooms
   */
  private local(): NodeRoom[] {
    return this.rooms
      .all()
      .filter((room) => ShardListHandler.sharded(room))
      .map((room) => ({
        name: room.name,
        displayName: room.template.displayName,
        players: room.size,
        capacity: room.capacity,
      }))
  }

  /**
   * Lists a node's shards
   * @param nodeId The node id
   * @param rooms The node's rooms
   * @param buddies The buddy counts by shard
   * @param draining Whether the node takes nobody new
   * @returns The shards
   */
  private list(
    nodeId: number,
    rooms: readonly NodeRoom[],
    buddies: ReadonlyMap<number, number>,
    draining: boolean,
  ): Shard[] {
    const first = firstShardOf(nodeId)
    const open = new Map<number, ShardCount>([
      [first, { players: 0, start: null }],
    ])

    for (const room of rooms) {
      const shard = shardOfRoom(room.name)
      if (shard === null || nodeOfShard(shard) !== nodeId) continue
      if (!this.shardedName(room.name)) continue

      const count = open.get(shard) ?? { players: 0, start: null }
      count.players += room.players
      if (room.name === `${this.config.startRoom}#${String(shard)}`) {
        count.start = room
      }
      open.set(shard, count)
    }

    return [...open]
      .sort(([a], [b]) => a - b)
      .map(([id, { players, start }]) => ({
        id,
        language: ENGLISH,
        population: draining
          ? FULL
          : ShardListHandler.population(players, start),
        buddies: buddies.get(id) ?? 0,
      }))
  }

  /**
   * Counts the player's buddies on each shard
   * @param player The player
   * @returns The counts by shard
   */
  private async buddies(player: Player): Promise<Map<number, number>> {
    const rooms: string[] = []
    const away: number[] = []

    for (const { gameId } of player.buddies) {
      const buddy = this.sessions.byPlayer(gameId)?.player
      if (!buddy) {
        away.push(gameId)
        continue
      }

      if (buddy.room && !buddy.invisible) rooms.push(buddy.room.name)
    }

    const found = away.length === 0 ? [] : await this.presence.many(away)
    for (const { room, invisible } of found) {
      if (room && !invisible) rooms.push(room)
    }

    const counts = new Map<number, number>()
    for (const name of rooms) {
      const shard = shardOfRoom(name)
      if (shard === null || !this.shardedName(name)) continue

      counts.set(shard, (counts.get(shard) ?? 0) + 1)
    }

    return counts
  }

  /**
   * Checks a room name belongs to a shard
   * @param name The room name
   * @returns Whether it does
   */
  private shardedName(name: string): boolean {
    const [base = ''] = name.split('#')
    const template = this.rooms.template(base)

    return (
      template !== null && !template.single && !template.den && !template.party
    )
  }

  /**
   * Checks a room belongs to a shard
   * @param room The room
   * @returns Whether it does
   */
  private static sharded(room: Room): boolean {
    const { template } = room

    return !template.single && !template.den && !template.party
  }

  /**
   * Works out how full a shard looks
   * @param players How many play on it
   * @param start Its start room, or null
   * @returns The bars
   */
  private static population(players: number, start: NodeRoom | null): number {
    if (players === 0) return 0
    if (!start || start.capacity <= 0) return 1
    if (start.players >= start.capacity) return FULL

    const bars = Math.ceil((BARS * start.players) / start.capacity)

    return Math.min(BARS, Math.max(1, bars))
  }
}
