import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('words')
    .addColumn('id', 'uuid', (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`),
    )
    .addColumn('word', 'varchar', col => col.notNull().unique())
    .addColumn('main_phonetic', 'varchar')
    .addColumn('phonetics', 'jsonb', col => col.notNull())
    .addColumn('definitions', 'jsonb', col => col.notNull())
    .addColumn('examples', 'jsonb', col => col.notNull())
    .addColumn('synonyms', 'jsonb', col => col.notNull())
    .addColumn('audio_url', 'varchar')
    .addColumn('origin', 'varchar')
    .addColumn('source', 'varchar', col => col.notNull())
    .addColumn('last_fetched_at', 'timestamp', col => col.notNull())
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('words').execute();
}
