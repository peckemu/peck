import { ContentLoader } from './content/index.ts'
import { Loader } from './loader/index.ts'
import { QuestLoader } from './quest/index.ts'

/**
 * Every loader in order
 */
export const LOADERS: readonly (new () => Loader)[] = [
  ContentLoader,
  QuestLoader,
]

export { ContentLoader, Loader, QuestLoader }
