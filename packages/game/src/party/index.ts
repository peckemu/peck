/**
 * A day
 */
const DAY = 86_400_000

/**
 * How far ahead the party list looks
 */
const LOOK_AHEAD = DAY

/**
 * The most parties the list holds
 */
const MOST_LISTED = 30

/**
 * When a party is on
 */
export type ScheduleEntry = {
  /**
   * The party
   */
  readonly partyDefId: number

  /**
   * When it first starts
   */
  readonly startsAt: Date

  /**
   * When it first ends
   */
  readonly endsAt: Date

  /**
   * How often it comes round
   */
  readonly repeat: 'none' | 'daily' | 'weekly' | 'yearly'

  /**
   * Whether only members can come
   */
  readonly membersOnly: boolean
}

/**
 * One time a party is on
 */
export type Occurrence = {
  /**
   * When it starts
   */
  readonly start: number

  /**
   * When it ends
   */
  readonly end: number
}

/**
 * A party in the list
 */
export type ListedParty = {
  /**
   * The party
   */
  readonly defId: number

  /**
   * Seconds to the start
   */
  readonly secondsToStart: number

  /**
   * Seconds left
   */
  readonly secondsToEnd: number
}

/**
 * A party a player hosts
 */
export type HostedParty = {
  /**
   * The host's id in the database
   */
  readonly hostGameId: number

  /**
   * The host's uuid
   */
  readonly hostUuid: string

  /**
   * The host's username
   */
  readonly hostName: string

  /**
   * The party
   */
  readonly defId: number

  /**
   * Its name
   */
  readonly name: string

  /**
   * The song it plays
   */
  readonly song: number

  /**
   * The venue room
   */
  readonly roomName: string

  /**
   * When it ends
   */
  readonly endsAt: number
}

/**
 * When the parties are on
 * @class
 */
export class PartyCalendar {
  /**
   * The schedule
   */
  private entries: readonly ScheduleEntry[] = []

  /**
   * Sets the schedule
   * @param entries The schedule
   */
  public load(entries: readonly ScheduleEntry[]): void {
    this.entries = entries
  }

  /**
   * Finds a party's schedule entry
   * @param defId The party
   * @param now The time now
   * @returns The entry, or null
   */
  public onNow(
    defId: number,
    now: number,
  ): { readonly entry: ScheduleEntry; readonly end: number } | null {
    for (const entry of this.entries) {
      if (entry.partyDefId !== defId) continue

      const occurrence = PartyCalendar.at(entry, now)
      if (occurrence) return { entry, end: occurrence.end }
    }

    return null
  }

  /**
   * Lists the parties on now and soon
   * @param now The time now
   * @param listable Checks a party can be listed
   * @returns The parties
   */
  public listing(
    now: number,
    listable: (defId: number) => boolean,
  ): ListedParty[] {
    const on: { defId: number; end: number }[] = []
    const soon: { defId: number; start: number; end: number }[] = []

    for (const entry of this.entries) {
      if (!listable(entry.partyDefId)) continue

      const current = PartyCalendar.at(entry, now)
      if (current) {
        on.push({ defId: entry.partyDefId, end: current.end })
        continue
      }

      const next = PartyCalendar.next(entry, now)
      if (next && next.start - now <= LOOK_AHEAD) {
        soon.push({ defId: entry.partyDefId, ...next })
      }
    }

    const seconds = (ms: number): number => Math.max(0, Math.ceil(ms / 1000))
    const listed = [
      ...on
        .sort((a, b) => b.end - a.end)
        .map(({ defId, end }) => ({
          defId,
          secondsToStart: 0,
          secondsToEnd: seconds(end - now),
        })),
      ...soon
        .sort((a, b) => a.start - b.start)
        .map(({ defId, start, end }) => ({
          defId,
          secondsToStart: Math.max(1, seconds(start - now)),
          secondsToEnd: seconds(end - start),
        })),
    ]

    const seen = new Set<string>()

    return listed
      .filter(({ defId, secondsToStart }) => {
        const key = `${String(defId)}:${String(secondsToStart === 0)}`
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })
      .slice(0, MOST_LISTED)
  }

  /**
   * Finds an entry's occurrence
   * @param entry The entry
   * @param now The time
   * @returns The occurrence, or null
   */
  private static at(entry: ScheduleEntry, now: number): Occurrence | null {
    const n = PartyCalendar.periodsTo(entry, now)

    for (const each of [n, n - 1]) {
      const occurrence = PartyCalendar.occurrence(entry, each)
      if (occurrence && occurrence.start <= now && now < occurrence.end) {
        return occurrence
      }
    }

    return null
  }

  /**
   * Finds an entry's next time
   * @param entry The entry
   * @param now The time
   * @returns The occurrence, or null
   */
  private static next(entry: ScheduleEntry, now: number): Occurrence | null {
    const n = Math.max(PartyCalendar.periodsTo(entry, now), 0)

    for (const each of [n, n + 1, n + 2]) {
      const occurrence = PartyCalendar.occurrence(entry, each)
      if (occurrence && occurrence.start > now) return occurrence
    }

    return null
  }

  /**
   * Counts an entry's repeats
   * @param entry The entry
   * @param now The time
   * @returns The periods
   */
  private static periodsTo(entry: ScheduleEntry, now: number): number {
    const start = entry.startsAt.getTime()

    if (entry.repeat === 'none') return 0
    if (entry.repeat === 'yearly') {
      return new Date(now).getUTCFullYear() - entry.startsAt.getUTCFullYear()
    }

    return Math.floor(
      (now - start) / (entry.repeat === 'daily' ? DAY : 7 * DAY),
    )
  }

  /**
   * Works out an entry's nth occurrence
   * @param entry The entry
   * @param n Which occurrence
   * @returns The occurrence, or null
   */
  private static occurrence(
    entry: ScheduleEntry,
    n: number,
  ): Occurrence | null {
    const start = entry.startsAt.getTime()
    const end = entry.endsAt.getTime()

    if (entry.repeat === 'none') return n === 0 ? { start, end } : null
    if (n < 0) return null

    if (entry.repeat === 'yearly') {
      return {
        start: PartyCalendar.addYears(entry.startsAt, n),
        end: PartyCalendar.addYears(entry.endsAt, n),
      }
    }

    const period = entry.repeat === 'daily' ? DAY : 7 * DAY

    return { start: start + n * period, end: end + n * period }
  }

  /**
   * Moves a date on by whole years
   * @param date The date
   * @param years How many years
   * @returns The time
   */
  private static addYears(date: Date, years: number): number {
    const year = date.getUTCFullYear() + years
    const last = new Date(
      Date.UTC(year, date.getUTCMonth() + 1, 0),
    ).getUTCDate()

    return Date.UTC(
      year,
      date.getUTCMonth(),
      Math.min(date.getUTCDate(), last),
      date.getUTCHours(),
      date.getUTCMinutes(),
      date.getUTCSeconds(),
    )
  }
}

/**
 * The parties players host
 * @class
 */
export class HostedParties {
  /**
   * The parties by host
   */
  private readonly parties = new Map<number, HostedParty>()

  /**
   * Starts a party
   * @param party The party
   */
  public host(party: HostedParty): void {
    this.parties.set(party.hostGameId, party)
  }

  /**
   * Finds the party a player hosts
   * @param hostGameId The host
   * @param now The time now
   * @returns The party, or null
   */
  public of(hostGameId: number, now: number): HostedParty | null {
    const party = this.parties.get(hostGameId)

    return party && party.endsAt > now ? party : null
  }

  /**
   * Finds a party by its host's uuid
   * @param hostUuid The host's uuid
   * @param now The time now
   * @returns The party, or null
   */
  public byUuid(hostUuid: string, now: number): HostedParty | null {
    return (
      this.running(now).find((party) => party.hostUuid === hostUuid) ?? null
    )
  }

  /**
   * Finds a party by its room
   * @param roomName The room
   * @param now The time now
   * @returns The party, or null
   */
  public byRoom(roomName: string, now: number): HostedParty | null {
    return (
      this.running(now).find((party) => party.roomName === roomName) ?? null
    )
  }

  /**
   * Lists the parties on now
   * @param now The time now
   * @returns The parties
   */
  public running(now: number): HostedParty[] {
    return [...this.parties.values()]
      .filter((party) => party.endsAt > now)
      .sort((a, b) => a.endsAt - b.endsAt)
  }

  /**
   * Forgets ended parties
   * @param now The time now
   * @returns The ended parties
   */
  public expire(now: number): HostedParty[] {
    const ended = [...this.parties.values()].filter(
      (party) => party.endsAt <= now,
    )
    for (const party of ended) this.parties.delete(party.hostGameId)

    return ended
  }
}
