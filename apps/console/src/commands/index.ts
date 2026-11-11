import { type Command, type PluginHost } from '@peck/plugins'

import { BroadcastCommand } from '#console/commands/broadcast'
import { ContentImportCommand } from '#console/commands/content/import'
import { EcoGiftCommand } from '#console/commands/eco/gift'
import { MigrateCommand } from '#console/commands/database/migrate'
import { RollbackCommand } from '#console/commands/database/rollback'
import { SeedCommand } from '#console/commands/database/seed'
import { CatalogueImportCommand } from '#console/commands/catalogue/import'
import { PartyEndCommand } from '#console/commands/party/end'
import { PlayerRenameCommand } from '#console/commands/player/rename'
import { PluginsListCommand } from '#console/commands/plugins/list'
import { ShopStockCommand } from '#console/commands/shop/stock'
import { ShopUnstockCommand } from '#console/commands/shop/unstock'
import { UpdateCommand } from '#console/commands/update'
import { CodeCreateCommand } from '#console/commands/code/create'
import { CodeListCommand } from '#console/commands/code/list'
import { ReferralLevelCommand } from '#console/commands/referral/level'

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
