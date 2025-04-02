import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import { DB } from './schema';

@Injectable()
export class DatabaseService extends Kysely<DB> implements OnModuleDestroy {
  private readonly pool: Pool;

  constructor() {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
    const dialect = new PostgresDialect({ pool });

    super({ dialect });
    this.pool = pool;
  }

  async onModuleDestroy() {
    await this.pool.end();
  }
}
