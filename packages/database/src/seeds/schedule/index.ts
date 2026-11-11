import { type SqlQuerier } from 'uql-orm'

import { PartySchedule } from '#database/entities/party/schedule'
import { Seed } from '#database/seeder'

/**
 * The hourly parties
 */
const HOURLY = [2, 7, 15, 17, 31, 4, 34, 33, 12, 22, 19] as const

/**
 * The holiday parties
 */
const HOLIDAYS = [
  { partyDefId: 1, from: '2025-12-01', to: '2026-01-01' },
  { partyDefId: 26, from: '2025-12-31', to: '2026-01-02' },
  { partyDefId: 8, from: '2026-02-07', to: '2026-02-22' },
  { partyDefId: 11, from: '2026-03-10', to: '2026-03-25' },
  { partyDefId: 14, from: '2026-04-01', to: '2026-04-02' },
  { partyDefId: 20, from: '2026-07-01', to: '2026-07-08' },
  { partyDefId: 9, from: '2026-07-15', to: '2026-08-16' },
  { partyDefId: 23, from: '2026-09-13', to: '2026-09-20' },
  { partyDefId: 16, from: '2026-10-15', to: '2026-11-01' },
  { partyDefId: 24, from: '2026-10-24', to: '2026-11-01' },
] as const

/**
 * An hour
 */
const HOUR = 60 * 60 * 1000

/**
 * Seeds the party times
 * @class
 */
export class ScheduleSeed extends Seed {
  /**
   * The seed name
   */
  public readonly name = 'schedule'

  /**
   * Whether the seed runs in production
   */
  public override readonly production = true

  /**
   * Adds the rotation and holidays
   * @param querier The querier
   */
  public async run(querier: SqlQuerier): Promise<void> {
    await querier.deleteMany(PartySchedule, {}, { unfiltered: true })

    const day = Date.UTC(2026, 0, 1)
    const hourly = Array.from({ length: 24 }, (_, hour) => ({
      partyDefId: HOURLY[hour % HOURLY.length] ?? HOURLY[0],
      startsAt: new Date(day + hour * HOUR),
      endsAt: new Date(day + (hour + 1) * HOUR),
      repeat: 'daily' as const,
    }))

    const holidays = HOLIDAYS.map(({ partyDefId, from, to }) => ({
      partyDefId,
      startsAt: new Date(`${from}T00:00:00Z`),
      endsAt: new Date(`${to}T00:00:00Z`),
      repeat: 'yearly' as const,
    }))

    await querier.insertMany(PartySchedule, [...hourly, ...holidays])
  }
}
