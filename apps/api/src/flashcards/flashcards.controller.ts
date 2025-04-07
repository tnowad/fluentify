import {
  Controller,
  HttpStatus,
  Logger,
  UseGuards,
} from '@nestjs/common';
import { TsRestHandler, TsRestException, tsRestHandler } from '@ts-rest/nest';
import { flashcardContract, FlashcardSchema } from '@workspace/contracts';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DatabaseService } from '../database/database.service';
import { CurrentUser, UserPayload } from '../auth/current-user.decorator';
import { randomUUID } from 'crypto';
import { FlashcardsTableSchema } from '../database/schema';
import { z } from 'zod';
import { EbisuService } from '../ebisu/ebisu.service';
import { ClickhouseService } from '../clickhouse/clickhouse.service';
import { QdrantService } from '../qdrant/qdrant.service';
import { Model } from 'ebisu-js/interfaces';

function mapFlashcard(input: z.infer<typeof FlashcardsTableSchema>): z.infer<typeof FlashcardSchema> {
  return {
    id: input.id,
    userId: input.user_id,
    wordId: input.word_id,
    topicId: input.topic_id,
    status: input.status,
    easeFactor: input.ease_factor,
    intervalDays: input.interval_days,
    repetitions: input.repetitions,
    nextReviewAt: input.next_review_at.toISOString(),
    lastReviewedAt: input.last_reviewed_at?.toISOString() ?? null,
  };
}

@Controller()
export class FlashcardsController {
  private readonly logger = new Logger(FlashcardsController.name);

  constructor(
    private readonly db: DatabaseService,
    private readonly ebisu: EbisuService,
    private readonly clickhouse: ClickhouseService,
    private readonly qdrant: QdrantService,
  ) { }

  @TsRestHandler(flashcardContract)
  @UseGuards(JwtAuthGuard)
  handler(@CurrentUser() user: UserPayload) {
    return tsRestHandler(flashcardContract, {
      listMyFlashcards: async ({ query }) => {
        const { topicId, limit, cursor } = query;
        this.logger.log(`Fetching flashcards for user ${user.id} with topicId ${topicId}, limit ${limit}, cursor ${cursor}`);

        const builder = this.db
          .selectFrom('flashcards')
          .selectAll()
          .where('user_id', '=', user.id);

        if (topicId) builder.where('topic_id', '=', topicId);
        if (cursor) builder.where('id', '<', cursor);

        const flashcards = await builder
          .orderBy('id', 'desc')
          .limit(limit)
          .execute();

        const nextCursor = flashcards.length === limit
          ? flashcards[flashcards.length - 1].id
          : null;

        this.logger.log(`Fetched ${flashcards.length} flashcards`);
        return {
          status: HttpStatus.OK,
          body: {
            items: flashcards.map(mapFlashcard),
            nextCursor,
          },
        };
      },

      getFlashcardById: async ({ params }) => {
        const flashcard = await this.db
          .selectFrom('flashcards')
          .selectAll()
          .where('id', '=', params.id)
          .where('user_id', '=', user.id)
          .executeTakeFirst();

        if (!flashcard) {
          this.logger.warn(`Flashcard with id ${params.id} not found for user ${user.id}`);
          throw new TsRestException(flashcardContract.getFlashcardById, {
            status: HttpStatus.NOT_FOUND,
            body: { error: 'Not Found', message: 'Flashcard not found' },
          });
        }

        this.logger.log(`Fetched flashcard with id ${params.id}`);
        return { status: HttpStatus.OK, body: mapFlashcard(flashcard) };
      },

      createFlashcard: async ({ body }) => {
        this.logger.log(`Creating flashcard for wordId ${body.wordId} and topicId ${body.topicId}`);
        const created = await this.db
          .insertInto('flashcards')
          .values({
            id: randomUUID(),
            user_id: user.id,
            word_id: body.wordId,
            topic_id: body.topicId ?? null,
            status: 'new',
            ease_factor: 2.5,
            interval_days: 0,
            repetitions: 0,
            next_review_at: new Date(),
            last_reviewed_at: null,
          })
          .returningAll()
          .executeTakeFirstOrThrow();

        this.logger.log(`Flashcard created with id ${created.id}`);
        return {
          status: HttpStatus.CREATED,
          body: mapFlashcard(created),
        };
      },

      updateFlashcard: async ({ params, body }) => {
        this.logger.log(`Updating flashcard with id ${params.id}`);
        const updated = await this.db
          .updateTable('flashcards')
          .set({
            ...body,
          })
          .where('id', '=', params.id)
          .where('user_id', '=', user.id)
          .returningAll()
          .executeTakeFirst();

        if (!updated) {
          this.logger.warn(`Flashcard with id ${params.id} not found or access denied`);
          throw new TsRestException(flashcardContract.updateFlashcard, {
            status: HttpStatus.NOT_FOUND,
            body: { error: 'Not Found', message: 'Flashcard not found or access denied' },
          });
        }

        this.logger.log(`Flashcard with id ${params.id} updated successfully`);
        return { status: HttpStatus.OK, body: mapFlashcard(updated) };
      },

      deleteFlashcard: async ({ params }) => {
        this.logger.log(`Deleting flashcard with id ${params.id}`);
        const deleted = await this.db
          .deleteFrom('flashcards')
          .where('id', '=', params.id)
          .where('user_id', '=', user.id)
          .returning('id')
          .executeTakeFirst();

        if (!deleted) {
          this.logger.warn(`Flashcard with id ${params.id} not found or access denied`);
          throw new TsRestException(flashcardContract.deleteFlashcard, {
            status: HttpStatus.NOT_FOUND,
            body: { error: 'Not Found', message: 'Flashcard not found or access denied' },
          });
        }

        this.logger.log(`Flashcard with id ${params.id} deleted successfully`);
        return { status: HttpStatus.NO_CONTENT, body: null };
      },

      getDueFlashcards: async ({ query }) => {
        const { topicId, limit, cursor } = query;
        this.logger.log(`Fetching due flashcards for user ${user.id} with topicId ${topicId}, limit ${limit}, cursor ${cursor}`);

        const builder = this.db
          .selectFrom('flashcards')
          .selectAll()
          .where('user_id', '=', user.id)
          .where('next_review_at', '<=', new Date());

        if (topicId) builder.where('topic_id', '=', topicId);
        if (cursor) builder.where('id', '<', cursor);

        const due = await builder
          .orderBy('id', 'desc')
          .limit(limit)
          .execute();

        const nextCursor = due.length === limit
          ? due[due.length - 1].id
          : null;

        this.logger.log(`Fetched ${due.length} due flashcards`);
        return {
          status: HttpStatus.OK,
          body: {
            items: due.map(mapFlashcard),
            nextCursor,
          },
        };
      },

      submitReview: async ({ params, body }) => {
        const now = new Date();
        const { id } = params;
        const { rating, responseTimeMs } = body;

        this.logger.log(`Submitting review for flashcard with id ${id}, rating: ${rating}`);
        const card = await this.db
          .selectFrom('flashcards')
          .selectAll()
          .where('id', '=', id)
          .where('user_id', '=', user.id)
          .executeTakeFirst();

        if (!card) {
          this.logger.warn(`Flashcard with id ${id} not found or access denied`);
          throw new TsRestException(flashcardContract.submitReview, {
            status: HttpStatus.NOT_FOUND,
            body: { error: 'Not Found', message: 'Flashcard not found or access denied' },
          });
        }

        const lastReviewed = card.last_reviewed_at ?? now;
        const elapsedDays = (now.getTime() - lastReviewed.getTime()) / (86400000);

        const defaultModel: Model = this.ebisu.createModel(elapsedDays);
        const currentModel = card.ebisu_model ?? defaultModel;

        const successes = rating === 'forgot' ? 0 : 1;
        const total = 1;
        const newModel = this.ebisu.update(currentModel, successes, total, elapsedDays);
        const nextInterval = this.ebisu.getHalfLife(newModel, 0.5);

        const updated = await this.db
          .updateTable('flashcards')
          .set({
            status: rating === 'forgot'
              ? 'new'
              : card.repetitions + 1 > 5
                ? 'mastered'
                : 'learning',
            repetitions: rating === 'forgot' ? 0 : card.repetitions + 1,
            ease_factor: card.ease_factor,
            interval_days: nextInterval,
            last_reviewed_at: now,
            next_review_at: new Date(now.getTime() + nextInterval * 86400000),
            ebisu_model: newModel,
          })
          .where('id', '=', id)
          .where('user_id', '=', user.id)
          .returningAll()
          .executeTakeFirstOrThrow();

        await this.clickhouse.insertReviewData(
          user.id,
          card.word_id,
          rating,
          card.ease_factor,
          card.interval_days,
          card.repetitions,
          responseTimeMs,
          now.toISOString(),
        );

        await this.qdrant.updateVector(
          user.id,
          card.word_id,
          rating === 'forgot'
            ? [0.1 * Math.min(responseTimeMs / 1000, 1), 0.0, 0.0]
            : rating === 'hard'
              ? [0.5 * Math.min(responseTimeMs / 1000, 1), 0.5 * Math.min(responseTimeMs / 1000, 1), 0.5 * Math.min(responseTimeMs / 1000, 1)]
              : [1.0 * Math.min(responseTimeMs / 1000, 1), 1.0 * Math.min(responseTimeMs / 1000, 1), 1.0 * Math.min(responseTimeMs / 1000, 1)]
        );

        this.logger.log(`Review submitted for flashcard ${id}`);
        return { status: HttpStatus.OK, body: mapFlashcard(updated) };
      },
    });
  }
}
