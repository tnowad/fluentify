import { Injectable } from '@nestjs/common';
import { createClient } from '@clickhouse/client';

@Injectable()
export class ClickhouseService {
  private client = createClient({
    url: process.env.CLICKHOUSE_URL,
  });
}
