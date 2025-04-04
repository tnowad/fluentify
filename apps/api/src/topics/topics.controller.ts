import {
  Controller,
  HttpStatus,
  Logger,
  NotImplementedException,
  UseGuards,
} from '@nestjs/common';
import { TsRestHandler, tsRestHandler } from '@ts-rest/nest';
import { topicContract } from '@workspace/contracts';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DatabaseService } from '../database/database.service';
import { CurrentUser, UserPayload } from '../auth/current-user.decorator';

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
      cloneTopic: () => {
        this.logger.warn('cloneTopic not implemented');
        throw new NotImplementedException();
      },
      deleteTopic: () => {
        this.logger.warn('deleteTopic not implemented');
        throw new NotImplementedException();
      },
      getTopicById: () => {
        this.logger.warn('getTopicById not implemented');
        throw new NotImplementedException();
      },
      listMyTopics: () => {
        this.logger.warn('listMyTopics not implemented');
        throw new NotImplementedException();
      },
      listPublicTopics: () => {
        this.logger.warn('listPublicTopics not implemented');
        throw new NotImplementedException();
      },
      listTopicFlashcards: () => {
        this.logger.warn('listTopicFlashcards not implemented');
        throw new NotImplementedException();
      },
      updateTopic: () => {
        this.logger.warn('updateTopic not implemented');
        throw new NotImplementedException();
      },
      uploadExcel: () => {
        this.logger.warn('uploadExcel not implemented');
        throw new NotImplementedException();
      },
    });
  }
}
