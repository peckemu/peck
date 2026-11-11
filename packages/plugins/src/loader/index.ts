import { readdir } from 'node:fs/promises'
import { join } from 'node:path'

import { Plugin } from '#plugins/plugin'

/**
 * A plugin's package.json
 */
type PluginPackage = {
  /**
   * The entry file
   */
  readonly main?: string
}

/**
 * The plugin loader
 * @class
 */
export class PluginLoader {
  /**
   * Loads every plugin in a folder
   * @param directory The plugins folder
   * @param enabled The folders to load, or null
   * @returns The plugins
   */
  public static async discover(
    directory: string,
    enabled: readonly string[] | null = null,
  ): Promise<Plugin[]> {
    const folders = await PluginLoader.folders(directory)
    const missing = (enabled ?? []).filter((name) => !folders.includes(name))
    if (missing.length > 0) {
      throw new Error(`Plugin ${missing.join(', ')} was not found`)
    }

    const plugins: Plugin[] = []
    for (const folder of folders.filter(
      (name) => enabled?.includes(name) ?? true,
    )) {
      const plugin = await PluginLoader.load(join(directory, folder))
      if (plugin) plugins.push(plugin)
    }
    return plugins
  }

  /**
   * Loads the plugin in a folder
   * @param folder The plugin's folder
   * @returns The plugin, or null
   */
  public static async load(folder: string): Promise<Plugin | null> {
    const manifest = Bun.file(join(folder, 'package.json'))
    if (!(await manifest.exists())) return null

    const { main = 'src/index.ts' } = (await manifest.json()) as PluginPackage
    const module = (await import(join(folder, main))) as { default?: unknown }
    const type = module.default
    if (typeof type !== 'function' || !(type.prototype instanceof Plugin)) {
      throw new Error(
        `${join(folder, main)} does not export a plugin by default`,
      )
    }
    return new (type as new () => Plugin)()
  }

  /**
   * Lists the folders in a directory
   * @param directory The directory
   * @returns The folder names, sorted
   */
  private static async folders(directory: string): Promise<string[]> {
    try {
      const entries = await readdir(directory, { withFileTypes: true })
      return entries
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name)
        .sort()
    } catch {
      return []
    }
  }
}
