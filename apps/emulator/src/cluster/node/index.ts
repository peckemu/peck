import { inject, injectable } from '@needle-di/core'
import {
  type NodeInfo,
  type NodeLease,
  NodeRegistry,
  type NodeRoom,
} from '@peck/cluster'
import { RoomManager } from '@peck/game'
import { type Logger } from '@peck/logger'

import { type Config } from '#emulator/config'
import { SessionManager } from '#emulator/sessions/manager'
import { ConfigToken, LoggerToken } from '#emulator/tokens'

/**
 * The heartbeat interval
 */
const HEARTBEAT = 10_000

/**
 * This emulator's place in the cluster
 * @class
 */
@injectable()
export class ClusterNode {
  /**
   * The emulator config
   */
  private readonly config = inject<Config>(ConfigToken)

  /**
   * Every emulator node
   */
  private readonly registry = inject<NodeRegistry>(NodeRegistry)

  /**
   * Every open session
   */
  private readonly sessions = inject<SessionManager>(SessionManager)

  /**
   * Every room and its instances
   */
  private readonly rooms = inject<RoomManager>(RoomManager)

  /**
   * The emulator's logger
   */
  private readonly logger = inject<Logger>(LoggerToken)

  /**
   * The node's lease
   */
  private lease: NodeLease | null = null

  /**
   * The heartbeat timer
   */
  private timer: ReturnType<typeof setInterval> | null = null

  /**
   * The node id
   */
  public get id(): number {
    if (!this.lease) throw new Error('Node has not joined the cluster')

    return this.lease.id
  }

  /**
   * Joins the cluster and starts the heartbeat
   */
  public async join(): Promise<void> {
    const { node } = this.config

    this.lease = await this.registry.join(node)
    this.rooms.shardFor(this.lease.id)
    this.timer = setInterval(() => void this.beat(), HEARTBEAT)

    this.logger.info({ node: this.lease.id }, 'joined the cluster')
  }

  /**
   * Stops the heartbeat and leaves the cluster
   */
  public async leave(): Promise<void> {
    if (this.timer) clearInterval(this.timer)

    await this.lease?.leave()
    this.lease = null
  }

  /**
   * Lists the other nodes a client can move to
   * @returns The nodes
   */
  public async others(): Promise<NodeInfo[]> {
    const nodes = await this.registry.list()

    return nodes.filter((node) => this.reachable(node))
  }

  /**
   * Finds another node a client can move to
   * @param id The node id
   * @returns The node, or null
   */
  public async other(id: number): Promise<NodeInfo | null> {
    const node = await this.registry.get(id)

    return node && !node.draining && this.reachable(node) ? node : null
  }

  /**
   * Lists the rooms open on another node
   * @param id The node id
   * @returns The rooms
   */
  public async roomsOn(id: number): Promise<NodeRoom[]> {
    return this.registry.rooms(id)
  }

  /**
   * Checks a client can move to a node
   * @param node The node
   * @returns Whether it can
   */
  private reachable(node: NodeInfo): boolean {
    const { host, port } = this.config.node

    return (
      node.id !== this.lease?.id && node.host !== host && node.port === port
    )
  }

  /**
   * Lists the occupied rooms
   * @returns The rooms
   */
  private open(): NodeRoom[] {
    return this.rooms
      .all()
      .filter((room) => !room.empty)
      .map((room) => ({
        name: room.name,
        displayName: room.template.displayName,
        players: room.size,
        capacity: room.capacity,
      }))
  }

  /**
   * Sends a heartbeat
   */
  private async beat(): Promise<void> {
    try {
      const held = await this.lease?.beat({
        players: this.sessions.players,
        rooms: this.open(),
      })
      if (held === false) this.logger.error('node id was taken by another node')
    } catch (error) {
      this.logger.warn({ err: error }, 'heartbeat failed')
    }
  }
}
