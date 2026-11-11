import { defineBuilderMigration } from 'uql-orm/migrate'

import { addChecks } from '#database/checks'

/**
 * Creates the avatar definitions table
 */
export default defineBuilderMigration({
  /**
   * Applies the migration
   * @param schema The schema builder
   */
  async up(schema) {
    await schema.createTable('avatar_definitions', (table) => {
      table.integer('def_id').primaryKey()
      table.text('name').nullable()
      table.integer('title_str_id').notNullable()
      table.jsonb('colors').notNullable()
      table.integer('eyes_def_id').notNullable()
      table.integer('pattern_def_id').notNullable()
      table.boolean('members_only').notNullable()
      table.smallint('enviro_type_flags').notNullable()
      table.integer('cost').notNullable()
      table.smallint('availability').notNullable()
      table.smallint('status').notNullable()
    })

    await addChecks(schema, 'avatar_definitions', {
      _uql_avatar_definitions__avatar_definitions_cost_check_b6b1bb:
        '"cost" >= 0',
    })
  },

  /**
   * Reverts the migration
   * @param schema The schema builder
   */
  async down(schema) {
    await schema.dropTable('avatar_definitions')
  },
})
