import {
  Controller,
  HttpStatus,
  Logger,
  NotImplementedException,
  UseGuards,
} from '@nestjs/common';
import { TsRestException, TsRestHandler, tsRestHandler } from '@ts-rest/nest';
import { topicContract } from '@workspace/contracts';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DatabaseService } from '../database/database.service';
import { CurrentUser, UserPayload } from '../auth/current-user.decorator';
import { randomUUID } from 'crypto';
import { sql } from 'kysely';

@Controller()
export class TopicsController {
  private readonly logger = new Logger(TopicsController.name);

  constructor(private readonly db: DatabaseService) {}

  @TsRestHandler(topicContract)
  @UseGuards(JwtAuthGuard)
  handler(@CurrentUser() user: UserPayload) {
    return tsRestHandler(topicContract, {
      createTopic: async ({ body }) => {
        this.logger.log(`Creating topic: "${body.name}" by user ${user.id}`);
        this.logger.debug(`Payload: ${JSON.stringify(body)}`);

        const topic = await this.db
          .insertInto('topics')
          .values({
            id: randomUUID(),
            name: body.name,
            description: body.description,
            is_public: body.isPublic,
            created_by: user.id,
            created_at: sql`now()`,
          })
          .returningAll()
          .executeTakeFirstOrThrow();

        this.logger.log(`Topic created with ID: ${topic.id}`);
        this.logger.debug(`DB response: ${JSON.stringify(topic)}`);

        return {
          status: HttpStatus.CREATED,
          body: {
            id: topic.id,
            name: topic.name,
            description: topic.description,
            isPublic: topic.is_public,
            createdAt: topic.created_at.toISOString(),
            createdBy: topic.created_by,
          },
        };
      },

      deleteTopic: async ({ params }) => {
        this.logger.log(`Deleting topic: ${params.id} by user ${user.id}`);
        const deleted = await this.db
          .deleteFrom('topics')
          .where('id', '=', params.id)
          .where('created_by', '=', user.id)
          .returningAll()
          .executeTakeFirst();

        if (!deleted) {
          throw new TsRestException(topicContract.deleteTopic, {
            status: HttpStatus.NOT_FOUND,
            body: {
              error: 'Not Found',
              message: 'Topic not found or not owned by user',
            },
          });
        }

        return { status: HttpStatus.NO_CONTENT, body: null };
      },

      getTopicById: async ({ params }) => {
        const topic = await this.db
          .selectFrom('topics')
          .selectAll()
          .where('id', '=', params.id)
          .where((eb) =>
            eb.or([eb('is_public', '=', true), eb('created_by', '=', user.id)]),
          )
          .executeTakeFirst();

        if (!topic) {
          this.logger.warn(`Unauthorized or not found topic: ${params.id}`);
          throw new TsRestException(topicContract.getTopicById, {
            status: HttpStatus.NOT_FOUND,
            body: {
              error: 'Not Found',
              message: 'Topic not found or access denied',
            },
          });
        }

        const [countRes, progressRes, lastStudiedRes] = await Promise.all([
          this.db
            .selectFrom('flashcards')
            .select((eb) => eb.fn.countAll().as('count'))
            .where('topic_id', '=', topic.id)
            .where('user_id', '=', user.id)
            .executeTakeFirst(),

          this.db
            .selectFrom('flashcards')
            .select((eb) => eb.fn.avg('repetitions').as('progress'))
            .where('topic_id', '=', topic.id)
            .where('user_id', '=', user.id)
            .executeTakeFirst(),

          this.db
            .selectFrom('reviews')
            .innerJoin('flashcards', 'flashcards.id', 'reviews.flashcard_id')
            .select((eb) => eb.fn.max('reviewed_at').as('lastStudiedAt'))
            .where('flashcards.topic_id', '=', topic.id)
            .where('reviews.user_id', '=', user.id)
            .executeTakeFirst(),
        ]);

        return {
          status: HttpStatus.OK,
          body: {
            id: topic.id,
            name: topic.name,
            description: topic.description,
            isPublic: topic.is_public,
            createdAt: topic.created_at.toISOString(),
            createdBy: topic.created_by,
            count: Number(countRes?.count ?? 0),
            progress: Number(progressRes?.progress ?? 0),
            lastStudiedAt: lastStudiedRes?.lastStudiedAt
              ? new Date(lastStudiedRes.lastStudiedAt).toISOString()
              : null,
          },
        };
      },

      listMyTopics: async ({ query }) => {
        const { limit, cursor, search } = query;
        const builder = this.db
          .selectFrom('topics')
          .selectAll()
          .where('created_by', '=', user.id);

        if (search) {
          builder.where('name', 'ilike', `%${search}%`);
        }

        if (cursor) {
          builder.where('id', '<', cursor);
        }

        const items = await builder
          .orderBy('id', 'desc')
          .limit(limit)
          .execute();

        const nextCursor =
          items.length === limit ? items[items.length - 1].id : null;

        return {
          status: HttpStatus.OK,
          body: {
            items: items.map((t) => ({
              id: t.id,
              name: t.name,
              description: t.description,
              isPublic: t.is_public,
              createdAt: t.created_at.toISOString(),
              createdBy: t.created_by,
            })),
            nextCursor,
          },
        };
      },

      listPublicTopics: async ({ query }) => {
        const { limit, cursor, search } = query;
        const builder = this.db
          .selectFrom('topics')
          .selectAll()
          .where('is_public', '=', true);

        if (search) {
          builder.where('name', 'ilike', `%${search}%`);
        }

        if (cursor) {
          builder.where('id', '<', cursor);
        }

        const items = await builder
          .orderBy('id', 'desc')
          .limit(limit)
          .execute();

        const nextCursor =
          items.length === limit ? items[items.length - 1].id : null;

        return {
          status: HttpStatus.OK,
          body: {
            items: items.map((t) => ({
              id: t.id,
              name: t.name,
              description: t.description,
              isPublic: t.is_public,
              createdAt: t.created_at.toISOString(),
              createdBy: t.created_by,
            })),
            nextCursor,
          },
        };
      },

      updateTopic: async ({ params, body }) => {
        this.logger.log(`Updating topic: ${params.id} by user ${user.id}`);

        const updated = await this.db
          .updateTable('topics')
          .set({
            name: body.name,
            description: body.description,
            is_public: body.isPublic,
          })
          .where('id', '=', params.id)
          .where('created_by', '=', user.id)
          .returningAll()
          .executeTakeFirst();

        if (!updated) {
          this.logger.warn(`Unauthorized or not found topic: ${params.id}`);
          throw new TsRestException(topicContract.updateTopic, {
            status: HttpStatus.NOT_FOUND,
            body: {
              error: 'Not Found',
              message: 'Topic not found or access denied',
            },
          });
        }

        return {
          status: HttpStatus.OK,
          body: {
            id: updated.id,
            name: updated.name,
            description: updated.description,
            isPublic: updated.is_public,
            createdAt: updated.created_at.toISOString(),
            createdBy: updated.created_by,
          },
        };
      },

      cloneTopic: async ({ params }) => {
        const original = await this.db
          .selectFrom('topics')
          .selectAll()
          .where('id', '=', params.id)
          .where((eb) =>
            eb.or([eb('is_public', '=', true), eb('created_by', '=', user.id)]),
          )
          .executeTakeFirst();

        if (!original) {
          throw new TsRestException(topicContract.cloneTopic, {
            status: HttpStatus.NOT_FOUND,
            body: {
              error: 'Not Found',
              message: 'Topic not found or access denied',
            },
          });
        }

        const clonedTopic = await this.db
          .insertInto('topics')
          .values({
            id: randomUUID(),
            name: `${original.name} (Clone)`,
            description: original.description,
            is_public: false,
            created_by: user.id,
            created_at: sql`now()`,
          })
          .returningAll()
          .executeTakeFirstOrThrow();

        const flashcards = await this.db
          .selectFrom('flashcards')
          .selectAll()
          .where('user_id', '=', original.created_by)
          .where('topic_id', '=', original.id)
          .execute();

        for (const card of flashcards) {
          await this.db
            .insertInto('flashcards')
            .values({
              id: randomUUID(),
              user_id: user.id,
              topic_id: clonedTopic.id,
              status: 'new',
              next_review_at: new Date(),
              last_reviewed_at: null,
              ease_factor: 2.5,
              interval_days: 0,
              repetitions: 0,
              ebisu_model: null,

              word: card.word,
              definition: card.definition,
              image_url: card.image_url,
              part_of_speech: card.part_of_speech,
              phonetic: card.phonetic,
              examples: card.examples,
              note: card.note,
            })
            .execute();
        }

        return {
          status: HttpStatus.CREATED,
          body: {
            id: clonedTopic.id,
            name: clonedTopic.name,
            description: clonedTopic.description,
            isPublic: clonedTopic.is_public,
            createdAt: clonedTopic.created_at.toISOString(),
            createdBy: clonedTopic.created_by,
          },
        };
      },

      listTopicFlashcards: async ({ params, query }) => {
        const { limit, cursor } = query;

        const topic = await this.db
          .selectFrom('topics')
          .select(['id', 'created_by', 'is_public'])
          .where('id', '=', params.id)
          .executeTakeFirst();

        if (!topic || (!topic.is_public && topic.created_by !== user.id)) {
          throw new TsRestException(topicContract.listTopicFlashcards, {
            status: HttpStatus.NOT_FOUND,
            body: {
              error: 'Not Found',
              message: 'Topic not found or access denied',
            },
          });
        }

        let builder = this.db
          .selectFrom('flashcards')
          .selectAll()
          .where('topic_id', '=', params.id)
          .where('user_id', '=', user.id);

        if (cursor) {
          builder = builder.where('id', '<', cursor);
        }

        const flashcards = await builder
          .orderBy('id', 'desc')
          .limit(limit)
          .execute();

        const nextCursor =
          flashcards.length === limit
            ? flashcards[flashcards.length - 1].id
            : null;

        return {
          status: HttpStatus.OK,
          body: {
            items: flashcards.map((card) => ({
              id: card.id,
              topicId: card.topic_id,
              userId: card.user_id,
              status: card.status,
              nextReviewAt: card.next_review_at.toISOString(),
              lastReviewedAt: card.last_reviewed_at?.toISOString() ?? null,
              easeFactor: card.ease_factor,
              intervalDays: card.interval_days,
              repetitions: card.repetitions,

              word: card.word,
              definition: card.definition,
              imageUrl: card.image_url,
              partOfSpeech: card.part_of_speech,
              phonetic: card.phonetic,
              examples: card.examples,
              note: card.note,
            })),
            nextCursor,
          },
        };
      },

      uploadExcel: () => {
        // TODO: Implement file upload + parse logic (e.g., xlsx or csv)
        throw new NotImplementedException(
          'Excel upload is not implemented yet.',
        );
      },
    });
  }
}
