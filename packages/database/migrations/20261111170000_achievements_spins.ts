import { defineBuilderMigration } from 'uql-orm/migrate'

import { addChecks } from '#database/checks'

/**
 * Creates the achievement definitions and the daily spin transaction
 */
export default defineBuilderMigration({
  /**
   * Applies the migration
   * @param schema The schema builder
   */
  async up(schema) {
    await schema.createTable('achievement_definitions', (table) => {
      table.integer('def_id').primaryKey()
      table.text('name').nullable()
      table.integer('title_str_ref').notNullable()
      table.smallint('type').notNullable()
      table.integer('user_var_ref').notNullable()
      table.integer('trigger_amount').notNullable()
    })

    await schema.createIndex('achievement_definitions', ['user_var_ref'], {
      name: 'achievement_definitions_user_var',
    })

    await schema.raw(
      'ALTER TABLE "transactions" DROP CONSTRAINT "_uql_transactions__kind_c2e5ed"',
    )
    await addChecks(schema, 'transactions', {
      _uql_transactions__kind_1928e3: `"kind" IN ('eco-credits', 'eco-gift', 'photo-booth', 'buy', 'bundle', 'exchange', 'donation', 'recycle', 'den-shop-purchase', 'den-shop-sale', 'party-host', 'pet-salon', 'masterpiece-refund', 'daily-spin')`,
    })
  },

  /**
   * Reverts the migration
   * @param schema The schema builder
   */
  async down(schema) {
    await schema.raw(`DELETE FROM "transactions" WHERE "kind" = 'daily-spin'`)
    await schema.raw(
      'ALTER TABLE "transactions" DROP CONSTRAINT "_uql_transactions__kind_1928e3"',
    )
    await addChecks(schema, 'transactions', {
      _uql_transactions__kind_c2e5ed: `"kind" IN ('eco-credits', 'eco-gift', 'photo-booth', 'buy', 'bundle', 'exchange', 'donation', 'recycle', 'den-shop-purchase', 'den-shop-sale', 'party-host', 'pet-salon', 'masterpiece-refund')`,
    })
    await schema.dropTable('achievement_definitions')
  },
})
