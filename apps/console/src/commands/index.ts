import { type Command, type PluginHost } from '@peck/plugins'

import { ContentImportCommand } from '#console/commands/content/import'
import { MigrateCommand } from '#console/commands/database/migrate'
import { RollbackCommand } from '#console/commands/database/rollback'
import { SeedCommand } from '#console/commands/database/seed'
import { CatalogueImportCommand } from '#console/commands/catalogue/import'
import { PlayerRenameCommand } from '#console/commands/player/rename'
import { PluginsListCommand } from '#console/commands/plugins/list'
import { ShopStockCommand } from '#console/commands/shop/stock'
import { ShopUnstockCommand } from '#console/commands/shop/unstock'

/**
 * Builds the core commands
 * @param plugins The plugins
 * @returns The commands
 */
export const commands = (plugins: PluginHost): Command[] => [
  new ContentImportCommand(),
  new CatalogueImportCommand(),
  new MigrateCommand(plugins),
  new RollbackCommand(plugins),
  new SeedCommand(plugins),
  new PluginsListCommand(plugins),
  new PlayerRenameCommand(),
  new ShopStockCommand(),
  new ShopUnstockCommand(),
]
