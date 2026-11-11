import { type ClusterStore } from '#cluster/store'

/**
 * The node lifetime
 */
export const NODE_TTL = 30_000

/**
 * The highest node id
 */
const MOST_NODES = 64

/**
 * An emulator node
 */
export type NodeInfo = {
  /**
   * The node id
   */
  readonly id: number

  /**
   * The name players see
   */
  readonly name: string

  /**
   * Where the client connects
   */
  readonly host: string

  /**
   * The game port
   */
  readonly port: number

  /**
   * The player limit
   */
  readonly capacity: number

  /**
   * How many are playing
   */
  readonly players: number

  /**
   * Whether it takes nobody new
   */
  readonly draining: boolean

  /**
   * The build it runs
   */
  readonly version: string

  /**
   * When it started
   */
  readonly startedAt: number

  /**
   * The last heartbeat
   */
  readonly heartbeatAt: number
}

/**
 * A room open on a node
 */
export type NodeRoom = {
  /**
   * The full room name
   */
  readonly name: string

  /**
   * The name players see
   */
  readonly displayName: string

  /**
   * How many are in it
   */
  readonly players: number

  /**
   * How many it holds
   */
  readonly capacity: number
}

/**
 * What a node says in a heartbeat
 */
export type NodeStatus = {
  /**
   * How many are playing
   */
  readonly players: number

  /**
   * The rooms it has open
   */
  readonly rooms: readonly NodeRoom[]
}

/**
 * A node joining the cluster
 */
export type NodeJoin = {
  /**
   * The wanted id, or null
   */
  readonly id: number | null

  /**
   * The server name, or null
   */
  readonly name: string | null

  /**
   * Where the client connects
   */
  readonly host: string

  /**
   * The game port
   */
  readonly port: number

  /**
   * The player limit
   */
  readonly capacity: number

  /**
   * The build it runs
   */
  readonly version: string
}

/**
 * A taken node id
 * @class
 */
export class NodeIdTakenError extends Error {
  /**
   * The error name
   */
  public override readonly name = 'NodeIdTakenError'

  /**
   * Creates the error
   * @param id The node id
   */
  public constructor(id: number) {
    super(`Node ${String(id)} is already running`)
  }
}

/**
 * The cluster's key names
 */
const KEYS = {
  nodes: 'peck:nodes',
  node: (id: number) => `peck:node:${String(id)}`,
  owner: (id: number) => `peck:node-owner:${String(id)}`,
  rooms: (id: number) => `peck:node-rooms:${String(id)}`,
  drain: (id: number) => `peck:node-drain:${String(id)}`,
}

/**
 * A node's place in the cluster
 * @class
 */
export class NodeLease {
  /**
   * The node id
   */
  public readonly id: number

  /**
   * The store
   */
  private readonly store: ClusterStore

  /**
   * The id's owner
   */
  private readonly owner: string

  /**
   * The joining node
   */
  private readonly node: Omit<NodeInfo, 'players' | 'draining' | 'heartbeatAt'>

  /**
   * Creates the lease
   * @param store The store
   * @param owner The id's owner
   * @param node The joining node
   */
  public constructor(
    store: ClusterStore,
    owner: string,
    node: Omit<NodeInfo, 'players' | 'draining' | 'heartbeatAt'>,
  ) {
    this.id = node.id
    this.store = store
    this.owner = owner
    this.node = node
  }

  /**
   * Says the node is still up
   * @param status The node's status
   * @returns Whether the node still holds its id
   */
  public async beat(status: NodeStatus): Promise<boolean> {
    const held = await this.store.claim(
      KEYS.owner(this.id),
      this.owner,
      NODE_TTL,
    )
    if (!held) return false

    const record = {
      ...this.node,
      players: status.players,
      heartbeatAt: Date.now(),
    }

    await this.store.put(KEYS.node(this.id), JSON.stringify(record), NODE_TTL)
    await this.store.put(
      KEYS.rooms(this.id),
      JSON.stringify(status.rooms),
      NODE_TTL,
    )
    await this.store.add(KEYS.nodes, String(this.id))

    return true
  }

  /**
   * Leaves the cluster
   */
  public async leave(): Promise<void> {
    await this.store.delete(KEYS.node(this.id))
    await this.store.delete(KEYS.rooms(this.id))
    await this.store.remove(KEYS.nodes, String(this.id))
    await this.store.release(KEYS.owner(this.id), this.owner)
  }
}

/**
 * Every emulator node
 * @class
 */
export class NodeRegistry {
  /**
   * The store
   */
  private readonly store: ClusterStore

  /**
   * Creates the registry
   * @param store The store
   */
  public constructor(store: ClusterStore) {
    this.store = store
  }

  /**
   * Joins the cluster
   * @param join The node
   * @returns The node's lease
   */
  public async join(join: NodeJoin): Promise<NodeLease> {
    const owner = crypto.randomUUID()
    const id = await this.claim(join.id, owner)

    const lease = new NodeLease(this.store, owner, {
      id,
      name: join.name ?? `Server ${String(id)}`,
      host: join.host,
      port: join.port,
      capacity: join.capacity,
      version: join.version,
      startedAt: Date.now(),
    })

    await lease.beat({ players: 0, rooms: [] })

    return lease
  }

  /**
   * Lists the live nodes
   * @returns The nodes, by id
   */
  public async list(): Promise<NodeInfo[]> {
    const nodes: NodeInfo[] = []

    for (const member of await this.store.members(KEYS.nodes)) {
      const id = Number(member)
      const record = await this.store.get(KEYS.node(id))

      if (record === null) {
        await this.store.remove(KEYS.nodes, member)
        continue
      }

      const draining = (await this.store.get(KEYS.drain(id))) !== null
      nodes.push({
        ...(JSON.parse(record) as Omit<NodeInfo, 'draining'>),
        draining,
      })
    }

    return nodes.sort((a, b) => a.id - b.id)
  }

  /**
   * Finds a live node
   * @param id The node id
   * @returns The node, or null
   */
  public async get(id: number): Promise<NodeInfo | null> {
    return (await this.list()).find((node) => node.id === id) ?? null
  }

  /**
   * Lists the rooms open on a node
   * @param id The node id
   * @returns The rooms, fullest first
   */
  public async rooms(id: number): Promise<NodeRoom[]> {
    const stored = await this.store.get(KEYS.rooms(id))
    if (stored === null) return []

    const rooms = JSON.parse(stored) as NodeRoom[]

    return rooms.sort((a, b) => b.players - a.players)
  }

  /**
   * Drains or undrains a node
   * @param id The node id
   * @param draining Whether it takes nobody new
   */
  public async drain(id: number, draining: boolean): Promise<void> {
    if (draining) await this.store.keep(KEYS.drain(id), '1')
    else await this.store.delete(KEYS.drain(id))
  }

  /**
   * Claims a node id
   * @param wanted The id wanted, or null
   * @param owner The process claiming it
   * @returns The id
   */
  private async claim(wanted: number | null, owner: string): Promise<number> {
    if (wanted !== null) {
      if (!(await this.store.claim(KEYS.owner(wanted), owner, NODE_TTL))) {
        throw new NodeIdTakenError(wanted)
      }

      return wanted
    }

    for (let id = 1; id <= MOST_NODES; id++) {
      if (await this.store.claim(KEYS.owner(id), owner, NODE_TTL)) return id
    }

    throw new Error('No free node id')
  }
}
