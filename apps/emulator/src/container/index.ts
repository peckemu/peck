import { Container, inject } from '@needle-di/core'
import {
  ClusterEvents,
  type ClusterStore,
  NodeRegistry,
  Presence,
  RedisStore,
  TicketStore,
  UploadTokens,
  WallTokens,
} from '@peck/cluster'
import {
  AccessRepository,
  AccountRepository,
  AchievementRepository,
  AuditRepository,
  AvatarRepository,
  BuddyRepository,
  type Database,
  DefinitionRepository,
  DenRepository,
  DenShopRepository,
  EcoRepository,
  JamagramRepository,
  LikeRepository,
  MasterpieceRepository,
  MinigameRepository,
  ModerationRepository,
  PetRepository,
  PlayerRepository,
  ShopRepository,
  SpinRepository,
  TradeRepository,
  WallRepository,
} from '@peck/database'
import {
  AchievementCatalogue,
  AvatarCatalogue,
  AvatarRules,
  DailySpin,
  DenItemCatalogue,
  DenRoomCatalogue,
  DiamondCatalogue,
  ExchangeCatalogue,
  EcoRules,
  GenericListCatalogue,
  HostedParties,
  ItemCatalogue,
  MinigameCatalogue,
  Minigames,
  PartyCalendar,
  PartyCatalogue,
  PetCatalogue,
  PetRules,
  GenericListContents,
  Prices,
  RoomManager,
  ShopStock,
  TradeRules,
  Trades,
} from '@peck/game'
import { HandlerRegistry, PluginEvents, PluginHost } from '@peck/plugins'
import { type RedisClient } from '@peck/redis'
import { createLogger, type Logger } from '@peck/logger'

import { type Config } from '#emulator/config'
import { HANDLERS } from '#emulator/handlers'
import {
  ClusterStoreToken,
  ConfigToken,
  DatabaseToken,
  LoggerToken,
  RedisToken,
} from '#emulator/tokens'

/**
 * Container options
 */
export type ContainerOptions = {
  /**
   * The emulator config
   */
  readonly config: Config

  /**
   * The connected database
   */
  readonly database: Database

  /**
   * The connected Redis client
   */
  readonly redis: RedisClient

  /**
   * The logger
   */
  readonly logger?: Logger

  /**
   * The handlers
   */
  readonly handlers?: HandlerRegistry

  /**
   * The plugins
   */
  readonly plugins?: PluginHost

  /**
   * The cluster store
   */
  readonly store?: ClusterStore
}

/**
 * Builds the container
 * @param options The container options
 * @returns The container
 */
export const createContainer = (options: ContainerOptions): Container => {
  const plugins = options.plugins ?? new PluginHost()
  const logger = options.logger ?? createLogger(options.config)
  const store = options.store ?? new RedisStore(options.redis)
  return new Container().bindAll(
    { provide: ConfigToken, useValue: options.config },
    { provide: DatabaseToken, useValue: options.database },
    { provide: RedisToken, useValue: options.redis },
    { provide: LoggerToken, useValue: logger },
    { provide: PluginHost, useValue: plugins },
    { provide: PluginEvents, useValue: new PluginEvents(logger) },
    {
      provide: HandlerRegistry,
      useValue:
        options.handlers ??
        HandlerRegistry.of([...HANDLERS, ...plugins.handlers]),
    },
    { provide: RoomManager, useFactory: () => new RoomManager() },
    { provide: NodeRegistry, useValue: new NodeRegistry(store) },
    { provide: TicketStore, useValue: new TicketStore(store) },
    { provide: UploadTokens, useValue: new UploadTokens(store) },
    { provide: WallTokens, useValue: new WallTokens(store) },
    { provide: Presence, useValue: new Presence(store) },
    { provide: ClusterEvents, useValue: new ClusterEvents(store) },
    { provide: ClusterStoreToken, useValue: store },
    { provide: ItemCatalogue, useFactory: () => new ItemCatalogue() },
    { provide: AvatarCatalogue, useFactory: () => new AvatarCatalogue() },
    { provide: DenItemCatalogue, useFactory: () => new DenItemCatalogue() },
    { provide: DenRoomCatalogue, useFactory: () => new DenRoomCatalogue() },
    { provide: DiamondCatalogue, useFactory: () => new DiamondCatalogue() },
    { provide: ExchangeCatalogue, useFactory: () => new ExchangeCatalogue() },
    { provide: PetCatalogue, useFactory: () => new PetCatalogue() },
    {
      provide: GenericListCatalogue,
      useFactory: () => new GenericListCatalogue(),
    },
    { provide: ShopStock, useFactory: () => new ShopStock() },
    {
      provide: GenericListContents,
      useFactory: () => new GenericListContents(),
    },
    { provide: PartyCatalogue, useFactory: () => new PartyCatalogue() },
    {
      provide: AchievementCatalogue,
      useFactory: () => new AchievementCatalogue(),
    },
    { provide: DailySpin, useFactory: () => new DailySpin() },
    { provide: MinigameCatalogue, useFactory: () => new MinigameCatalogue() },
    { provide: Minigames, useFactory: () => new Minigames() },
    { provide: PartyCalendar, useFactory: () => new PartyCalendar() },
    { provide: HostedParties, useFactory: () => new HostedParties() },
    { provide: Trades, useFactory: () => new Trades() },
    {
      provide: TradeRules,
      useFactory: () =>
        new TradeRules(
          inject<ItemCatalogue>(ItemCatalogue),
          inject<DenItemCatalogue>(DenItemCatalogue),
        ),
    },
    {
      provide: PetRules,
      useFactory: () =>
        new PetRules(
          inject<PetCatalogue>(PetCatalogue),
          inject<AvatarCatalogue>(AvatarCatalogue),
          inject<GenericListCatalogue>(GenericListCatalogue),
        ),
    },
    {
      provide: AvatarRules,
      useFactory: () =>
        new AvatarRules(
          inject<AvatarCatalogue>(AvatarCatalogue),
          inject<GenericListCatalogue>(GenericListCatalogue),
          inject<DiamondCatalogue>(DiamondCatalogue),
        ),
    },
    {
      provide: EcoRules,
      useFactory: () =>
        new EcoRules(inject<DenItemCatalogue>(DenItemCatalogue)),
    },
    {
      provide: Prices,
      useFactory: () =>
        new Prices(
          inject<ItemCatalogue>(ItemCatalogue),
          inject<DenItemCatalogue>(DenItemCatalogue),
          inject<DenRoomCatalogue>(DenRoomCatalogue),
          inject<DiamondCatalogue>(DiamondCatalogue),
          inject<ExchangeCatalogue>(ExchangeCatalogue),
        ),
    },
    {
      provide: AvatarRepository,
      useFactory: () => new AvatarRepository(inject<Database>(DatabaseToken)),
    },
    {
      provide: AccountRepository,
      useFactory: () => new AccountRepository(inject<Database>(DatabaseToken)),
    },
    {
      provide: AccessRepository,
      useFactory: () => new AccessRepository(inject<Database>(DatabaseToken)),
    },
    {
      provide: AuditRepository,
      useFactory: () => new AuditRepository(inject<Database>(DatabaseToken)),
    },
    {
      provide: ModerationRepository,
      useFactory: () =>
        new ModerationRepository(inject<Database>(DatabaseToken)),
    },
    {
      provide: DefinitionRepository,
      useFactory: () =>
        new DefinitionRepository(inject<Database>(DatabaseToken)),
    },
    {
      provide: PlayerRepository,
      useFactory: () => new PlayerRepository(inject<Database>(DatabaseToken)),
    },
    {
      provide: LikeRepository,
      useFactory: () => new LikeRepository(inject<Database>(DatabaseToken)),
    },
    {
      provide: WallRepository,
      useFactory: () => new WallRepository(inject<Database>(DatabaseToken)),
    },
    {
      provide: JamagramRepository,
      useFactory: () => new JamagramRepository(inject<Database>(DatabaseToken)),
    },
    {
      provide: MasterpieceRepository,
      useFactory: () =>
        new MasterpieceRepository(inject<Database>(DatabaseToken)),
    },
    {
      provide: MinigameRepository,
      useFactory: () => new MinigameRepository(inject<Database>(DatabaseToken)),
    },
    {
      provide: PetRepository,
      useFactory: () => new PetRepository(inject<Database>(DatabaseToken)),
    },
    {
      provide: TradeRepository,
      useFactory: () => new TradeRepository(inject<Database>(DatabaseToken)),
    },
    {
      provide: ShopRepository,
      useFactory: () => new ShopRepository(inject<Database>(DatabaseToken)),
    },
    {
      provide: AchievementRepository,
      useFactory: () =>
        new AchievementRepository(inject<Database>(DatabaseToken)),
    },
    {
      provide: SpinRepository,
      useFactory: () => new SpinRepository(inject<Database>(DatabaseToken)),
    },
    {
      provide: BuddyRepository,
      useFactory: () => new BuddyRepository(inject<Database>(DatabaseToken)),
    },
    {
      provide: DenRepository,
      useFactory: () => new DenRepository(inject<Database>(DatabaseToken)),
    },
    {
      provide: DenShopRepository,
      useFactory: () => new DenShopRepository(inject<Database>(DatabaseToken)),
    },
    {
      provide: EcoRepository,
      useFactory: () => new EcoRepository(inject<Database>(DatabaseToken)),
    },
  )
}
