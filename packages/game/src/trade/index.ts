import { TradeKind } from '@peck/shared'

import { type DenItemCatalogue } from '#game/content/den-item'
import { type ItemCatalogue } from '#game/content/item'
import { Den, type OwnedDenItem } from '#game/den'
import { type Item } from '#game/item'
import { type Pet } from '#game/pet'
import { type Player } from '#game/player'

/**
 * The item types by trade kind
 */
const CLIENT_TYPE: Readonly<Record<number, number>> = {
  0: TradeKind.Clothing,
  1: TradeKind.DenItem,
  3: TradeKind.Pet,
}

/**
 * The trading interactions bit
 */
const CAN_TRADE = 2

/**
 * The most a player can offer
 */
const MOST_OFFERED = 20

/**
 * A tradeable thing
 */
export type TradeRef = {
  /**
   * Its kind
   */
  readonly kind: number

  /**
   * Its place in the inventory
   */
  readonly invIdx: number
}

/**
 * A player's trade list
 */
export type TradeContents = {
  /**
   * Clothing
   */
  readonly clothing: readonly Item[]

  /**
   * Den items
   */
  readonly denItems: readonly OwnedDenItem[]

  /**
   * Pets
   */
  readonly pets: readonly Pet[]
}

/**
 * A trade in progress
 */
export type Deal = {
  /**
   * The asker
   */
  readonly requester: number

  /**
   * The player asked
   */
  readonly owner: number

  /**
   * What the requester wants
   */
  readonly wanted: TradeRef

  /**
   * What the requester gives
   */
  readonly offered: readonly TradeRef[]

  /**
   * How far it has got
   */
  stage: 'offered' | 'accepted' | 'making'

  /**
   * The players who confirmed
   */
  readonly confirmed: Set<number>
}

/**
 * Why a trade can't be offered
 */
export type TradeRefusal = {
  /**
   * Why
   */
  readonly reason: 'busy' | 'elsewhere' | 'gone' | 'pet-in-use' | 'full'

  /**
   * Who it is about
   */
  readonly side: 'requester' | 'owner'
}

/**
 * The trades in progress
 * @class
 */
export class Trades {
  /**
   * The trades by player id
   */
  private readonly deals = new Map<number, Deal>()

  /**
   * The trading players
   */
  private readonly busy = new Set<number>()

  /**
   * Finds a player's trade
   * @param gameId The player
   * @returns The trade, or null
   */
  public of(gameId: number): Deal | null {
    return this.deals.get(gameId) ?? null
  }

  /**
   * Starts a trade
   * @param requester The player asking
   * @param owner The player asked
   * @param wanted The wanted thing
   * @param offered The offer
   * @returns The trade
   */
  public open(
    requester: number,
    owner: number,
    wanted: TradeRef,
    offered: readonly TradeRef[],
  ): Deal {
    const deal: Deal = {
      requester,
      owner,
      wanted,
      offered,
      stage: 'offered',
      confirmed: new Set(),
    }
    this.deals.set(requester, deal)
    this.deals.set(owner, deal)

    return deal
  }

  /**
   * Forgets a trade
   * @param deal The trade
   */
  public close(deal: Deal): void {
    this.deals.delete(deal.requester)
    this.deals.delete(deal.owner)
  }

  /**
   * Sends a player's trade window state
   * @param gameId The player
   * @param busy Whether they do
   */
  public setBusy(gameId: number, busy: boolean): void {
    if (busy) this.busy.add(gameId)
    else this.busy.delete(gameId)
  }

  /**
   * Checks a player is trading
   * @param gameId The player
   * @returns Whether they are
   */
  public engaged(gameId: number): boolean {
    return this.deals.has(gameId) || this.busy.has(gameId)
  }
}

/**
 * What can be traded
 * @class
 */
export class TradeRules {
  /**
   * Every clothing item
   */
  private readonly items: ItemCatalogue

  /**
   * Every den item
   */
  private readonly denItems: DenItemCatalogue

  /**
   * Creates the rules
   * @param items Every clothing item
   * @param denItems Every den item
   */
  public constructor(items: ItemCatalogue, denItems: DenItemCatalogue) {
    this.items = items
    this.denItems = denItems
  }

  /**
   * Finds why a trade can't be offered
   * @param requester The player asking
   * @param owner The player asked
   * @param wanted The wanted thing
   * @param offered The offer
   * @returns Why, or null
   */
  public refusal(
    requester: Player,
    owner: Player,
    wanted: TradeRef,
    offered: readonly TradeRef[] | null,
  ): TradeRefusal | null {
    const blocked =
      requester.buddies.blocks(owner.username) ||
      requester.buddies.blockedBy.has(owner.gameId)
    if (blocked) return { reason: 'busy', side: 'owner' }
    if ((requester.interactions & CAN_TRADE) === 0) {
      return { reason: 'busy', side: 'requester' }
    }
    if ((owner.interactions & CAN_TRADE) === 0) {
      return { reason: 'busy', side: 'owner' }
    }

    const [here, there] = [requester.room, owner.room]
    if (
      here &&
      here.template === there?.template &&
      here.number !== there.number
    ) {
      return { reason: 'elsewhere', side: 'owner' }
    }

    const listed = owner.tradeList.some((ref) => TradeRules.same(ref, wanted))
    if (!listed || !TradeRules.tradeable(owner, wanted)) {
      return { reason: 'gone', side: 'owner' }
    }
    if (TradeRules.inUse(owner, wanted)) {
      return { reason: 'pet-in-use', side: 'owner' }
    }

    if (!offered?.every((ref) => TradeRules.tradeable(requester, ref))) {
      return { reason: 'gone', side: 'requester' }
    }
    if (offered.some((ref) => TradeRules.inUse(requester, ref))) {
      return { reason: 'pet-in-use', side: 'requester' }
    }

    if (!TradeRules.fits(requester, [wanted], offered)) {
      return { reason: 'full', side: 'requester' }
    }
    if (!TradeRules.fits(owner, offered, [wanted])) {
      return { reason: 'full', side: 'owner' }
    }

    return null
  }

  /**
   * Works out the item lookup
   * @param owner The player asked
   * @param wanted The wanted thing
   * @returns The kind
   */
  public wantedKind(owner: Player, wanted: TradeRef): number {
    const world = (enviroType: number): number =>
      enviroType === 1 ? 1 : enviroType === 3 ? 2 : 0

    if (wanted.kind === TradeKind.Clothing) {
      const item = owner.items.get(wanted.invIdx)
      return world(item ? (this.items.get(item.defId)?.enviroType ?? 0) : 0)
    }

    if (wanted.kind === TradeKind.DenItem) {
      const item = owner.denItems.find(({ invIdx }) => invIdx === wanted.invIdx)
      return (
        3 + world(item ? (this.denItems.get(item.defId)?.enviroType ?? 0) : 0)
      )
    }

    return 6
  }

  /**
   * Lists the things named
   * @param player The owner
   * @param refs What to list
   * @returns The things
   */
  public static contents(
    player: Player,
    refs: readonly TradeRef[] = player.tradeList,
  ): TradeContents {
    const of = (kind: number): number[] =>
      refs.filter((ref) => ref.kind === kind).map(({ invIdx }) => invIdx)

    return {
      clothing: of(TradeKind.Clothing).flatMap((invId) => {
        const item = player.items.get(invId)
        return item ? [item] : []
      }),
      denItems: of(TradeKind.DenItem).flatMap((invIdx) => {
        const item = player.denItems.find((each) => each.invIdx === invIdx)
        return item ? [item] : []
      }),
      pets: of(TradeKind.Pet).flatMap((invIdx) => {
        const pet = player.pets.get(invIdx)
        return pet ? [pet] : []
      }),
    }
  }

  /**
   * Reads the request
   * @param type The client's item type
   * @param invIdx Its place in the inventory
   * @returns The ref
   */
  public static wanted(type: number, invIdx: number): TradeRef {
    return { kind: CLIENT_TYPE[type] ?? -1, invIdx }
  }

  /**
   * Reads a trade list change
   * @param body The counts and places
   * @returns What comes off and what goes on
   */
  public static readChange(body: readonly number[]): [TradeRef[], TradeRef[]] {
    const read = (at: number): [TradeRef[], number] => {
      const count = Math.max(body[at] ?? 0, 0)
      const refs = Array.from({ length: count }, (_, index) => ({
        kind: CLIENT_TYPE[body[at + 1 + index * 2] ?? -1] ?? -1,
        invIdx: body[at + 2 + index * 2] ?? 0,
      }))

      return [refs.filter(({ kind }) => kind >= 0), at + 1 + count * 2]
    }

    const [removed, next] = read(0)
    const [added] = read(next)

    return [removed, added]
  }

  /**
   * Reads the offer
   * @param fields The fields
   * @returns The offer, or null
   */
  public static readOffer(fields: readonly string[]): TradeRef[] | null {
    const numbers = fields.map(Number)
    if (!numbers.every(Number.isSafeInteger)) return null

    const [clothing = 0, den = 0, audio = 0, pets = 0] = numbers
    const places = numbers.slice(4)
    if (places.length !== clothing + den + audio + pets) return null

    const offered = [
      ...places
        .slice(0, clothing)
        .map((invIdx) => ({ kind: TradeKind.Clothing, invIdx })),
      ...places
        .slice(clothing, clothing + den + audio)
        .map((invIdx) => ({ kind: TradeKind.DenItem, invIdx })),
      ...places
        .slice(clothing + den + audio)
        .map((invIdx) => ({ kind: TradeKind.Pet, invIdx })),
    ]

    const unique = new Set(
      offered.map(({ kind, invIdx }) => `${String(kind)}:${String(invIdx)}`),
    )
    const valid =
      offered.length >= 1 &&
      offered.length <= MOST_OFFERED &&
      unique.size === offered.length

    return valid ? offered : null
  }

  /**
   * Checks two refs name the same thing
   * @param one One ref
   * @param other The other
   * @returns Whether they do
   */
  public static same(one: TradeRef, other: TradeRef): boolean {
    return one.kind === other.kind && one.invIdx === other.invIdx
  }

  /**
   * Checks something can be traded
   * @param player The owner
   * @param ref What it is
   * @returns Whether it can
   */
  private static tradeable(player: Player, ref: TradeRef): boolean {
    if (ref.kind === TradeKind.Clothing) {
      return player.items.get(ref.invIdx)?.denStoreInvIdx === 0
    }
    if (ref.kind === TradeKind.Pet) {
      return player.pets.get(ref.invIdx)?.denStoreInvIdx === 0
    }
    if (ref.kind !== TradeKind.DenItem) return false

    const item = player.denItems.find(({ invIdx }) => invIdx === ref.invIdx)

    return item?.denStoreInvIdx === 0 && !Den.unapproved(item)
  }

  /**
   * Checks a pet is out with its owner
   * @param player The owner
   * @param ref What it is
   * @returns Whether it is
   */
  private static inUse(player: Player, ref: TradeRef): boolean {
    const { avatar } = player
    if (ref.kind !== TradeKind.Pet || !avatar) return false

    return (
      avatar.landPetInvIdx === ref.invIdx ||
      avatar.oceanPetInvIdx === ref.invIdx
    )
  }

  /**
   * Checks a player has room
   * @param player The player
   * @param coming What they get
   * @param going What they give
   * @returns Whether they do
   */
  private static fits(
    player: Player,
    coming: readonly TradeRef[],
    going: readonly TradeRef[],
  ): boolean {
    const count = (refs: readonly TradeRef[], kind: number): number =>
      refs.filter((ref) => ref.kind === kind).length

    const held = [
      [TradeKind.Clothing, player.items.size, player.clothingLimit],
      [TradeKind.DenItem, player.denItems.length, player.denItemLimit],
      [TradeKind.Pet, player.pets.size, player.petLimit],
    ] as const

    return held.every(([kind, has, most]) => {
      const gets = count(coming, kind)
      return gets === 0 || has - count(going, kind) + gets <= most
    })
  }
}
