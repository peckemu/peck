import { GameError } from '#game/error'
import { type Player } from '#game/player'
import { type RoomTemplate } from '#game/template'

/**
 * A room instance
 * @class
 */
export class Room {
  /**
   * The instance's client id
   */
  public readonly id: number

  /**
   * The template room
   */
  public template: RoomTemplate

  /**
   * The instance number
   */
  public readonly number: number

  /**
   * The players by user id
   */
  private readonly members = new Map<number, Player>()

  /**
   * Creates an instance
   * @param id The instance's client id
   * @param template The template room
   * @param number The instance number
   */
  public constructor(id: number, template: RoomTemplate, number: number) {
    this.id = id
    this.template = template
    this.number = number
  }

  /**
   * The joined name
   * @returns The room name
   */
  public get name(): string {
    return this.template.single
      ? this.template.name
      : `${this.template.name}#${this.number}`
  }

  /**
   * How many players it holds
   * @returns The capacity
   */
  public get capacity(): number {
    return this.template.capacity
  }

  /**
   * How many players are in it
   * @returns The count
   */
  public get size(): number {
    return this.members.size
  }

  /**
   * Whether it has no space left
   * @returns Whether it is full
   */
  public get full(): boolean {
    return this.members.size >= this.capacity
  }

  /**
   * Whether nobody is in it
   * @returns Whether it is empty
   */
  public get empty(): boolean {
    return this.members.size === 0
  }

  /**
   * The players in it
   * @returns The players
   */
  public get players(): Player[] {
    return [...this.members.values()]
  }

  /**
   * Puts a player in it
   * @param player The player
   */
  public add(player: Player): void {
    if (this.full) throw new GameError('Room is full', 'ROOM_FULL')
    this.members.set(player.id, player)
  }

  /**
   * Takes a player out of it
   * @param player The player
   */
  public remove(player: Player): void {
    this.members.delete(player.id)
  }

  /**
   * Checks for a player
   * @param player The player
   * @returns Whether they are in it
   */
  public has(player: Player): boolean {
    return this.members.has(player.id)
  }
}
