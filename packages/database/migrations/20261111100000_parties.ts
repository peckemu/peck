import { defineBuilderMigration } from 'uql-orm/migrate'

import { addChecks } from '#database/checks'

/**
 * Creates the party tables
 */
export default defineBuilderMigration({
  /**
   * Applies the migration
   * @param schema The schema builder
   */
  async up(schema) {
    await schema.createTable('party_definitions', (table) => {
      table.integer('def_id').primaryKey()
      table.text('name').nullable()
      table.integer('title_str_id').notNullable()
      table.integer('media_ref_id').notNullable()
      table.integer('icon_media_ref_id').notNullable()
      table.smallint('restrictions').notNullable()
      table.text('avatar_def_flags').notNullable()
      table.jsonb('pet_def_scalable_flags').notNullable()
      table.boolean('is_game').notNullable()
      table.boolean('is_custom').notNullable()
      table.integer('room_def_id').notNullable()
    })

    await schema.createTable('party_schedule', (table) => {
      table.integer('id').primaryKey().autoIncrement()
      table.integer('party_def_id').notNullable()
      table.timestamptz('starts_at').notNullable()
      table.timestamptz('ends_at').notNullable()
      table.text('repeat').notNullable()
      table.boolean('members_only').notNullable().defaultValue(false)
    })

    await addChecks(schema, 'party_schedule', {
      _uql_party_schedule__party_schedule_def_id_check_622dd3:
        '"party_def_id" > 0',
      _uql_party_schedule__repeat_91f9ec: `"repeat" IN ('none', 'daily', 'weekly', 'yearly')`,
    })
  },

  /**
   * Reverts the migration
   * @param schema The schema builder
   */
  async down(schema) {
    await schema.dropTable('party_schedule')
    await schema.dropTable('party_definitions')
  },
})
