import { join } from 'node:path'

import { type ContentExport } from '#content/exports'
import { type ContentNetwork } from '#content/network'
import { PackSet } from '#content/pack'
import { Strings } from '#content/strings'

/**
 * The English localisation pack
 */
const ENGLISH = 10230

/**
 * An exported file
 */
export type Exported = {
  /**
   * The file path
   */
  readonly file: string

  /**
   * The row count
   */
  readonly rows: number
}

/**
 * Exports the game's content
 * @class
 */
export class ContentExporter {
  /**
   * The content network
   */
  private readonly network: ContentNetwork

  /**
   * The exports to run
   */
  private readonly exports: readonly ContentExport[]

  /**
   * Creates an exporter
   * @param network The content network
   * @param exports The exports to run
   */
  public constructor(
    network: ContentNetwork,
    exports: readonly ContentExport[],
  ) {
    this.network = network
    this.exports = exports
  }

  /**
   * Runs every export
   * @param directory The output directory
   * @returns The exported files
   */
  public async run(directory: string): Promise<Exported[]> {
    const strings = new Strings(await this.network.pack(ENGLISH))

    const ids = [...new Set(this.exports.flatMap((each) => each.packs))]
    const fetched = await Promise.all(
      ids.map(async (id) => [id, await this.network.pack(id)] as const),
    )
    const packs = new PackSet(new Map(fetched))

    return Promise.all(
      this.exports.map(async (each) => {
        const rows = each.rows(packs, strings).sort((a, b) => a.defId - b.defId)
        const file = join(directory, `${each.file}.json`)
        await Bun.write(file, `${JSON.stringify(rows, null, 2)}\n`)
        return { file, rows: rows.length }
      }),
    )
  }
}
