import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('reviews')
    .addColumn('id', 'uuid', (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`),
    )
    .addColumn('user_id', 'uuid', (col) => col.notNull())
    .addColumn('word_id', 'uuid', (col) => col.notNull())
    .addColumn('rating', 'varchar(10)', (col) =>
      col.notNull().check(sql`rating IN ('forgot', 'hard', 'easy')`),
    )
    .addColumn('response_time_ms', 'int4', (col) => col.notNull())
    .addColumn('reviewed_at', 'timestamptz', (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .addForeignKeyConstraint(
      'reviews_user_id_fkey',
      ['user_id'],
      'users',
      ['id'],
      (fk) => fk.onDelete('cascade'),
    )
    .addForeignKeyConstraint(
      'reviews_word_id_fkey',
      ['word_id'],
      'words',
      ['id'],
      (fk) => fk.onDelete('cascade'),
    )
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('reviews').execute();
}
