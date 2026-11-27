import { type PackSet } from '../../pack/index.ts'
import { type Strings } from '../../strings/index.ts'

/**
 * An exported row
 */
export type Row = {
  /**
   * The definition id
   */
  readonly defId: number

  /**
   * The other fields
   */
  readonly [field: string]: unknown
}

/**
 * Exports a def pack
 * @class
 */
export abstract class ContentExport {
  /**
   * The file name
   */
  public abstract readonly file: string

  /**
   * The pack ids it reads
   */
  public abstract readonly packs: readonly number[]

  /**
   * Reads the rows
   * @param packs The def packs
   * @param strings The English strings
   * @returns The rows
   */
  public abstract rows(packs: PackSet, strings: Strings): Row[]
}
