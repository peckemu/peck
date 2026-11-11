import { defineBuilderMigration } from 'uql-orm/migrate'

import { addChecks } from '#database/checks'

/**
 * Creates the den room definitions table
 */
export default defineBuilderMigration({
  /**
   * Applies the migration
   * @param schema The schema builder
   */
  async up(schema) {
    await schema.createTable('den_room_definitions', (table) => {
      table.integer('def_id').primaryKey()
      table.text('name').nullable()
      table.integer('title_str_id').notNullable()
      table.integer('room_def_id').notNullable()
      table.smallint('enviro_type').notNullable()
      table.integer('cost').notNullable()
      table.integer('media_ref').notNullable()
      table.integer('icon_media_ref').notNullable()
      table.smallint('status').notNullable()
      table.boolean('members_only').notNullable()
      table.timestamptz('available_from').nullable()
      table.timestamptz('available_until').nullable()
    })

    await addChecks(schema, 'den_room_definitions', {
      _uql_den_room_definitions__den_room_definitions_c_2d41b2_b6b1bb:
        '"cost" >= 0',
    })
  },

  /**
   * Reverts the migration
   * @param schema The schema builder
   */
  async down(schema) {
    await schema.dropTable('den_room_definitions')
  },
})
