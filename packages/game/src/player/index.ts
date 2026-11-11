import {
  AccountType,
  CURRENCIES,
  type Currency,
  InventoryLimit,
  PendingFlag,
  UserVar,
  type Point,
} from '@peck/shared'

import { Avatar, type AvatarOptions } from '#game/avatar'
import { Buddies } from '#game/buddies'
import { Den, type OwnedDenItem, type OwnedDenRoom } from '#game/den'
import { Inventory } from '#game/inventory'
import { Item, type ItemOptions } from '#game/item'
import { Pet, type PetOptions } from '#game/pet'
import { type Room } from '#game/room'
import { Wallet } from '#game/wallet'

/**
 * A user variable
 */
export type UserVariable = {
  /**
   * The variable's id
   */
  readonly varId: number

  /**
   * The kind of value
   */
  readonly type: number

  /**
   * The value
   */
  readonly value: number
}

/**
 * A player's details
 */
export type PlayerOptions = Partial<Readonly<Record<Currency, number>>> & {
  /**
   * Their name
   */
  readonly username: string

  /**
   * Their id in the database
   */
  readonly gameId?: number

  /**
   * Their account
   */
  readonly accountId?: string

  /**
   * Their public id
   */
  readonly uuid?: string

  /**
   * The kind of account
   */
  readonly accountType?: AccountType

  /**
   * The chat they may use
   */
  readonly chatType?: number

  /**
   * Their interactions
   */
  readonly interactions?: number

  /**
   * Their pending notices
   */
  readonly pendingFlags?: number

  /**
   * Which avatar slots they can use
   */
  readonly avatarSlotFlags?: number

  /**
   * Their avatars
   */
  readonly avatars?: readonly (AvatarOptions & { readonly active?: boolean })[]

  /**
   * Their items
   */
  readonly items?: readonly ItemOptions[]

  /**
   * Who may visit their den
   */
  readonly denPrivacy?: number

  /**
   * Who may send them jam-a-grams
   */
  readonly ecardPrivacy?: number

  /**
   * Who may post on their wall
   */
  readonly wallSettings?: number

  /**
   * Their name bar
   */
  readonly nameBarData?: number

  /**
   * Whether their wall is open
   */
  readonly wallStatus?: number

  /**
   * The index of the den they use
   */
  readonly activeDenInvIdx?: number

  /**
   * The unlocked pets
   */
  readonly unlockedPets?: string

  /**
   * Their user variables
   */
  readonly variables?: readonly UserVariable[]

  /**
   * Their achievements
   */
  readonly achievements?: readonly { readonly defId: number }[]

  /**
   * The newspapers seen
   */
  readonly newspapersSeen?: readonly {
    readonly defId: number
    readonly seenTs: number
  }[]

  /**
   * Their pets
   */
  readonly pets?: readonly PetOptions[]

  /**
   * Their trade list
   */
  readonly tradeList?: readonly {
    readonly itemKind: number
    readonly invIdx: number
  }[]

  /**
   * Their den rooms
   */
  readonly denRooms?: readonly OwnedDenRoom[]

  /**
   * Their den items
   */
  readonly denItems?: readonly OwnedDenItem[]
}

/**
 * A logged in player
 * @class
 */
export class Player {
  /**
   * The player's SmartFox user id
   */
  public readonly id: number

  /**
   * Their login username
   */
  public readonly username: string

  /**
   * Their id in the database
   */
  public readonly gameId: number

  /**
   * Their account uuid
   */
  public readonly uuid: string

  /**
   * Their account
   */
  public readonly accountId: string

  /**
   * Their account type
   */
  public accountType: AccountType

  /**
   * The chat they may use
   */
  public chatType: number

  /**
   * Their interactions
   */
  public interactions: number

  /**
   * Their pending notices
   */
  public pendingFlags: number

  /**
   * Which avatar slots they can use
   */
  public avatarSlotFlags: number

  /**
   * Who may visit their den
   */
  public denPrivacy: number

  /**
   * Who may send them jam-a-grams
   */
  public ecardPrivacy: number

  /**
   * Who may post on their wall
   */
  public wallSettings: number

  /**
   * Their name bar
   */
  public nameBarData: number

  /**
   * Whether their wall is open
   */
  public wallStatus: number

  /**
   * The index of the den they use
   */
  public activeDenInvIdx: number

  /**
   * The unlocked pets
   */
  public unlockedPets: string

  /**
   * Their user variables by id
   */
  public readonly variables: Map<number, UserVariable>

  /**
   * Their achievement ids
   */
  public readonly achievements: Set<number>

  /**
   * The newspaper page open times
   */
  public readonly newspapersSeen: Map<number, number>

  /**
   * Their avatars
   */
  public readonly avatars = new Inventory<Avatar>()

  /**
   * Their avatar
   */
  public avatar: Avatar | null = null

  /**
   * Whether they are visible
   */
  public shown = false

  /**
   * Whether they moderate
   */
  public moderator = false

  /**
   * Whether they are hidden from rooms
   */
  public invisible = false

  /**
   * The two player game they host, or null
   */
  public hostedGame: number | null = null

  /**
   * When their mute ends
   */
  public mutedUntil = 0

  /**
   * Their clothing and other items
   */
  public readonly items = new Inventory<Item>()

  /**
   * Their pets
   */
  public readonly pets = new Inventory<Pet>()

  /**
   * Their den
   */
  public readonly den = new Den()

  /**
   * Their trade list
   */
  public tradeList: { readonly kind: number; readonly invIdx: number }[]

  /**
   * Their den rooms
   */
  public readonly denRooms: OwnedDenRoom[]

  /**
   * Their den items
   */
  public readonly denItems: OwnedDenItem[]

  /**
   * Their currencies
   */
  public readonly wallet: Wallet

  /**
   * Their buddies
   */
  public readonly buddies = new Buddies()

  /**
   * Their room
   */
  public room: Room | null = null

  /**
   * Where their avatar stands
   */
  public position: Point = { x: 0, y: 0 }

  /**
   * Their avatar's idle animation
   */
  public animation = 0

  /**
   * Creates a player
   * @param id Their SmartFox user id
   * @param options The player's details
   */
  public constructor(id: number, options: PlayerOptions) {
    this.id = id
    this.username = options.username
    this.gameId = options.gameId ?? id
    this.uuid = options.uuid ?? ''
    this.accountId = options.accountId ?? ''
    this.accountType = options.accountType ?? AccountType.NonMember
    this.chatType = options.chatType ?? 1
    this.interactions = options.interactions ?? 1023
    this.pendingFlags = options.pendingFlags ?? 0
    this.avatarSlotFlags = options.avatarSlotFlags ?? 0

    for (const row of options.items ?? []) this.items.add(new Item(row))
    for (const row of options.pets ?? []) this.pets.add(new Pet(row))

    for (const row of options.avatars ?? []) {
      const avatar = this.avatars.add(new Avatar(row))
      if (row.active) this.avatar = avatar
    }
    this.denPrivacy = options.denPrivacy ?? 0
    this.ecardPrivacy = options.ecardPrivacy ?? 1
    this.wallSettings = options.wallSettings ?? 1
    this.nameBarData = options.nameBarData ?? 0
    this.wallStatus = options.wallStatus ?? 1
    this.activeDenInvIdx = options.activeDenInvIdx ?? 0
    this.unlockedPets = options.unlockedPets ?? '0'
    this.wallet = new Wallet(
      Object.fromEntries(
        CURRENCIES.map((currency) => [currency, options[currency] ?? 0]),
      ),
    )
    this.variables = new Map(
      options.variables?.map((variable) => [variable.varId, variable]),
    )
    this.achievements = new Set(options.achievements?.map(({ defId }) => defId))
    this.tradeList = (options.tradeList ?? []).map(({ itemKind, invIdx }) => ({
      kind: itemKind,
      invIdx,
    }))
    this.denRooms = (options.denRooms ?? []).map(({ invIdx, defId }) => ({
      invIdx,
      defId,
    }))
    this.denItems = (options.denItems ?? []).map(
      ({
        invIdx,
        defId,
        categoryId,
        version,
        x,
        y,
        flipped,
        userNameLink,
        denStoreInvIdx,
        ecoConsumerState,
        uniqueImageId,
        masterpiece,
      }) => ({
        invIdx,
        defId,
        categoryId,
        version,
        x,
        y,
        flipped,
        userNameLink,
        denStoreInvIdx,
        ecoConsumerState,
        uniqueImageId,
        masterpiece,
      }),
    )
    this.newspapersSeen = new Map(
      options.newspapersSeen?.map(({ defId, seenTs }) => [defId, seenTs]),
    )
  }

  /**
   * Checks they are muted
   * @param now The time
   * @returns Whether they are
   */
  public muted(now = Date.now()): boolean {
    return this.mutedUntil > now
  }

  /**
   * Their room id, or -1
   */
  public get roomId(): number {
    return this.room?.id ?? -1
  }

  /**
   * Their pet
   * @param ocean Whether in the ocean
   * @returns The pet, or null
   */
  public petOut(ocean: boolean): Pet | null {
    const invIdx = ocean
      ? this.avatar?.oceanPetInvIdx
      : this.avatar?.landPetInvIdx

    return invIdx ? this.pets.get(invIdx) : null
  }

  /**
   * The pets placed in their den
   */
  public get placedPets(): Pet[] {
    return [...this.pets].filter(({ denCategoryId }) => denCategoryId !== 0)
  }

  /**
   * How many pets they can have
   */
  public get petLimit(): number {
    return Math.max(
      this.variables.get(UserVar.PetInventoryMax)?.value ?? 0,
      InventoryLimit.Pets,
    )
  }

  /**
   * How many buddies they can have
   */
  public get buddyLimit(): number {
    return this.member || this.extendedStorage
      ? InventoryLimit.MemberBuddies
      : InventoryLimit.Buddies
  }

  /**
   * How much clothing they can own
   */
  public get clothingLimit(): number {
    return this.extendedStorage
      ? InventoryLimit.ExtendedClothing
      : InventoryLimit.Clothing
  }

  /**
   * How many den items they can own
   */
  public get denItemLimit(): number {
    return this.extendedStorage
      ? InventoryLimit.ExtendedDenItems
      : InventoryLimit.DenItems
  }

  /**
   * Whether they have extended storage
   */
  public get extendedStorage(): boolean {
    return (this.pendingFlags & PendingFlag.ExtendedStorage) !== 0
  }

  /**
   * Whether they are a member
   */
  public get member(): boolean {
    return this.accountType >= AccountType.Member
  }

  /**
   * Moves their avatar along a path
   * @param path The points walked
   * @param animation The idle animation at the end
   */
  public move(path: readonly Point[], animation: number): void {
    const last = path.at(-1)
    if (last) this.position = { x: last.x, y: last.y }
    this.animation = animation
  }

  /**
   * Finds an avatar's pet
   * @param avatar The avatar
   * @returns The pet, or null
   */
  public petWith(avatar: Avatar): Pet | null {
    const ocean = this.room?.template.enviroType === 1

    return this.pets.get(ocean ? avatar.oceanPetInvIdx : avatar.landPetInvIdx)
  }

  /**
   * Finds one of their avatars
   * @param perUserAvId Its id among their avatars
   * @returns The avatar, or null
   */
  public findAvatar(perUserAvId: number): Avatar | null {
    for (const avatar of this.avatars) {
      if (avatar.perUserId === perUserAvId) return avatar
    }

    return null
  }

  /**
   * Lists an avatar's worn items
   * @param avatar The avatar
   * @returns The items worn
   */
  public worn(avatar: Avatar): Item[] {
    return [...this.items].filter((item) => avatar.wears(item))
  }

  /**
   * Switches to one of their avatars
   * @param invId The avatar's inventory id
   * @returns The avatar
   */
  public play(invId: number): Avatar {
    this.avatar = this.avatars.require(invId)
    return this.avatar
  }
}
