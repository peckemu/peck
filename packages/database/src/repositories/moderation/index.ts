import { Player } from '#database/entities/player'
import { Report } from '#database/entities/moderation/report'
import {
  Sanction,
  type SanctionKind,
} from '#database/entities/moderation/sanction'
import { type Database } from '#database/pool'
import { writeAudit } from '#database/repositories/audit'

/**
 * The audit action by sanction kind
 */
const SANCTION_ACTIONS = {
  ban: 'player.banned',
  mute: 'player.muted',
} as const

/**
 * A sanction with its player
 */
type SanctionRow = Omit<Sanction, 'player'> & {
  readonly player?: Player | undefined
}

/**
 * A report with its players
 */
type ReportRow = Omit<Report, 'reporter' | 'reported'> & {
  readonly reporter?: Player | undefined
  readonly reported?: Player | undefined
}

/**
 * A report being made
 */
export type ReportInput = {
  /**
   * The player reporting
   */
  readonly reporterGameId: number

  /**
   * The player reported
   */
  readonly reportedGameId: number

  /**
   * The rule broken
   */
  readonly reasonId: number

  /**
   * The kind of thing reported
   */
  readonly dataType?: number

  /**
   * The thing reported
   */
  readonly data?: string

  /**
   * The reporter's room
   */
  readonly roomName?: string
}

/**
 * A player in a report
 */
export type ReportPlayer = {
  /**
   * Their id in the database
   */
  readonly gameId: number

  /**
   * Their username
   */
  readonly username: string
}

/**
 * An open report
 */
export type ReportInfo = {
  /**
   * Its id
   */
  readonly id: string

  /**
   * The player reporting
   */
  readonly reporter: ReportPlayer

  /**
   * The player reported
   */
  readonly reported: ReportPlayer

  /**
   * The rule broken
   */
  readonly reasonId: number

  /**
   * The kind of thing reported
   */
  readonly dataType: number

  /**
   * The thing reported
   */
  readonly data: string

  /**
   * The reporter's room
   */
  readonly roomName: string

  /**
   * When it was made
   */
  readonly createdAt: Date
}

/**
 * A sanction being given
 */
export type SanctionInput = {
  /**
   * The staff account giving it
   */
  readonly actorId: string

  /**
   * The account sanctioned
   */
  readonly accountId: string

  /**
   * The player sanctioned
   */
  readonly gameId: number

  /**
   * The player's username
   */
  readonly username: string

  /**
   * Its kind
   */
  readonly kind: SanctionKind

  /**
   * The rule broken
   */
  readonly reasonId: number

  /**
   * The staff note
   */
  readonly note: string

  /**
   * When it ends, or null
   */
  readonly expiresAt: Date | null
}

/**
 * A ban or mute
 */
export type SanctionInfo = {
  /**
   * Its id
   */
  readonly id: string

  /**
   * The account sanctioned
   */
  readonly accountId: string

  /**
   * The player sanctioned
   */
  readonly gameId: number

  /**
   * The player's username
   */
  readonly username: string

  /**
   * Its kind
   */
  readonly kind: SanctionKind

  /**
   * The rule broken
   */
  readonly reasonId: number

  /**
   * The staff note
   */
  readonly note: string

  /**
   * When it was given
   */
  readonly createdAt: Date

  /**
   * When it ends, or null
   */
  readonly expiresAt: Date | null
}

/**
 * Keeps reports, bans and mutes
 * @class
 */
export class ModerationRepository {
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
   * Keeps a report
   * @param input The report
   * @returns The report id
   */
  public async report(input: ReportInput): Promise<string> {
    const [report] = await this.database.insertMany(Report, [input], {
      returning: { id: true },
    })
    if (!report) throw new Error('Report was not kept')

    return report.id
  }

  /**
   * Lists the open reports
   * @returns The reports
   */
  public async reports(): Promise<ReportInfo[]> {
    const found = await this.database.findMany(Report, {
      $where: { status: 'open' },
      $populate: { reporter: true, reported: true },
      $sort: { createdAt: 'asc' },
    })

    return found.map((report) => ModerationRepository.info(report))
  }

  /**
   * Resolves a report
   * @param id The report
   * @param actorId The staff account
   * @returns Whether it was open
   */
  public async resolve(id: string, actorId: string): Promise<boolean> {
    return this.database.transaction(async (querier) => {
      const report = await querier.findOne(Report, {
        $where: { id, status: 'open' },
      })
      if (!report) return false

      await querier.updateOneById(Report, id, {
        status: 'resolved',
        resolvedAt: new Date(),
        resolvedBy: actorId,
      })

      await writeAudit(querier, {
        actorId,
        action: 'report.resolved',
        targetKind: 'report',
        targetId: id,
        targetName: String(report.reportedGameId),
      })

      return true
    })
  }

  /**
   * Gives a ban or mute
   * @param input The sanction
   * @returns The sanction id
   */
  public async sanction(input: SanctionInput): Promise<string> {
    return this.database.transaction(async (querier) => {
      const { username, ...sanction } = input

      const [kept] = await querier.insertMany(Sanction, [sanction], {
        returning: { id: true },
      })
      if (!kept) throw new Error('Sanction was not kept')

      await writeAudit(querier, {
        actorId: input.actorId,
        action: SANCTION_ACTIONS[input.kind],
        targetKind: 'player',
        targetId: String(input.gameId),
        targetName: username,
        detail: {
          sanctionId: kept.id,
          reasonId: input.reasonId,
          note: input.note,
          expiresAt: input.expiresAt?.toISOString() ?? null,
        },
      })

      return kept.id
    })
  }

  /**
   * Lifts an account's bans or mutes
   * @param accountId The account
   * @param kind The kind
   * @param actorId The staff account
   * @returns How many were lifted
   */
  public async lift(
    accountId: string,
    kind: SanctionKind,
    actorId: string,
  ): Promise<number> {
    const now = new Date()
    const lifting = (await this.unlifted(accountId, kind)).filter((sanction) =>
      ModerationRepository.running(sanction, now),
    )

    for (const sanction of lifting) await this.liftOne(sanction, actorId)

    return lifting.length
  }

  /**
   * Lifts a sanction
   * @param id The sanction
   * @param actorId The staff account
   * @returns The sanction, or null
   */
  public async liftById(
    id: string,
    actorId: string,
  ): Promise<SanctionInfo | null> {
    const sanction = await this.database.findOne(Sanction, {
      $where: { id, liftedAt: null },
      $populate: { player: true },
    })
    if (!sanction || !ModerationRepository.running(sanction, new Date())) {
      return null
    }

    await this.liftOne(sanction, actorId)

    return ModerationRepository.shown(sanction)
  }

  /**
   * Finds an account's running ban or mute
   * @param accountId The account
   * @param kind The kind
   * @returns The sanction, or null
   */
  public async active(
    accountId: string,
    kind: SanctionKind,
  ): Promise<SanctionInfo | null> {
    const now = new Date()
    const running = (await this.unlifted(accountId, kind)).filter((sanction) =>
      ModerationRepository.running(sanction, now),
    )
    const longest = running.sort((one, other) =>
      ModerationRepository.longest(one, other),
    )[0]

    return longest ? ModerationRepository.shown(longest) : null
  }

  /**
   * Finds a player's running mute
   * @param gameId The player
   * @returns The mute, or null
   */
  public async muted(gameId: number): Promise<SanctionInfo | null> {
    const player = await this.database.findOneById(Player, gameId)

    return player ? this.active(player.accountId, 'mute') : null
  }

  /**
   * Lists every running sanction
   * @returns The sanctions
   */
  public async sanctions(): Promise<SanctionInfo[]> {
    const now = new Date()
    const found = await this.database.findMany(Sanction, {
      $where: { liftedAt: null },
      $populate: { player: true },
      $sort: { createdAt: 'desc' },
    })

    return found
      .filter((sanction) => ModerationRepository.running(sanction, now))
      .map((sanction) => ModerationRepository.shown(sanction))
  }

  /**
   * Lists an account's unlifted sanctions
   * @param accountId The account
   * @param kind The kind
   * @returns The sanctions
   */
  private async unlifted(
    accountId: string,
    kind: SanctionKind,
  ): Promise<SanctionRow[]> {
    return this.database.findMany(Sanction, {
      $where: { accountId, kind, liftedAt: null },
      $populate: { player: true },
    })
  }

  /**
   * Lifts one sanction
   * @param sanction The sanction
   * @param actorId The staff account
   */
  private async liftOne(sanction: SanctionRow, actorId: string): Promise<void> {
    await this.database.transaction(async (querier) => {
      await querier.updateOneById(Sanction, sanction.id, {
        liftedAt: new Date(),
        liftedBy: actorId,
      })

      await writeAudit(querier, {
        actorId,
        action: 'sanction.lifted',
        targetKind: 'player',
        targetId: String(sanction.gameId),
        targetName: sanction.player?.username ?? '',
        detail: { sanctionId: sanction.id, kind: sanction.kind },
      })
    })
  }

  /**
   * Checks a sanction is running
   * @param sanction The sanction
   * @param now The time
   * @returns Whether it is
   */
  private static running(sanction: SanctionRow, now: Date): boolean {
    return !sanction.expiresAt || sanction.expiresAt > now
  }

  /**
   * Orders sanctions by end
   * @param one A sanction
   * @param other Another sanction
   * @returns The order
   */
  private static longest(one: SanctionRow, other: SanctionRow): number {
    const end = (sanction: SanctionRow): number =>
      sanction.expiresAt?.getTime() ?? Infinity

    if (end(one) === end(other)) return 0

    return end(other) > end(one) ? 1 : -1
  }

  /**
   * Shows a sanction
   * @param sanction The sanction
   * @returns The sanction
   */
  private static shown(sanction: SanctionRow): SanctionInfo {
    return {
      id: sanction.id,
      accountId: sanction.accountId,
      gameId: sanction.gameId,
      username: sanction.player?.username ?? '',
      kind: sanction.kind,
      reasonId: sanction.reasonId,
      note: sanction.note,
      createdAt: sanction.createdAt,
      expiresAt: sanction.expiresAt ?? null,
    }
  }

  /**
   * Shows a report
   * @param report The report
   * @returns The report
   */
  private static info(report: ReportRow): ReportInfo {
    return {
      id: report.id,
      reporter: {
        gameId: report.reporterGameId,
        username: report.reporter?.username ?? '',
      },
      reported: {
        gameId: report.reportedGameId,
        username: report.reported?.username ?? '',
      },
      reasonId: report.reasonId,
      dataType: report.dataType,
      data: report.data,
      roomName: report.roomName,
      createdAt: report.createdAt,
    }
  }
}
