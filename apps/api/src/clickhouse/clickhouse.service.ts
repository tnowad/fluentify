import { Injectable } from '@nestjs/common';
import { createClient, ClickHouseClient } from '@clickhouse/client';

@Injectable()
export class ClickhouseService {
  private readonly client: ClickHouseClient;

  constructor() {
    this.client = createClient({
      url: process.env.CLICKHOUSE_URL!,
    });
  }

  async insert(table: string, values: Record<string, any>[]) {
    try {
      return await this.client.insert({
        table,
        values,
        format: 'JSONEachRow',
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`ClickHouse insert error: ${error.message}`);
      }
      throw new Error('Unknown error during ClickHouse insert');
    }
  }

  async select(sql: string) {
    try {
      const resultSet = await this.client.query({
        query: sql,
        format: 'JSON',
      });
      return await resultSet.json();
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`ClickHouse query error: ${error.message}`);
      }
      throw new Error('Unknown error during ClickHouse query');
    }
  }

  async insertReviewData(
    userId: string,
    wordId: string,
    rating: string,
    easeFactor: number,
    intervalDays: number,
    repetitions: number,
    responseTimeMs: number,
    reviewedAt: string,
  ) {
    return this.insert('flashcard_reviews', [
      {
        user_id: userId,
        word_id: wordId,
        rating,
        ease_factor: easeFactor,
        interval_days: intervalDays,
        repetitions,
        response_time_ms: responseTimeMs,
        reviewed_at: reviewedAt,
      },
    ]);
  }
}
