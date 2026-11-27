import { type Command, type PluginHost } from '@peck/plugins'

import { BroadcastCommand } from './broadcast/index.ts'
import { ContentImportCommand } from './content/import/index.ts'
import { EcoGiftCommand } from './eco/gift/index.ts'
import { MigrateCommand } from './database/migrate/index.ts'
import { RollbackCommand } from './database/rollback/index.ts'
import { SeedCommand } from './database/seed/index.ts'
import { CatalogueImportCommand } from './catalogue/import/index.ts'
import { PartyEndCommand } from './party/end/index.ts'
import { PlayerRenameCommand } from './player/rename/index.ts'
import { PluginsListCommand } from './plugins/list/index.ts'
import { ShopStockCommand } from './shop/stock/index.ts'
import { ShopUnstockCommand } from './shop/unstock/index.ts'
import { UpdateCommand } from './update/index.ts'
import { CodeCreateCommand } from './code/create/index.ts'
import { CodeListCommand } from './code/list/index.ts'
import { ReferralLevelCommand } from './referral/level/index.ts'

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
  new PartyEndCommand(),
  new BroadcastCommand(),
  new EcoGiftCommand(),
  new ShopStockCommand(),
  new ShopUnstockCommand(),
  new UpdateCommand(plugins),
  new CodeCreateCommand(),
  new CodeListCommand(),
  new ReferralLevelCommand(),
]
