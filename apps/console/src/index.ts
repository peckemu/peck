import { join } from 'node:path'

import { PluginHost, PluginLoader } from '@peck/plugins'

import { commands } from '#console/commands'
import { Console } from '#console/console'

/**
 * The plugins folder
 */
const PLUGINS =
  Bun.env['PLUGINS_DIR'] ?? join(import.meta.dir, '../../../plugins')

const enabled = Bun.env['PLUGINS']
  ? Bun.env['PLUGINS'].split(',').map((name) => name.trim())
  : null
const plugins = new PluginHost(await PluginLoader.discover(PLUGINS, enabled))

process.exitCode = await new Console([
  ...commands(plugins),
  ...plugins.commands,
]).run(process.argv.slice(2))
