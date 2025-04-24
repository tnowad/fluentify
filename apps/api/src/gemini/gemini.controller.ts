import { Controller, UseGuards, Logger, HttpStatus } from '@nestjs/common';
import { TsRestHandler, tsRestHandler } from '@ts-rest/nest';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, UserPayload } from '../auth/current-user.decorator';
import { GenerativeModel, GoogleGenerativeAI } from '@google/generative-ai';
import { DatabaseService } from '../database/database.service';
import {
  geminiContract,
  HowDoISayRequest,
  HowDoISayResponse,
} from '@workspace/contracts';
import { buildHowDoISayPrompt } from './prompts.inputs';
import { createHash } from 'crypto';
import { uuidv7 } from 'uuidv7';

function hashInput(input: unknown): string {
  const json = JSON.stringify(input);
  return createHash('md5').update(json).digest('hex');
}

@Controller()
export class GeminiController {
  private readonly logger = new Logger(GeminiController.name);
  private readonly genAI: GoogleGenerativeAI;
  private readonly model: GenerativeModel;

  constructor(private readonly db: DatabaseService) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY is not defined');
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  }

  @TsRestHandler(geminiContract)
  @UseGuards(JwtAuthGuard)
  handler(@CurrentUser() user: UserPayload) {
    return tsRestHandler(geminiContract, {
      howDoISay: async ({ body }) => {
        try {
          const cacheKey = hashInput(body);

          const cached = await this.db
            .selectFrom('prompt_histories')
            .select(['response'])
            .where('user_id', '=', user.id)
            .where('type', '=', 'howDoISay')
            .where('input_hash', '=', cacheKey)
            .executeTakeFirst();

          if (cached) {
            this.logger.log('Cache hit for howDoISay:', cacheKey);
            return {
              status: HttpStatus.OK,
              body: HowDoISayResponse.parse(cached.response),
            };
          }

          this.logger.log(`Cache miss. Generating for user: ${user.id}`);
          const { text, validate } = buildHowDoISayPrompt(body);
          this.logger.debug('Prompt sent to Gemini:\n' + text);

          const { response } = await this.model.generateContent([text]);
          const rawOutput = response.text();
          this.logger.debug('Raw Gemini response:\n' + rawOutput);

          const parsedResponse = validate(rawOutput);

          await this.db
            .insertInto('prompt_histories')
            .values({
              id: uuidv7(),
              user_id: user.id,
              type: 'howDoISay',
              input: body,
              input_hash: cacheKey,
              response: parsedResponse,
              created_at: new Date(),
            })
            .execute();

          return {
            status: HttpStatus.OK,
            body: parsedResponse,
          };
        } catch (error) {
          this.logger.error('Error processing howDoISay:', error);
          return {
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            body: { message: 'Gemini response processing failed' },
          };
        }
      },

      historyHowDoISay: async () => {
        try {
          this.logger.log('historyHowDoISay called');
          const histories = await this.db
            .selectFrom('prompt_histories')
            .selectAll()
            .orderBy('created_at', 'desc')
            .execute();

          this.logger.debug('Prompt history fetched:', histories);

          return {
            status: HttpStatus.OK,
            body: histories.map((item) => {
              const { input } = item;

              const parsedInput = HowDoISayRequest.parse(input);

              return {
                id: item.id,
                context: parsedInput.context,
                originalSentence: parsedInput.originalSentence,
                createdAt: item.created_at.toISOString(),
              };
            }),
          };
        } catch (error) {
          this.logger.error('Error fetching prompt history:', error);
          return {
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            body: { message: 'Failed to fetch prompt history' },
          };
        }
      },
    });
  }
}
