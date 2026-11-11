import { Container, inject } from '@needle-di/core'
import {
  ClusterEvents,
  type ClusterStore,
  NodeRegistry,
  TicketStore,
  UploadTokens,
  WallTokens,
} from '@peck/cluster'
import {
  AccessRepository,
  AccountRepository,
  AuditRepository,
  type Database,
  DefinitionRepository,
  JamagramRepository,
  MasterpieceRepository,
  ModerationRepository,
  PlayerRepository,
  WallRepository,
  SessionRepository,
} from '@peck/database'
import { createLogger, type Logger } from '@peck/logger'

import { type Config } from '#api/config'
import { ConfigToken, DatabaseToken, LoggerToken } from '#api/tokens'

/**
 * The container options
 */
export type ContainerOptions = {
  /**
   * The API config
   */
  readonly config: Config

  /**
   * The database
   */
  readonly database: Database

  /**
   * Where the cluster keeps its state
   */
  readonly store: ClusterStore

  /**
   * The logger
   */
  readonly logger?: Logger
}

/**
 * Builds the container
 * @param options The container options
 * @returns The container
 */
export const createContainer = (options: ContainerOptions): Container =>
  new Container().bindAll(
    { provide: ConfigToken, useValue: options.config },
    {
      provide: LoggerToken,
      useValue: options.logger ?? createLogger(options.config),
    },
    { provide: DatabaseToken, useValue: options.database },
    { provide: NodeRegistry, useValue: new NodeRegistry(options.store) },
    { provide: TicketStore, useValue: new TicketStore(options.store) },
    { provide: UploadTokens, useValue: new UploadTokens(options.store) },
    { provide: WallTokens, useValue: new WallTokens(options.store) },
    { provide: ClusterEvents, useValue: new ClusterEvents(options.store) },
    {
      provide: AccessRepository,
      useFactory: () => new AccessRepository(inject<Database>(DatabaseToken)),
    },
    {
      provide: AuditRepository,
      useFactory: () => new AuditRepository(inject<Database>(DatabaseToken)),
    },
    {
      provide: AccountRepository,
      useFactory: () => new AccountRepository(inject<Database>(DatabaseToken)),
    },
    {
      provide: SessionRepository,
      useFactory: () => new SessionRepository(inject<Database>(DatabaseToken)),
    },
    {
      provide: PlayerRepository,
      useFactory: () => new PlayerRepository(inject<Database>(DatabaseToken)),
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
      provide: ModerationRepository,
      useFactory: () =>
        new ModerationRepository(inject<Database>(DatabaseToken)),
    },
    {
      provide: DefinitionRepository,
      useFactory: () =>
        new DefinitionRepository(inject<Database>(DatabaseToken)),
    },
  )
