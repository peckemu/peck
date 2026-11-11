import { defineBuilderMigration } from 'uql-orm/migrate'

import { addChecks } from '#database/checks'

/**
 * Adds den door links to den items
 */
export default defineBuilderMigration({
  /**
   * Applies the migration
   * @param schema The schema builder
   */
  async up(schema) {
    await schema.addColumn('den_items', (columns) =>
      columns.text('user_name_link').notNullable().defaultValue(''),
    )

    await addChecks(schema, 'den_items', {
      _uql_den_items__den_items_user_name_link_check_8bb58e:
        'char_length("user_name_link") <= 60',
    })
  },

  /**
   * Reverts the migration
   * @param schema The schema builder
   */
  async down(schema) {
    await schema.dropColumn('den_items', 'user_name_link')
  },
})
