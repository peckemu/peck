import { QuestActorType, QuestPrizeKind } from '@peck/shared'

import {
  type QuestActorTemplate,
  type QuestPrize,
  type QuestTemplate,
} from '#game/content/quest'
import { type Room } from '#game/room'

/**
 * A player's most health
 */
export const QUEST_HEALTH = 100

/**
 * What a phantom's hit takes
 */
export const PHANTOM_DAMAGE = 20

/**
 * What a player's hit takes
 */
export const PLAYER_DAMAGE = 25

/**
 * What a heal gives
 */
export const HEAL = 20

/**
 * An actor's default health
 */
const ACTOR_HEALTH = 100

/**
 * The actor types that can be hit
 */
const HITTABLE: ReadonlySet<number> = new Set<number>([
  QuestActorType.Phantom,
  QuestActorType.Boss,
  QuestActorType.Plant,
  QuestActorType.Destructible,
])

/**
 * The gift given below the crystal goal
 */
export const CONSOLATION: QuestPrize = {
  kind: QuestPrizeKind.Gems,
  value: 150,
  color: 0,
}

/**
 * A player in an adventure
 */
export type Adventurer = {
  /**
   * The player
   */
  readonly gameId: number

  /**
   * The player's session id
   */
  readonly userId: number

  /**
   * The room they came from
   */
  readonly origin: string

  /**
   * The crystals gathered
   */
  crystals: number

  /**
   * Their health
   */
  health: number

  /**
   * The item carried, or null
   */
  holding: string | null
}

/**
 * An actor as it is now
 */
export type AdventureActor = {
  /**
   * Its id
   */
  readonly actorId: string

  /**
   * How it was defined
   */
  readonly template: QuestActorTemplate

  /**
   * Its health
   */
  health: number

  /**
   * Whether it is used up
   */
  done: boolean

  /**
   * The players who took its prize
   */
  readonly claimed: Set<number>
}

/**
 * Where a moved item lies
 */
export type MovedSpot = {
  /**
   * The item
   */
  readonly actorId: string

  /**
   * Where across
   */
  readonly x: number

  /**
   * Where down
   */
  readonly y: number
}

/**
 * What a hit came to
 */
export type ActorHit = {
  /**
   * The actor
   */
  readonly actor: AdventureActor

  /**
   * Its health percentage
   */
  readonly healthPercent: number

  /**
   * The health taken
   */
  readonly dealt: number

  /**
   * Whether it was defeated
   */
  readonly defeated: boolean
}

/**
 * What a pick up came to
 */
export type PickUp =
  | { readonly result: 'picked' }
  | { readonly result: 'holding'; readonly heldItem: string }
  | { readonly result: 'taken' }

/**
 * One adventure being played
 * @class
 */
export class Adventure {
  /**
   * The instance's id
   */
  public readonly id: number

  /**
   * The adventure
   */
  public readonly template: QuestTemplate

  /**
   * Normal 0 or hard 1
   */
  public readonly difficulty: number

  /**
   * The host, or null
   */
  public readonly host: number | null

  /**
   * The script's timestamp
   */
  public readonly timestamp: string

  /**
   * Whether it started
   */
  public started = false

  /**
   * The room it is played in, or null
   */
  public room: Room | null = null

  /**
   * The players
   */
  private readonly members = new Map<number, Adventurer>()

  /**
   * The actors
   */
  private readonly actors = new Map<string, AdventureActor>()

  /**
   * The prizes offered by player
   */
  private readonly offers = new Map<number, Map<string, QuestPrize>>()

  /**
   * The gifts picked by player
   */
  private readonly picked = new Map<number, Set<number>>()

  /**
   * The items players put down
   */
  private readonly moved = new Map<string, MovedSpot>()

  /**
   * The players who finished
   */
  private readonly finished = new Set<number>()

  /**
   * How many actors were spawned
   */
  private spawned = 0

  /**
   * Creates an adventure
   * @param id The instance's id
   * @param template The adventure
   * @param difficulty Normal 0 or hard 1
   * @param host The host, or null
   * @param now When it opened
   */
  public constructor(
    id: number,
    template: QuestTemplate,
    difficulty: number,
    host: number | null,
    now = Date.now(),
  ) {
    this.id = id
    this.template = template
    this.difficulty = difficulty
    this.host = host
    this.timestamp = String(Math.floor(now / 1000))
  }

  /**
   * The room name the client sees
   * @returns The name
   */
  public get roomName(): string {
    return `quest_${String(this.id)}.room_1`
  }

  /**
   * How many play
   * @returns The count
   */
  public get size(): number {
    return this.members.size
  }

  /**
   * Whether no one else fits
   * @returns Whether it is full
   */
  public get full(): boolean {
    return this.members.size >= Math.max(1, this.template.avatarLimit)
  }

  /**
   * Whether no one is in it
   * @returns Whether it is empty
   */
  public get empty(): boolean {
    return this.members.size === 0
  }

  /**
   * The players
   * @returns The players in order
   */
  public get players(): Adventurer[] {
    return [...this.members.values()]
  }

  /**
   * The actors
   * @returns The actors
   */
  public get cast(): AdventureActor[] {
    return [...this.actors.values()]
  }

  /**
   * Adds a player
   * @param gameId The player
   * @param userId The player's session id
   * @param origin The room they came from
   * @returns The player
   */
  public add(gameId: number, userId: number, origin: string): Adventurer {
    const adventurer: Adventurer = {
      gameId,
      userId,
      origin,
      crystals: 0,
      health: QUEST_HEALTH,
      holding: null,
    }
    this.members.set(gameId, adventurer)
    return adventurer
  }

  /**
   * Takes a player out
   * @param gameId The player
   * @returns The player, or null
   */
  public remove(gameId: number): Adventurer | null {
    const adventurer = this.members.get(gameId) ?? null
    this.members.delete(gameId)
    this.offers.delete(gameId)

    if (adventurer?.holding) this.moved.delete(adventurer.holding)
    return adventurer
  }

  /**
   * Finds a player
   * @param gameId The player
   * @returns The player, or null
   */
  public get(gameId: number): Adventurer | null {
    return this.members.get(gameId) ?? null
  }

  /**
   * Finds a player by session id
   * @param userId The player's session id
   * @returns The player, or null
   */
  public byUser(userId: number): Adventurer | null {
    return this.players.find((each) => each.userId === userId) ?? null
  }

  /**
   * Starts the adventure
   */
  public start(): void {
    this.started = true
    this.actors.clear()

    for (const template of this.template.actors) {
      this.actors.set(template.actorId, {
        actorId: template.actorId,
        template,
        health: template.health > 0 ? template.health : ACTOR_HEALTH,
        done: false,
        claimed: new Set<number>(),
      })
    }
  }

  /**
   * Finds an actor
   * @param actorId The actor
   * @returns The actor, or null
   */
  public actor(actorId: string): AdventureActor | null {
    return this.actors.get(actorId) ?? null
  }

  /**
   * Names a new actor
   * @param prefix The name's start
   * @returns The name
   */
  public spawn(prefix: string): string {
    this.spawned++
    return `${prefix}_${String(this.spawned)}`
  }

  /**
   * Hits an actor
   * @param actorId The actor
   * @param damage The damage
   * @returns What it came to, or null
   */
  public hit(actorId: string, damage: number): ActorHit | null {
    const actor = this.actors.get(actorId)
    if (!actor || actor.done || !HITTABLE.has(actor.template.type)) return null

    const most =
      actor.template.health > 0 ? actor.template.health : ACTOR_HEALTH
    const before = actor.health
    actor.health = Math.max(0, actor.health - damage)
    actor.done = actor.health === 0

    return {
      actor,
      healthPercent: Math.round((actor.health * 100) / most),
      dealt: before - actor.health,
      defeated: actor.done,
    }
  }

  /**
   * Hurts a player
   * @param gameId The player
   * @param damage The damage
   * @returns The player, or null
   */
  public hurt(gameId: number, damage: number): Adventurer | null {
    const adventurer = this.members.get(gameId)
    if (!adventurer || adventurer.health === 0) return null

    adventurer.health = Math.max(0, adventurer.health - damage)
    return adventurer
  }

  /**
   * Heals a player
   * @param gameId The player
   * @param amount The health given
   * @returns The health given, or 0
   */
  public heal(gameId: number, amount: number): number {
    const adventurer = this.members.get(gameId)
    if (!adventurer || adventurer.health === 0) return 0

    const given = Math.min(amount, QUEST_HEALTH - adventurer.health)
    adventurer.health += given
    return given
  }

  /**
   * Brings a defeated player back
   * @param gameId The player
   * @returns The player, or null
   */
  public revive(gameId: number): Adventurer | null {
    const adventurer = this.members.get(gameId)
    if (!adventurer || adventurer.health > 0) return null

    adventurer.health = QUEST_HEALTH
    return adventurer
  }

  /**
   * Offers a player a prize
   * @param gameId The player
   * @param actorId The actor
   * @param prize The prize
   */
  public offer(gameId: number, actorId: string, prize: QuestPrize): void {
    const offers = this.offers.get(gameId) ?? new Map<string, QuestPrize>()
    offers.set(actorId, prize)
    this.offers.set(gameId, offers)
  }

  /**
   * Takes back an offered prize
   * @param gameId The player
   * @param actorId The actor
   * @returns The prize, or null
   */
  public answer(gameId: number, actorId: string): QuestPrize | null {
    const prize = this.offers.get(gameId)?.get(actorId) ?? null
    this.offers.get(gameId)?.delete(actorId)

    if (prize) this.actors.get(actorId)?.claimed.add(gameId)
    return prize
  }

  /**
   * Picks up an item
   * @param gameId The player
   * @param actorId The item
   * @returns What it came to
   */
  public pickUp(gameId: number, actorId: string): PickUp {
    const adventurer = this.members.get(gameId)
    if (!adventurer || adventurer.health === 0) return { result: 'taken' }
    if (adventurer.holding !== null) {
      return { result: 'holding', heldItem: adventurer.holding }
    }

    const carried = this.players.some((each) => each.holding === actorId)
    if (carried) return { result: 'taken' }

    adventurer.holding = actorId
    this.moved.delete(actorId)
    return { result: 'picked' }
  }

  /**
   * Puts down an item
   * @param gameId The player
   * @param actorId The item
   * @param x Where across
   * @param y Where down
   * @returns Whether it was carried
   */
  public drop(gameId: number, actorId: string, x: number, y: number): boolean {
    const adventurer = this.members.get(gameId)
    if (adventurer?.holding !== actorId) return false

    adventurer.holding = null
    this.moved.set(actorId, { actorId, x, y })
    return true
  }

  /**
   * Lists the items players put down
   * @returns The items
   */
  public movedItems(): MovedSpot[] {
    return [...this.moved.values()]
  }

  /**
   * Counts crystals a player gathered
   * @param gameId The player
   * @param amount How many
   * @returns The crystals in all, or null
   */
  public gather(gameId: number, amount: number): number | null {
    const adventurer = this.members.get(gameId)
    if (!adventurer) return null

    adventurer.crystals += amount
    return adventurer.crystals
  }

  /**
   * Picks an end gift
   * @param gameId The player
   * @param index The gift
   * @returns The prize, or null
   */
  public pickGift(gameId: number, index: number): QuestPrize | null {
    const adventurer = this.members.get(gameId)
    const gift = this.template.gifts[index]
    const picked = this.picked.get(gameId) ?? new Set<number>()
    if (!adventurer || !gift || picked.size > 0) return null

    picked.add(index)
    this.picked.set(gameId, picked)

    return adventurer.crystals < this.template.crystalGoal ? CONSOLATION : gift
  }

  /**
   * Throws away a player's gift
   * @param gameId The player
   */
  public discardGift(gameId: number): void {
    this.picked.set(gameId, new Set<number>([-1]))
  }

  /**
   * Whether a player can open the gifts
   * @param gameId The player
   * @returns Whether they can
   */
  public mayOpenGifts(gameId: number): boolean {
    return (
      this.template.gifts.length > 0 &&
      this.members.has(gameId) &&
      !this.picked.has(gameId)
    )
  }

  /**
   * Marks a player finished
   * @param gameId The player
   * @returns Whether they had not finished
   */
  public finish(gameId: number): boolean {
    if (!this.members.has(gameId) || this.finished.has(gameId)) return false

    this.finished.add(gameId)
    return true
  }
}

/**
 * Every adventure being played
 * @class
 */
export class Adventures {
  /**
   * The next instance id
   */
  private nextId = 1

  /**
   * The adventures by id
   */
  private readonly adventures = new Map<number, Adventure>()

  /**
   * The adventures by player
   */
  private readonly players = new Map<number, Adventure>()

  /**
   * Opens an adventure
   * @param template The adventure
   * @param difficulty Normal 0 or hard 1
   * @param host The host, or null
   * @returns The adventure
   */
  public open(
    template: QuestTemplate,
    difficulty: number,
    host: number | null = null,
  ): Adventure {
    const adventure = new Adventure(this.nextId++, template, difficulty, host)
    this.adventures.set(adventure.id, adventure)
    return adventure
  }

  /**
   * Finds a public lobby with space
   * @param defId The adventure
   * @param difficulty Normal 0 or hard 1
   * @returns The adventure, or null
   */
  public lobbyFor(defId: number, difficulty: number): Adventure | null {
    for (const adventure of this.adventures.values()) {
      const open =
        adventure.host === null && !adventure.started && !adventure.full
      if (
        open &&
        adventure.template.defId === defId &&
        adventure.difficulty === difficulty
      ) {
        return adventure
      }
    }

    return null
  }

  /**
   * Finds the private adventure a player hosts
   * @param gameId The host
   * @returns The adventure, or null
   */
  public hostedBy(gameId: number): Adventure | null {
    for (const adventure of this.adventures.values()) {
      if (adventure.host === gameId) return adventure
    }

    return null
  }

  /**
   * Finds a player's adventure
   * @param gameId The player
   * @returns The adventure, or null
   */
  public of(gameId: number): Adventure | null {
    return this.players.get(gameId) ?? null
  }

  /**
   * Finds an adventure
   * @param id The instance's id
   * @returns The adventure, or null
   */
  public get(id: number): Adventure | null {
    return this.adventures.get(id) ?? null
  }

  /**
   * How many adventures are open
   * @returns The count
   */
  public get size(): number {
    return this.adventures.size
  }

  /**
   * Puts a player in an adventure
   * @param adventure The adventure
   * @param gameId The player
   * @param userId The player's session id
   * @param origin The room they came from
   * @returns The player
   */
  public join(
    adventure: Adventure,
    gameId: number,
    userId: number,
    origin: string,
  ): Adventurer {
    this.leave(gameId)
    this.players.set(gameId, adventure)
    return adventure.add(gameId, userId, origin)
  }

  /**
   * Takes a player out of their adventure
   * @param gameId The player
   * @returns The adventure and the player, or null
   */
  public leave(
    gameId: number,
  ): { readonly adventure: Adventure; readonly adventurer: Adventurer } | null {
    const adventure = this.players.get(gameId)
    if (!adventure) return null

    this.players.delete(gameId)
    const adventurer = adventure.remove(gameId)
    if (adventure.empty) this.adventures.delete(adventure.id)

    return adventurer ? { adventure, adventurer } : null
  }
}
