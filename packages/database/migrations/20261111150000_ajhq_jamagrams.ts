import { defineBuilderMigration } from 'uql-orm/migrate'

/**
 * Lets AJHQ send Jam-a-Grams
 */
export default defineBuilderMigration({
  /**
   * Applies the migration
   * @param schema The schema builder
   */
  async up(schema) {
    await schema.raw(`
      ALTER TABLE "jamagrams" ADD COLUMN "sender_type" SMALLINT NOT NULL DEFAULT 0;
      ALTER TABLE "jamagrams" ALTER COLUMN "from_game_id" DROP NOT NULL;
    `)
  },

  /**
   * Reverts the migration
   * @param schema The schema builder
   */
  async down(schema) {
    await schema.raw(`
      DELETE FROM "jamagrams" WHERE "from_game_id" IS NULL;
      ALTER TABLE "jamagrams" ALTER COLUMN "from_game_id" SET NOT NULL;
      ALTER TABLE "jamagrams" DROP COLUMN "sender_type";
    `)
  },
})
