import { inject } from '@needle-di/core'
import { DenRepository, PetRepository } from '@peck/database'
import {
  DenItemCatalogue,
  type OwnedDenItem,
  type Pet,
  type Player,
  RoomManager,
} from '@peck/game'
import {
  DenStateOutgoing,
  DenStateSavedOutgoing,
  DenStateSaveIncoming,
} from '@peck/packets'
import { Handler, PacketHandler } from '@peck/plugins'
import { InventoryLimit } from '@peck/shared'

import { type HandlerContext } from '#emulator/dispatch/context'
import { SessionManager } from '#emulator/sessions/manager'

/**
 * The fields per change
 */
const CHANGE_FIELDS = 17

/**
 * A pet is changed
 */
const PET = 1

/**
 * The furthest an item may stand
 */
const FARTHEST = 100_000

/**
 * The longest den door link
 */
const LONGEST_LINK = 60

/**
 * The empty den door link
 */
const NO_LINK = 'off'

/**
 * One change from the den editor
 */
type DenChange = {
  /**
   * Den item 0 or pet 1
   */
  readonly refId: number

  /**
   * Its place in the den items
   */
  readonly invIdx: number

  /**
   * Whether it is placed
   */
  readonly placed: boolean

  /**
   * Where it stands across
   */
  readonly x: number

  /**
   * Where it stands down
   */
  readonly y: number

  /**
   * Whether it is flipped
   */
  readonly flipped: boolean

  /**
   * How a pet is flipped
   */
  readonly flips: number

  /**
   * The den door's owner
   */
  readonly userNameLink: string
}

/**
 * Saves the player's den item places
 * @class
 */
@Handler(DenStateSaveIncoming)
export class DenStateSaveHandler extends PacketHandler<DenStateSaveIncoming> {
  /**
   * Every den item
   */
  private readonly denItems = inject<DenItemCatalogue>(DenItemCatalogue)

  /**
   * Saves dens
   */
  private readonly dens = inject<DenRepository>(DenRepository)

  /**
   * Saves pets
   */
  private readonly pets = inject<PetRepository>(PetRepository)

  /**
   * Every room and its instances
   */
  private readonly rooms = inject<RoomManager>(RoomManager)

  /**
   * Every open session
   */
  private readonly sessions = inject<SessionManager>(SessionManager)

  /**
   * Applies den item changes
   * @param packet The packet
   * @param context The packet context
   */
  public async handle(
    packet: DenStateSaveIncoming,
    context: HandlerContext,
  ): Promise<void> {
    const { player, session } = context

    const changes = DenStateSaveHandler.read(packet.count, packet.changes)
    const saved = DenStateSaveHandler.place(player, changes)
    const pets = DenStateSaveHandler.placePets(player, changes)

    await session.send<DenStateSavedOutgoing>(
      DenStateSavedOutgoing.of(
        packet.room,
        saved.map(({ invIdx }) => invIdx),
      ),
    )

    if (saved.length === 0 && pets.length === 0) return

    await this.dens.save(player.gameId, saved)
    await this.pets.place(
      player.gameId,
      pets.map((pet) => ({
        invIdx: pet.invId,
        categoryId: pet.denCategoryId,
        x: pet.denX,
        y: pet.denY,
        flipped: pet.denFlipped,
      })),
    )
    await this.show(player, saved, pets)
  }

  /**
   * Shows den changes
   * @param player The player
   * @param saved The items saved
   * @param pets The pets moved
   */
  private async show(
    player: Player,
    saved: readonly OwnedDenItem[],
    pets: readonly Pet[],
  ): Promise<void> {
    const den = this.rooms.instancesOf(`den${player.username}`)[0]
    if (!den) return

    const items = saved.map((item) => ({
      ...item,
      mannequin: this.denItems.isMannequin(item.defId),
    }))
    const owner = this.sessions.byPlayer(player.gameId) ?? undefined

    await this.sessions.broadcast<DenStateOutgoing>(
      den.id,
      DenStateOutgoing.of(den.id, items, pets),
      owner,
    )
  }

  /**
   * Reads the changes
   * @param count The count
   * @param fields Their fields
   * @returns The changes
   */
  private static read(count: number, fields: readonly string[]): DenChange[] {
    const most = Math.min(count, Math.floor(fields.length / CHANGE_FIELDS))

    return Array.from({ length: Math.max(most, 0) }, (_, index) => {
      const at = index * CHANGE_FIELDS
      const number = (offset: number): number =>
        Math.trunc(Number(fields[at + offset])) || 0
      const link = fields[at + 6] ?? ''

      return {
        refId: number(0),
        invIdx: number(1),
        placed: fields[at + 2] !== '0',
        x: DenStateSaveHandler.within(number(3)),
        y: DenStateSaveHandler.within(number(4)),
        flipped: number(5) !== 0,
        flips: number(5) & 3,
        userNameLink: link === NO_LINK ? '' : link.slice(0, LONGEST_LINK),
      }
    })
  }

  /**
   * Applies the changes to the player's den items
   * @param player The player
   * @param changes The changes
   * @returns The items saved
   */
  private static place(
    player: Player,
    changes: readonly DenChange[],
  ): OwnedDenItem[] {
    let placedCount = player.denItems.filter(
      ({ categoryId }) => categoryId !== 0,
    ).length
    const saved = new Map<number, OwnedDenItem>()

    for (const change of changes) {
      if (change.refId === PET) continue

      const index = player.denItems.findIndex(
        ({ invIdx }) => invIdx === change.invIdx,
      )
      const item = player.denItems[index]
      if (!item) continue

      const wasPlaced = item.categoryId !== 0
      if (change.placed && !wasPlaced) {
        if (placedCount >= InventoryLimit.PlacedDenItems) continue
        placedCount++
      } else if (!change.placed && wasPlaced) {
        placedCount--
      }

      const next: OwnedDenItem = {
        ...item,
        categoryId: change.placed ? item.categoryId || 1 : 0,
        x: change.placed ? change.x : 0,
        y: change.placed ? change.y : 0,
        flipped: change.placed && change.flipped,
        userNameLink: change.userNameLink,
      }

      player.denItems[index] = next
      saved.set(next.invIdx, next)
    }

    return [...saved.values()]
  }

  /**
   * Applies the changes to the player's pets
   * @param player The player
   * @param changes The changes
   * @returns The pets moved
   */
  private static placePets(
    player: Player,
    changes: readonly DenChange[],
  ): Pet[] {
    const moved = new Map<number, Pet>()

    for (const change of changes) {
      const pet = change.refId === PET ? player.pets.get(change.invIdx) : null
      if (!pet) continue

      pet.denCategoryId = change.placed ? 1 : 0
      pet.denX = change.placed ? change.x : 0
      pet.denY = change.placed ? change.y : 0
      pet.denFlipped = change.placed ? change.flips : 0

      moved.set(pet.invId, pet)
    }

    return [...moved.values()]
  }

  /**
   * Keeps a position inside the den
   * @param value The position
   * @returns The clamped position
   */
  private static within(value: number): number {
    return Math.max(-FARTHEST, Math.min(FARTHEST, value))
  }
}
