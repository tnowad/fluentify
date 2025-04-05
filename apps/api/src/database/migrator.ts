import 'dotenv/config';
import { promises as fs } from 'fs';
import { Kysely, Migrator, PostgresDialect, FileMigrationProvider } from 'kysely';
import * as path from 'path';
import { Pool } from 'pg';
import { DB } from './schema';

const command: string = process.argv[2] || 'latest';

/**
 * Creates a new Kysely instance for the database connection.
 */
async function createDbInstance(): Promise<Kysely<DB>> {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  return new Kysely<DB>({
    dialect: new PostgresDialect({ pool }),
  });
}

/**
 * Run migrations in the specified direction and steps.
 * 
 * @param migrator Migrator instance.
 * @param direction Direction of migration ('up' or 'down').
 * @param steps Number of steps to run the migration.
 */
async function runMigration(
  migrator: Migrator,
  direction: 'up' | 'down',
  steps: number = 1
): Promise<void> {
  for (let i = 0; i < steps; i++) {
    const { error, results } = direction === 'down'
      ? await migrator.migrateDown()
      : await migrator.migrateToLatest();

    if (error) {
      if (error instanceof Error) {
        console.error(`❌ Migration error: ${error.message}`);
      }
      throw new Error(`Migration failed`);
    }

    if (results && results.length > 0) {
      results.forEach((result) => {
        const statusMessage =
          result.status === 'Success'
            ? `${result.migrationName} migration successful.`
            : `Failed to apply migration: ${result.migrationName}`;
        console.log(statusMessage);
      });
    } else {
      console.log(`❌ No migration results found.`);
    }

    if (!results?.length || results[0].status === 'NotExecuted') break;
  }
}

/**
 * Resets the database by rolling back all migrations.
 */
async function resetMigrations(migrator: Migrator): Promise<void> {
  while (true) {
    const { error, results } = await migrator.migrateDown();

    if (error) {
      console.error('❌ Error during reset:', error);
      throw new Error(`Reset migration failed`);
    }

    if (!results?.length || results[0].status === 'NotExecuted') break;
    console.log(`↩️  Reset migration: "${results[0].migrationName}" rolled back.`);
  }
}

/**
 * Displays the help message for usage instructions.
 */
function logHelp(): void {
  console.log(`
Commands:
  latest         Migrate to the latest version.
  down           Rollback the last migration.
  down:<steps>   Rollback a specific number of migrations (e.g., down:3).
  reset          Rollback all migrations.
  help           Show this help message.
`);
}

/**
 * Handles the migration command based on the argument provided.
 * 
 * @param db The Kysely database instance.
 * @param migrator The Migrator instance.
 * @param command The migration command to execute.
 */
async function handleMigrationCommand(
  db: Kysely<DB>,
  migrator: Migrator,
  command: string
): Promise<void> {
  switch (command) {
    case 'latest':
      console.log('Starting migration to the latest version...');
      await runMigration(migrator, 'up');
      break;

    case 'help':
      logHelp();
      break;

    case 'reset':
      console.log('Resetting database migrations...');
      await resetMigrations(migrator);
      break;

    default:
      if (command.startsWith('down')) {
        const steps = command === 'down' ? 1 : parseInt(command.split(':')[1] || '1', 10);
        console.log(`Rolling back ${steps} migration(s)...`);
        await runMigration(migrator, 'down', steps);
      } else {
        console.error(`❓ Unknown command "${command}". Use "help" for available commands.`);
        process.exit(1);
      }
      break;
  }
}

/**
 * Main entry point of the migration script.
 */
async function main(): Promise<void> {
  console.log('Starting migration script...');

  const db = await createDbInstance();
  const migrator = new Migrator({
    db,
    provider: new FileMigrationProvider({
      fs,
      path,
      migrationFolder: path.join(__dirname, 'migrations'),
    }),
  });

  try {
    await handleMigrationCommand(db, migrator, command);
  } catch (err) {
    console.error('❌ Migration error:', err);
    process.exit(1);
  } finally {
    console.log('Cleaning up and closing DB connection...');
    await db.destroy();
  }
}

void main();
