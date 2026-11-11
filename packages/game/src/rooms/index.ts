import { RoomJoinType } from '@peck/shared'

import { type DenRoomTemplate } from '#game/content/den-room'
import { GameError } from '#game/error'
import { type Player } from '#game/player'
import { Room } from '#game/room'
import { firstShardOf, SHARDS_PER_NODE } from '#game/shards'
import {
  type PartyDetails,
  RoomTemplate,
  type RoomTemplateOptions,
} from '#game/template'

/**
 * Where a join put the player
 */
export type RoomPlacement =
  | { readonly room: Room; readonly opened: boolean }
  | { readonly room: null; readonly reason: 'unknown' | 'full' }

/**
 * Every room and its instances
 * @class
 */
export class RoomManager {
  /**
   * Every room by name
   */
  private readonly templates = new Map<string, RoomTemplate>()

  /**
   * The open instances by room name
   */
  private readonly instances = new Map<string, Room[]>()

  /**
   * Every open instance by id
   */
  private readonly rooms = new Map<number, Room>()

  /**
   * The next instance id
   */
  private nextId: number

  /**
   * The node's first shard
   */
  private firstShard = 1

  /**
   * Creates the manager
   * @param firstId The first instance id
   */
  public constructor(firstId = 1) {
    this.nextId = firstId
  }

  /**
   * Numbers new instances from a node's shards
   * @param nodeId The node id
   */
  public shardFor(nodeId: number): void {
    this.firstShard = firstShardOf(nodeId)
  }

  /**
   * Checks a shard is on this node
   * @param shard The shard number
   * @returns Whether it is
   */
  public owns(shard: number): boolean {
    return shard >= this.firstShard && shard < this.firstShard + SHARDS_PER_NODE
  }

  /**
   * How many instances are open
   * @returns The count
   */
  public get size(): number {
    return this.rooms.size
  }

  /**
   * Adds a room players can join
   * @param options The room definition
   * @returns The room
   */
  public register(options: RoomTemplateOptions): RoomTemplate {
    if (this.templates.has(options.name)) {
      throw new GameError(`Room ${options.name} already exists`, 'DUPLICATE')
    }
    const template = new RoomTemplate(options)
    this.templates.set(template.name, template)
    return template
  }

  /**
   * Gets a player's den room
   * @param owner The owner's username
   * @param ownerGameId The owner's id in the database
   * @param denRoom The den room in use
   * @returns The room, or null
   */
  public den(
    owner: string,
    ownerGameId: number,
    denRoom: DenRoomTemplate,
  ): RoomTemplate | null {
    const open = this.templates.get(`den${owner}`)
    if (open) return open

    const options = this.denOptions(owner, ownerGameId, denRoom)

    return options ? this.register(options) : null
  }

  /**
   * Moves an open den to another den room
   * @param owner The owner's username
   * @param ownerGameId The owner's id in the database
   * @param denRoom The den room now in use
   * @returns The den, or null
   */
  public moveDen(
    owner: string,
    ownerGameId: number,
    denRoom: DenRoomTemplate,
  ): Room | null {
    const name = `den${owner}`
    const options = this.denOptions(owner, ownerGameId, denRoom)
    if (!this.templates.has(name) || !options) return null

    const template = new RoomTemplate(options)
    this.templates.set(name, template)

    const instances = this.instancesOf(name)
    for (const room of instances) room.template = template

    return instances[0] ?? null
  }

  /**
   * Opens a hosted party room
   * @param name The room's name
   * @param roomDefId The venue room
   * @param party The party
   * @returns The room, or null
   */
  public hostParty(
    name: string,
    roomDefId: number,
    party: PartyDetails,
  ): RoomTemplate | null {
    const room = this.byDefId(roomDefId)
    if (!room) return null

    this.templates.delete(name)

    return this.register({
      name,
      defId: room.defId,
      enviroType: room.enviroType,
      displayName: name,
      capacity: room.capacity,
      single: true,
      party,
    })
  }

  /**
   * Finds a room by its definition id
   * @param defId The room's definition id
   * @returns The room, or null
   */
  public byDefId(defId: number): RoomTemplate | null {
    for (const template of this.templates.values()) {
      if (template.defId === defId && !template.den && !template.party) {
        return template
      }
    }

    return null
  }

  /**
   * Finds a room
   * @param name The room's name
   * @returns The room, or null
   */
  public template(name: string): RoomTemplate | null {
    return this.templates.get(name) ?? null
  }

  /**
   * Finds an open instance
   * @param id The instance's id
   * @returns The instance, or null
   */
  public get(id: number): Room | null {
    return this.rooms.get(id) ?? null
  }

  /**
   * Lists every open instance
   * @returns The instances
   */
  public all(): readonly Room[] {
    return [...this.rooms.values()]
  }

  /**
   * Lists a room's open instances
   * @param name The room's name
   * @returns The sorted instances
   */
  public instancesOf(name: string): readonly Room[] {
    return this.instances.get(name) ?? []
  }

  /**
   * Moves a player into a room
   * @param player The player
   * @param requested The room name
   * @param joinType How the client wants the instance picked
   * @returns Where the player went
   */
  public join(
    player: Player,
    requested: string,
    joinType: RoomJoinType = RoomJoinType.Auto,
  ): RoomPlacement {
    const [name = '', number] = requested.split('#')
    const template = this.templates.get(name)
    if (!template) return { room: null, reason: 'unknown' }

    const asked = RoomManager.number(number)
    const wanted = asked !== null && this.owns(asked) ? asked : null
    const current = player.room
    if (
      current?.template === template &&
      (wanted === null || wanted === current.number)
    ) {
      return { room: current, opened: false }
    }

    const placement = this.place(template, wanted, joinType)
    if (placement.room) {
      this.leave(player)
      placement.room.add(player)
      player.room = placement.room
    }
    return placement
  }

  /**
   * Takes a player out of their room
   * @param player The player
   */
  public leave(player: Player): void {
    const { room } = player
    if (!room) return

    room.remove(player)
    player.room = null
    if (room.empty && (room.template.single || room.number > this.firstShard)) {
      this.close(room)
    }
  }

  /**
   * Picks the instance a player goes in
   * @param template The room
   * @param wanted The wanted instance, or null
   * @param joinType How the client wants the instance picked
   * @returns Where the player goes
   */
  private place(
    template: RoomTemplate,
    wanted: number | null,
    joinType: RoomJoinType,
  ): RoomPlacement {
    const instances = this.instancesOf(template.name)
    const asked = instances.find((room) => room.number === wanted)

    if (asked && !asked.full) return { room: asked, opened: false }
    if (asked && joinType === RoomJoinType.DirectHalt) {
      return { room: null, reason: 'full' }
    }

    const opensAsked =
      !asked && wanted !== null && joinType === RoomJoinType.DirectSearch
    if (opensAsked && !template.single) {
      return { room: this.open(template, wanted), opened: true }
    }

    const free = instances.find((room) => !room.full)
    if (free) return { room: free, opened: false }
    if (template.single && instances.length > 0) {
      return { room: null, reason: 'full' }
    }

    return { room: this.open(template), opened: true }
  }

  /**
   * Opens an instance of a room
   * @param template The room
   * @param wanted The number wanted
   * @returns The instance
   */
  private open(template: RoomTemplate, wanted: number | null = null): Room {
    const instances = this.instancesOf(template.name)
    const taken = new Set(instances.map((room) => room.number))

    let number =
      wanted !== null && !taken.has(wanted) ? wanted : this.firstShard
    while (taken.has(number)) number++

    const room = new Room(this.nextId++, template, number)
    this.instances.set(
      template.name,
      [...instances, room].sort((a, b) => a.number - b.number),
    )
    this.rooms.set(room.id, room)
    return room
  }

  /**
   * Closes an instance
   * @param room The instance
   */
  private close(room: Room): void {
    const { name } = room.template
    this.instances.set(
      name,
      this.instancesOf(name).filter((each) => each !== room),
    )
    this.rooms.delete(room.id)
    if (room.template.den || room.template.party) this.templates.delete(name)
  }

  /**
   * Describes a player's den room
   * @param owner The owner's username
   * @param ownerGameId The owner's id in the database
   * @param denRoom The den room in use
   * @returns The room definition, or null
   */
  private denOptions(
    owner: string,
    ownerGameId: number,
    denRoom: DenRoomTemplate,
  ): RoomTemplateOptions | null {
    const room = this.byDefId(denRoom.roomDefId)
    if (!room) return null

    return {
      name: `den${owner}`,
      defId: room.defId,
      enviroType: denRoom.enviroType,
      displayName: owner,
      single: true,
      den: { defId: denRoom.defId, pathName: room.name, ownerGameId },
    }
  }

  /**
   * Reads the wanted instance
   * @param text The instance text
   * @returns The number, or null
   */
  private static number(text: string | undefined): number | null {
    const number = Number(text)
    return text !== undefined && Number.isSafeInteger(number) && number >= 1
      ? number
      : null
  }
}
