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

@Controller()
export class TopicsController {
  private readonly logger = new Logger(TopicsController.name);

  constructor(private readonly db: DatabaseService) { }

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
            name: body.name,
            description: body.description,
            is_public: body.isPublic,
            created_by: user.id,
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
            status: HttpStatus.NOT_FOUND, body: {
              error: "Not Found",
              message: "Topic not found or not owned by user",
            }
          })
        }

        return { status: HttpStatus.NO_CONTENT, body: null };
      },

      getTopicById: async ({ params }) => {
        const topic = await this.db
          .selectFrom('topics')
          .selectAll()
          .where('id', '=', params.id)
          .where((eb) =>
            eb.or([
              eb('is_public', '=', true),
              eb('created_by', '=', user.id),
            ])
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

        return {
          status: HttpStatus.OK,
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

      listMyTopics: async () => {
        const topics = await this.db
          .selectFrom('topics')
          .selectAll()
          .where('created_by', '=', user.id)
          .orderBy('created_at', 'desc')
          .execute();

        return {
          status: HttpStatus.OK,
          body: {
            items: topics.map((topic) => ({
              id: topic.id,
              name: topic.name,
              description: topic.description,
              isPublic: topic.is_public,
              createdAt: topic.created_at.toISOString(),
              createdBy: topic.created_by,
            })),
            total: topics.length,
          },
        };
      },

      listPublicTopics: async () => {
        const topics = await this.db
          .selectFrom('topics')
          .selectAll()
          .where('is_public', '=', true)
          .orderBy('created_at', 'desc')
          .execute();

        return {
          status: HttpStatus.OK,
          body: {
            items: topics.map((topic) => ({
              id: topic.id,
              name: topic.name,
              description: topic.description,
              isPublic: topic.is_public,
              createdAt: topic.created_at.toISOString(),
              createdBy: topic.created_by,
            })),
            total: topics.length,
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

      cloneTopic: () => {
        this.logger.warn('cloneTopic not implemented');
        throw new NotImplementedException();
      },
      listTopicFlashcards: () => {
        this.logger.warn('listTopicFlashcards not implemented');
        throw new NotImplementedException();
      },
      uploadExcel: () => {
        this.logger.warn('uploadExcel not implemented');
        throw new NotImplementedException();
      },
    });
  }
}
