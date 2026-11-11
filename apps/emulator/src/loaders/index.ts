import { ContentLoader } from '#emulator/loaders/content'
import { Loader } from '#emulator/loaders/loader'

/**
 * Every loader in order
 */
export const LOADERS: readonly (new () => Loader)[] = [ContentLoader]

export { ContentLoader, Loader }
