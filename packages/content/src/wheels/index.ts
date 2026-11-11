import { type Strings } from '#content/strings'

/**
 * The avatar creator's name wheels
 */
export type NameWheels = {
  /**
   * The first part
   */
  readonly first: number[]

  /**
   * The middle part
   */
  readonly middle: number[]

  /**
   * The last part
   */
  readonly last: number[]
}

/**
 * A run of string ids
 */
type Run = readonly [number, number]

/**
 * The wheels' string id runs
 */
const NAME_RUNS: Readonly<Record<keyof NameWheels, readonly Run[]>> = {
  first: [
    [15136, 15223],
    [27034, 27093],
  ],
  middle: [
    [15224, 15298],
    [27095, 27140],
    [32697, 32724],
  ],
  last: [
    [15299, 15475],
    [27141, 27275],
    [30568, 30576],
    [32697, 32724],
  ],
}

/**
 * One plain word
 */
const WORD = /^[A-Za-z][A-Za-z'-]*$/

/**
 * The lone last name range
 */
const LONE_WORDS = { from: 15136, to: 33000 } as const

/**
 * Lone non-name words
 */
const NOT_NAMES = new Set([
  'advertisement',
  'publicidad',
  'publicidade',
  'test',
  'sdfg',
])

/**
 * The crowd size
 */
const CROWD = 12

/**
 * Reads the name wheels
 * @param strings The English strings
 * @returns The wheels
 */
export const readNameWheels = (strings: Strings): NameWheels => ({
  first: wheel(strings, NAME_RUNS.first, true),
  middle: wheel(strings, NAME_RUNS.middle, true),
  last: wheel(strings, NAME_RUNS.last, false, loneWords(strings)),
})

/**
 * Lists the words of one wheel
 * @param strings The English strings
 * @param runs The runs its words sit in
 * @param capitalised Whether it is capitalised
 * @param extra More ids to consider
 * @returns The string ids, in order
 */
const wheel = (
  strings: Strings,
  runs: readonly Run[],
  capitalised: boolean,
  extra: readonly number[] = [],
): number[] => {
  const fits = (id: number): boolean => {
    const text = strings.text(id)
    if (!text || !WORD.test(text)) return false

    const first = text.charAt(0)

    return (first === first.toUpperCase()) === capitalised
  }

  const ids: number[] = []
  for (const [from, to] of runs) {
    for (let id = from; id <= to; id++) if (fits(id)) ids.push(id)
  }
  for (const id of extra) if (fits(id)) ids.push(id)

  return ids.sort((a, b) => a - b)
}

/**
 * Lists the lone last names
 * @param strings The English strings
 * @returns The string ids
 */
const loneWords = (strings: Strings): number[] => {
  const lower = (id: number): boolean => {
    const text = strings.text(id)

    return text !== undefined && WORD.test(text) && text === text.toLowerCase()
  }

  const crowded = (id: number): boolean => {
    let near = 0
    for (let other = id - CROWD; other <= id + CROWD; other++) {
      if (lower(other)) near++
    }

    return near >= CROWD
  }

  const inRuns = (id: number): boolean =>
    NAME_RUNS.last.some(([from, to]) => id >= from && id <= to)

  const ids: number[] = []
  for (const [id, text] of strings) {
    if (id < LONE_WORDS.from || id > LONE_WORDS.to || inRuns(id)) continue
    if (lower(id) && !NOT_NAMES.has(text) && !crowded(id)) ids.push(id)
  }

  return ids
}
