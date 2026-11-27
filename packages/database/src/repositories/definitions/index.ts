import { AchievementDefinition } from '../../entities/definitions/achievement/index.ts'
import { AvatarDefinition } from '../../entities/definitions/avatar/index.ts'
import { DenItemDefinition } from '../../entities/definitions/den-item/index.ts'
import { DenRoomDefinition } from '../../entities/definitions/den-room/index.ts'
import { DiamondDefinition } from '../../entities/definitions/diamond/index.ts'
import { ExchangeDefinition } from '../../entities/definitions/exchange/index.ts'
import { ItemDefinition } from '../../entities/definitions/item/index.ts'
import { GenericListDefinition } from '../../entities/definitions/list/index.ts'
import { PartyDefinition } from '../../entities/definitions/party/index.ts'
import { PetDefinition } from '../../entities/definitions/pet/index.ts'
import { GenericListContent } from '../../entities/definitions/list-content/index.ts'
import { RoomDefinition } from '../../entities/definitions/room/index.ts'
import { WorldItemDefinition } from '../../entities/definitions/world/index.ts'
import { PartySchedule } from '../../entities/party/schedule/index.ts'
import { type Database } from '../../pool/index.ts'

/**
 * Reads the game's definitions
 * @class
 */
export class DefinitionRepository {
  /**
   * The database
   */
  private readonly database: Database

  /**
   * Creates the repository
   * @param database The database
   */
  public constructor(database: Database) {
    this.database = database
  }

  /**
   * Lists every room
   * @returns The rooms
   */
  public async rooms(): Promise<RoomDefinition[]> {
    return this.database.findMany(RoomDefinition, { $sort: { defId: 'asc' } })
  }

  /**
   * Lists every clothing item
   * @returns The items
   */
  public async items(): Promise<ItemDefinition[]> {
    return this.database.findMany(ItemDefinition, { $sort: { defId: 'asc' } })
  }

  /**
   * Lists every animal
   * @returns The animals
   */
  public async avatars(): Promise<AvatarDefinition[]> {
    return this.database.findMany(AvatarDefinition, { $sort: { defId: 'asc' } })
  }

  /**
   * Lists every den item
   * @returns The den items
   */
  public async denItems(): Promise<DenItemDefinition[]> {
    return this.database.findMany(DenItemDefinition, {
      $sort: { defId: 'asc' },
    })
  }

  /**
   * Lists every den
   * @returns The dens
   */
  public async denRooms(): Promise<DenRoomDefinition[]> {
    return this.database.findMany(DenRoomDefinition, {
      $sort: { defId: 'asc' },
    })
  }

  /**
   * Lists every diamond shop entry
   * @returns The entries
   */
  public async diamonds(): Promise<DiamondDefinition[]> {
    return this.database.findMany(DiamondDefinition, {
      $sort: { defId: 'asc' },
    })
  }

  /**
   * Lists every currency exchange
   * @returns The exchanges
   */
  public async exchanges(): Promise<ExchangeDefinition[]> {
    return this.database.findMany(ExchangeDefinition, {
      $sort: { defId: 'asc' },
    })
  }

  /**
   * Lists every world item
   * @returns The world items
   */
  public async worldItems(): Promise<WorldItemDefinition[]> {
    return this.database.findMany(WorldItemDefinition, {
      $sort: { defId: 'asc' },
    })
  }

  /**
   * Lists every achievement
   * @returns The achievements
   */
  public async achievements(): Promise<AchievementDefinition[]> {
    return this.database.findMany(AchievementDefinition, {
      $sort: { defId: 'asc' },
    })
  }

  /**
   * Lists every party
   * @returns The parties
   */
  public async parties(): Promise<PartyDefinition[]> {
    return this.database.findMany(PartyDefinition, { $sort: { defId: 'asc' } })
  }

  /**
   * Lists the party times
   * @returns The schedule
   */
  public async schedule(): Promise<PartySchedule[]> {
    return this.database.findMany(PartySchedule, { $sort: { id: 'asc' } })
  }

  /**
   * Lists what the generic lists hold
   * @returns The lists
   */
  public async listContents(): Promise<GenericListContent[]> {
    return this.database.findMany(GenericListContent, {
      $sort: { listId: 'asc' },
    })
  }

  /**
   * Lists every pet
   * @returns The pets
   */
  public async pets(): Promise<PetDefinition[]> {
    return this.database.findMany(PetDefinition, { $sort: { defId: 'asc' } })
  }

  /**
   * Lists every generic list
   * @returns The lists
   */
  public async lists(): Promise<GenericListDefinition[]> {
    return this.database.findMany(GenericListDefinition, {
      $sort: { defId: 'asc' },
    })
  }
}
