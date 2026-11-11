/**
 * The default room capacity
 */
export const ROOM_CAPACITY = 30

/**
 * How a room is defined
 */
export type RoomTemplateOptions = {
  /**
   * The room's name
   */
  readonly name: string

  /**
   * The room's id in the rooms pack
   */
  readonly defId?: number

  /**
   * Land 0, ocean 1 or both 2
   */
  readonly enviroType?: number

  /**
   * The room's name in English
   */
  readonly displayName?: string

  /**
   * The room's name string id
   */
  readonly nameId?: number

  /**
   * The join name
   */
  readonly sentName?: string | null

  /**
   * How many players one instance holds
   */
  readonly capacity?: number

  /**
   * Whether the room has one instance only
   */
  readonly single?: boolean

  /**
   * Whether the room is a minigame
   */
  readonly game?: boolean

  /**
   * The den
   */
  readonly den?: DenDetails

  /**
   * The hosted party
   */
  readonly party?: PartyDetails
}

/**
 * What makes a room a hosted party
 */
export type PartyDetails = {
  /**
   * The party
   */
  readonly defId: number

  /**
   * The song it plays
   */
  readonly song: number
}

/**
 * What makes a room a den
 */
export type DenDetails = {
  /**
   * The den room's definition id
   */
  readonly defId: number

  /**
   * The room it loads
   */
  readonly pathName: string

  /**
   * The owner's id in the database
   */
  readonly ownerGameId: number
}

/**
 * A room template
 * @class
 */
export class RoomTemplate {
  /**
   * The den it is, or null
   */
  public readonly den: DenDetails | null

  /**
   * The hosted party, or null
   */
  public readonly party: PartyDetails | null

  /**
   * The room's name
   */
  public readonly name: string

  /**
   * The room's id in the rooms pack
   */
  public readonly defId: number

  /**
   * Land 0, ocean 1 or both 2
   */
  public readonly enviroType: number

  /**
   * The room's name in English
   */
  public readonly displayName: string

  /**
   * The room's name string id
   */
  public readonly nameId: number

  /**
   * The name a join sends
   */
  public readonly sentName: string

  /**
   * How many players one instance holds
   */
  public readonly capacity: number

  /**
   * Whether the room has one instance only
   */
  public readonly single: boolean

  /**
   * Whether the room is a minigame
   */
  public readonly game: boolean

  /**
   * Creates a template
   * @param options The room definition
   */
  public constructor(options: RoomTemplateOptions) {
    this.name = options.name
    this.defId = options.defId ?? 0
    this.enviroType = options.enviroType ?? 0
    this.displayName = options.displayName ?? options.name
    this.nameId = options.nameId ?? 0
    this.sentName = options.sentName ?? this.displayName
    this.capacity = options.capacity ?? ROOM_CAPACITY
    this.single = options.single ?? false
    this.game = options.game ?? false
    this.den = options.den ?? null
    this.party = options.party ?? null
  }
}
