import { join } from 'node:path'

import { type SqlQuerier } from 'uql-orm'

import { GenericListContent } from '#database/entities/definitions/list-content'
import { Seed } from '#database/seeder'

/**
 * The content folder
 */
const CONTENT = join(import.meta.dir, '../../../content')

/**
 * Seeds the generic list contents
 * @class
 */
export class ListContentsSeed extends Seed {
  /**
   * The seed name
   */
  public readonly name = 'list-contents'

  /**
   * Whether the seed runs in production
   */
  public override readonly production = true

  /**
   * Puts in the imported lists
   * @param querier The querier
   */
  public async run(querier: SqlQuerier): Promise<void> {
    const file = Bun.file(join(CONTENT, 'list-contents.json'))
    if (!(await file.exists())) return

    const lists = (await file.json()) as GenericListContent[]

    for (const list of lists) {
      await querier.upsertOne(GenericListContent, { listId: true }, list)
    }
  }
}
