import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('flashcards')
    .addColumn('id', 'uuid', (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`),
    )
    .addColumn('user_id', 'uuid', (col) => col.notNull())
    .addColumn('word_id', 'uuid', (col) => col.notNull())
    .addColumn('topic_id', 'uuid')
    .addColumn('status', 'varchar', (col) =>
      col.notNull().check(sql`status IN ('new', 'learning', 'mastered')`),
    )
    .addColumn('next_review_at', 'timestamp', (col) => col.notNull())
    .addColumn('last_reviewed_at', 'timestamp')
    .addColumn('ease_factor', 'float8', (col) => col.notNull())
    .addColumn('interval_days', 'int4', (col) => col.notNull())
    .addColumn('repetitions', 'int4', (col) => col.notNull())
    .addForeignKeyConstraint(
      'flashcards_user_id_fkey',
      ['user_id'],
      'users',
      ['id'],
      (fk) => fk.onDelete('cascade'),
    )
    .addForeignKeyConstraint(
      'flashcards_word_id_fkey',
      ['word_id'],
      'words',
      ['id'],
      (fk) => fk.onDelete('cascade'),
    )
    .addForeignKeyConstraint(
      'flashcards_topic_id_fkey',
      ['topic_id'],
      'topics',
      ['id'],
      (fk) => fk.onDelete('set null'),
    )
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('flashcards').execute();
}
