import { ContentLoader } from '#emulator/loaders/content'
import { Loader } from '#emulator/loaders/loader'
import { QuestLoader } from '#emulator/loaders/quest'

/**
 * Every loader in order
 */
export const LOADERS: readonly (new () => Loader)[] = [
  ContentLoader,
  QuestLoader,
]

export { ContentLoader, Loader, QuestLoader }
