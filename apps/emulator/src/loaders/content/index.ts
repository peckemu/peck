import { inject, injectable } from '@needle-di/core'
import {
  DefinitionRepository,
  MinigameRepository,
  ShopRepository,
} from '@peck/database'
import {
  AchievementCatalogue,
  AvatarCatalogue,
  type Catalogue,
  type Defined,
  DenItemCatalogue,
  DenRoomCatalogue,
  DiamondCatalogue,
  ExchangeCatalogue,
  GenericListCatalogue,
  ItemCatalogue,
  MinigameCatalogue,
  PartyCalendar,
  PartyCatalogue,
  PetCatalogue,
  GenericListContents,
  RoomManager,
  ShopStock,
} from '@peck/game'
import { type Logger } from '@peck/logger'
import { ShopListType } from '@peck/shared'

import { Loader } from '#emulator/loaders/loader'
import { LoggerToken } from '#emulator/tokens'

/**
 * The retired den room status
 */
const RETIRED = 5

/**
 * Loads the rooms and catalogues
 * @class
 */
@injectable()
export class ContentLoader extends Loader {
  /**
   * Every room and its instances
   */
  private readonly rooms = inject<RoomManager>(RoomManager)

  /**
   * Every clothing item
   */
  private readonly items = inject<ItemCatalogue>(ItemCatalogue)

  /**
   * Every animal
   */
  private readonly avatars = inject<AvatarCatalogue>(AvatarCatalogue)

  /**
   * Every den item
   */
  private readonly denItems = inject<DenItemCatalogue>(DenItemCatalogue)

  /**
   * Every den
   */
  private readonly denRooms = inject<DenRoomCatalogue>(DenRoomCatalogue)

  /**
   * Every diamond shop entry
   */
  private readonly diamonds = inject<DiamondCatalogue>(DiamondCatalogue)

  /**
   * Every currency exchange
   */
  private readonly exchanges = inject<ExchangeCatalogue>(ExchangeCatalogue)

  /**
   * Every minigame
   */
  private readonly minigames = inject<MinigameCatalogue>(MinigameCatalogue)

  /**
   * Reads the minigames
   */
  private readonly games = inject<MinigameRepository>(MinigameRepository)

  /**
   * The generic list contents
   */
  private readonly contents = inject<GenericListContents>(GenericListContents)

  /**
   * Every party
   */
  private readonly parties = inject<PartyCatalogue>(PartyCatalogue)

  /**
   * When the parties are on
   */
  private readonly calendar = inject<PartyCalendar>(PartyCalendar)

  /**
   * Every achievement
   */
  private readonly achievements =
    inject<AchievementCatalogue>(AchievementCatalogue)

  /**
   * Every pet
   */
  private readonly pets = inject<PetCatalogue>(PetCatalogue)

  /**
   * Every generic list
   */
  private readonly lists = inject<GenericListCatalogue>(GenericListCatalogue)

  /**
   * The shop stock
   */
  private readonly stock = inject<ShopStock>(ShopStock)

  /**
   * Reads the shop stock
   */
  private readonly shops = inject<ShopRepository>(ShopRepository)

  /**
   * Reads the definitions
   */
  private readonly repository =
    inject<DefinitionRepository>(DefinitionRepository)

  /**
   * The emulator's logger
   */
  private readonly logger = inject<Logger>(LoggerToken)

  /**
   * Registers every room and definition
   */
  public async load(): Promise<void> {
    const [
      rooms,
      items,
      avatars,
      denItems,
      denRooms,
      diamonds,
      exchanges,
      pets,
      lists,
      stock,
      parties,
      schedule,
      games,
      contents,
      achievements,
    ] = await Promise.all([
      this.repository.rooms(),
      this.repository.items(),
      this.repository.avatars(),
      this.repository.denItems(),
      this.repository.denRooms(),
      this.repository.diamonds(),
      this.repository.exchanges(),
      this.repository.pets(),
      this.repository.lists(),
      this.shops.stock(),
      this.repository.parties(),
      this.repository.schedule(),
      this.games.definitions(),
      this.repository.listContents(),
      this.repository.achievements(),
    ])

    /**
     * @sxip Registers all the rooms, i think this is necessary for the emulator to know about them instead of just doing database lookups
     */
    for (const room of rooms) this.rooms.register(room)

    /**
     * @sxip Loads all the the content
     */
    ContentLoader.fill(this.items, items)
    ContentLoader.fill(this.avatars, avatars)
    ContentLoader.fill(this.denItems, denItems)
    ContentLoader.fill(this.denRooms, denRooms)
    ContentLoader.fill(this.diamonds, diamonds)
    ContentLoader.fill(this.exchanges, exchanges)
    ContentLoader.fill(this.parties, parties)
    this.calendar.load(schedule)
    ContentLoader.fill(this.minigames, games)
    ContentLoader.fill(this.pets, pets)
    ContentLoader.fill(this.lists, lists)
    ContentLoader.fill(this.achievements, achievements)

    for (const row of stock) this.stock.add(row.listId, row.listType, row.defId)
    this.stockContents(contents)
    this.stockDenRoomShops()

    this.logger.info(
      {
        rooms: rooms.length,
        items: items.length,
        avatars: avatars.length,
        denItems: denItems.length,
        denRooms: denRooms.length,
        diamonds: diamonds.length,
        exchanges: exchanges.length,
        pets: pets.length,
        lists: lists.length,
        stock: stock.length,
        parties: parties.length,
        schedule: schedule.length,
        minigames: games.length,
        contents: contents.length,
        achievements: achievements.length,
      },
      'content loaded',
    )
  }

  /**
   * Saves the lists and shops
   * @param lists The lists
   */
  private stockContents(
    lists: readonly {
      readonly listId: number
      readonly fields: readonly string[]
    }[],
  ): void {
    for (const { listId, fields } of lists) {
      this.contents.add(listId, fields)
      if (this.stock.shelf(listId)) continue

      for (const { listType, ids } of GenericListContents.shelves(fields)) {
        for (const id of ids) this.stock.add(listId, listType, id)
      }
    }
  }

  /**
   * Stocks the empty den room shops
   */
  private stockDenRoomShops(): void {
    const forSale = [...this.denRooms].filter(
      ({ status }) => status !== RETIRED,
    )

    for (const list of this.lists) {
      if (list.type !== ShopListType.DenRooms || this.stock.shelf(list.defId)) {
        continue
      }

      for (const room of forSale) {
        this.stock.add(list.defId, ShopListType.DenRooms, room.defId)
      }
    }
  }

  /**
   * Registers definitions in a catalogue
   * @param catalogue The catalogue
   * @param definitions The definitions
   */
  private static fill<T extends Defined>(
    catalogue: Catalogue<T>,
    definitions: readonly T[],
  ): void {
    for (const definition of definitions) catalogue.register(definition)
  }
}
