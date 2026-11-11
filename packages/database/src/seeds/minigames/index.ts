import { join } from 'node:path'

import { type SqlQuerier } from 'uql-orm'

import { MinigameDefinition } from '#database/entities/definitions/minigame'
import { Seed } from '#database/seeder'

/**
 * The content folder
 */
const CONTENT = join(import.meta.dir, '../../../content')

/**
 * Seeds the minigames
 * @class
 */
export class MinigamesSeed extends Seed {
  /**
   * The seed name
   */
  public readonly name = 'minigames'

  /**
   * Whether the seed runs in production
   */
  public override readonly production = true

  /**
   * Puts in the imported minigames
   * @param querier The querier
   */
  public async run(querier: SqlQuerier): Promise<void> {
    const file = Bun.file(join(CONTENT, 'minigames.json'))
    if (!(await file.exists())) return

    const games = (await file.json()) as MinigameDefinition[]

    for (const game of games) {
      await querier.upsertOne(MinigameDefinition, { defId: true }, game)
    }
  }
}
