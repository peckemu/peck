import { AchievementDefinition } from '#database/entities/definitions/achievement'
import { AvatarDefinition } from '#database/entities/definitions/avatar'
import { DenItemDefinition } from '#database/entities/definitions/den-item'
import { DenRoomDefinition } from '#database/entities/definitions/den-room'
import { DiamondDefinition } from '#database/entities/definitions/diamond'
import { ExchangeDefinition } from '#database/entities/definitions/exchange'
import { ItemDefinition } from '#database/entities/definitions/item'
import { GenericListDefinition } from '#database/entities/definitions/list'
import { PartyDefinition } from '#database/entities/definitions/party'
import { PetDefinition } from '#database/entities/definitions/pet'
import { GenericListContent } from '#database/entities/definitions/list-content'
import { RoomDefinition } from '#database/entities/definitions/room'
import { PartySchedule } from '#database/entities/party/schedule'
import { type Database } from '#database/pool'

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
