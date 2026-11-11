import { join } from 'node:path'

import { SQL } from 'bun'

import { Command, type Options } from '@peck/plugins'

/**
 * The root of the repository
 */
const ROOT = join(import.meta.dir, '../../../../../..')

/**
 * A minigame's fields
 */
const FIELDS = [
  ['titleStrId', 'int'],
  ['extName', 'text'],
  ['swfName', 'text'],
  ['minPlayers', 'int'],
  ['maxPlayers', 'int'],
  ['maxSpectators', 'int'],
  ['type', 'int'],
  ['gameCardMediaId', 'int'],
  ['gameCountUserVarRef', 'int'],
  ['custom1UserVarRef', 'int'],
  ['custom2UserVarRef', 'int'],
  ['readyForPvp', 'flag'],
  ['gemMultiplier', 'number'],
  ['petDefId', 'int'],
  ['proModeUserVarRefId', 'int'],
  ['leaderboardUserVarRef', 'int'],
  ['gameLibraryIconMediaId', 'int'],
  ['requiredAvatarType', 'int'],
] as const

/**
 * The fields per minigame
 */
const PER_GAME = FIELDS.length + 1

/**
 * A minigame or list
 */
type CatalogueRow = {
  /**
   * The game's or list's id
   */
  readonly id: number

  /**
   * Its other fields
   */
  readonly fields: readonly string[]
}

/**
 * The minigames and lists
 */
type Catalogue = {
  /**
   * The minigames
   */
  readonly games: CatalogueRow[]

  /**
   * What the generic lists hold
   */
  readonly lists: CatalogueRow[]
}

/**
 * Imports minigames and shop lists
 * @class
 */
export class CatalogueImportCommand extends Command {
  /**
   * The command name
   */
  public readonly name = 'catalogue:import'

  /**
   * The command description
   */
  public readonly description = 'Imports minigames and shop lists'

  /**
   * The command options
   */
  public override readonly options = {
    from: { description: "A packet log, or Phantom's database URL" },
    out: {
      description: 'Where the files are written',
      fallback: join(ROOT, 'packages/database/content'),
    },
  }

  /**
   * Imports the catalogue
   * @param options The options
   */
  public async run(options: Options): Promise<void> {
    const from = String(options['from'])
    const out = String(options['out'])

    const { games, lists } = /^postgres(ql)?:\/\//.test(from)
      ? await CatalogueImportCommand.fromPhantom(from)
      : await CatalogueImportCommand.fromLog(from)

    const minigames = games.flatMap((row) => CatalogueImportCommand.read(row))
    const contents = lists.map(({ id, fields }) => ({ listId: id, fields }))

    const allGames = await CatalogueImportCommand.merge(
      join(out, 'minigames.json'),
      'defId',
      minigames,
    )
    const allLists = await CatalogueImportCommand.merge(
      join(out, 'list-contents.json'),
      'listId',
      contents,
    )

    console.log(
      `Imported ${String(minigames.length)} minigames and ${String(contents.length)} lists, ` +
        `${String(allGames)} and ${String(allLists)} in all`,
    )
  }

  /**
   * Reads a packet log
   * @param path The log
   * @returns The minigames and lists
   */
  private static async fromLog(path: string): Promise<Catalogue> {
    const file = Bun.file(path)
    if (!(await file.exists())) throw new Error(`There is no file at ${path}`)

    const games = new Map<number, CatalogueRow>()
    const lists = new Map<number, CatalogueRow>()

    for (const line of (await file.text()).split(/\r?\n/)) {
      const at = line.search(/%xt%(mi|gl)%/)
      if (at === -1) continue

      const parts = line.slice(at).replaceAll('\0', '').trimEnd().split('%')
      if (parts.at(-1) === '') parts.pop()

      const [, , header, , first = '', ...rest] = parts

      if (header === 'gl') {
        const id = Math.trunc(Number(first))
        if (Number.isFinite(id)) lists.set(id, { id, fields: rest })
        continue
      }

      for (let index = 0; index + PER_GAME <= rest.length; index += PER_GAME) {
        const [gameId = '', ...fields] = rest.slice(index, index + PER_GAME)
        const defId = Math.trunc(Number(gameId))
        if (defId > 0) games.set(defId, { id: defId, fields })
      }
    }

    const byId = (a: CatalogueRow, b: CatalogueRow): number => a.id - b.id

    return {
      games: [...games.values()].sort(byId),
      lists: [...lists.values()].sort(byId),
    }
  }

  /**
   * Reads Phantom's minigames and lists
   * @param url Phantom's database URL
   * @returns What it holds
   */
  private static async fromPhantom(url: string): Promise<Catalogue> {
    const phantom = new SQL(url)

    try {
      const [found] = await phantom<{ table: string | null }[]>`
        SELECT to_regclass('private_server_catalogue') AS table
      `
      if (!found?.table) {
        throw new Error(
          "That isn't Phantom's database, it has no private_server_catalogue table",
        )
      }

      const games = await phantom<CatalogueRow[]>`
        SELECT id, fields FROM private_server_catalogue WHERE kind = 'minigame' ORDER BY id
      `
      const lists = await phantom<CatalogueRow[]>`
        SELECT id, fields FROM private_server_catalogue WHERE kind = 'generic-list' ORDER BY id
      `

      return { games: [...games], lists: [...lists] }
    } finally {
      await phantom.end()
    }
  }

  /**
   * Adds rows to a file
   * @param path The file
   * @param key The id's name
   * @param rows The new rows
   * @returns The row count
   */
  private static async merge(
    path: string,
    key: string,
    rows: readonly Record<string, unknown>[],
  ): Promise<number> {
    const file = Bun.file(path)
    const before = (await file.exists())
      ? ((await file.json()) as Record<string, unknown>[])
      : []

    const all = new Map(before.map((row) => [Number(row[key]), row]))
    for (const row of rows) all.set(Number(row[key]), row)

    const sorted = [...all.entries()]
      .sort(([a], [b]) => a - b)
      .map(([, row]) => row)
    await Bun.write(path, JSON.stringify(sorted, null, 2))

    return sorted.length
  }

  /**
   * Reads one minigame
   * @param row The catalogue row
   * @returns The minigame
   */
  private static read(
    row: CatalogueRow,
  ): Record<string, number | string | boolean>[] {
    if (row.fields.length < FIELDS.length) return []

    const game: Record<string, number | string | boolean> = { defId: row.id }
    for (const [index, [name, type]] of FIELDS.entries()) {
      const value = row.fields[index] ?? ''

      if (type === 'text') game[name] = value
      else if (type === 'flag') game[name] = value !== '0' && value !== ''
      else if (type === 'number') game[name] = Number.parseFloat(value) || 0
      else game[name] = Math.trunc(Number(value)) || 0
    }

    return [game]
  }
}
