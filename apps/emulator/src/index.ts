import { PluginLoader } from '@peck/plugins'

import { config } from '#emulator/config'
import { Emulator } from '#emulator/emulator'

const plugins = await PluginLoader.discover(
  config.plugins.directory,
  config.plugins.enabled,
)
const emulator = new Emulator(config, plugins)
await emulator.start()

/**
 * Stops the emulator and exits
 */
const stop = async (): Promise<void> => {
  await emulator.stop()
  process.exit(0)
}

process.on('SIGINT', () => void stop())
process.on('SIGTERM', () => void stop())
