import { type ReportInfo, type SanctionInfo } from '@peck/database'

/**
 * A player in a view
 */
export type PlayerView = {
  /**
   * Their game id
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
export type ReportView = {
  /**
   * Its id
   */
  readonly id: string

  /**
   * The player reporting
   */
  readonly reporter: PlayerView

  /**
   * The player reported
   */
  readonly reported: PlayerView

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
  readonly createdAt: string
}

/**
 * A running ban or mute
 */
export type SanctionView = {
  /**
   * Its id
   */
  readonly id: string

  /**
   * Its kind
   */
  readonly kind: string

  /**
   * The player sanctioned
   */
  readonly player: PlayerView

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
  readonly createdAt: string

  /**
   * When it ends, or null
   */
  readonly expiresAt: string | null
}

/**
 * Shows a report
 * @param report The report
 * @returns The view
 */
export const reportView = (report: ReportInfo): ReportView => ({
  id: report.id,
  reporter: report.reporter,
  reported: report.reported,
  reasonId: report.reasonId,
  dataType: report.dataType,
  data: report.data,
  roomName: report.roomName,
  createdAt: report.createdAt.toISOString(),
})

/**
 * Shows a sanction
 * @param sanction The sanction
 * @returns The view
 */
export const sanctionView = (sanction: SanctionInfo): SanctionView => ({
  id: sanction.id,
  kind: sanction.kind,
  player: { gameId: sanction.gameId, username: sanction.username },
  reasonId: sanction.reasonId,
  note: sanction.note,
  createdAt: sanction.createdAt.toISOString(),
  expiresAt: sanction.expiresAt?.toISOString() ?? null,
})
