import { currentTimestamp, uuid } from 'uql-orm'
import { defineBuilderMigration } from 'uql-orm/migrate'

import { addChecks } from '#database/checks'

/**
 * Creates the roles table
 */
export default defineBuilderMigration({
  /**
   * Applies the migration
   * @param schema The schema builder
   */
  async up(schema) {
    await schema.createTable('roles', (table) => {
      table.uuid('id').primaryKey().defaultValue(uuid)
      table.text('key').nullable().unique()
      table.text('name').notNullable()
      table.text('description').notNullable().defaultValue('')
      table.text('color').notNullable()
      table.smallint('rank').notNullable()
      table.boolean('built_in').notNullable().defaultValue(false)
      table
        .uuid('created_by')
        .nullable()
        .references('accounts', 'id')
        .onDelete('SET NULL')
      table
        .timestamptz('created_at')
        .notNullable()
        .defaultValue(currentTimestamp)
      table
        .timestamptz('updated_at')
        .notNullable()
        .defaultValue(currentTimestamp)
      table.index(['created_by'], 'roles__created_by_idx')
    })

    await addChecks(schema, 'roles', {
      _uql_roles__roles_name_check_f36413:
        'char_length(btrim("name")) BETWEEN 1 AND 40',
      _uql_roles__roles_description_check_26f234:
        'char_length("description") <= 280',
      _uql_roles__roles_color_check_78acd3: `"color" ~ '^#[0-9a-fA-F]{6}$'`,
      _uql_roles__roles_rank_check_8dc87a: '"rank" BETWEEN 1 AND 100',
      _uql_roles__roles_built_in_check_0d288a:
        '"built_in" = ("key" IS NOT NULL)',
      _uql_roles__roles_owner_check_1836ad: '"built_in" OR "rank" < 100',
    })
  },

  /**
   * Reverts the migration
   * @param schema The schema builder
   */
  async down(schema) {
    await schema.dropTable('roles')
  },
})
