import { Controller, HttpStatus, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { wordContract } from '@workspace/contracts';
import { tsRestHandler, TsRestHandler } from '@ts-rest/nest';
import axios from 'axios';
import { randomUUID } from 'crypto';
import { TsRestResponseError } from '@ts-rest/core';
import { sql } from 'kysely';

export type DictionaryApiResponse = DictionaryEntry[];

export interface DictionaryEntry {
  word: string;
  phonetic?: string;
  phonetics: {
    text?: string;
    audio?: string;
    sourceUrl?: string;
  }[];
  meanings: {
    partOfSpeech: string;
    definitions: {
      definition: string;
      example?: string;
      synonyms?: string[];
      antonyms?: string[];
    }[];
    synonyms: string[];
    antonyms: string[];
  }[];
  origin?: string;
  sourceUrls: string[];
}

@Controller()
export class WordsController {
  private readonly logger = new Logger(WordsController.name);

  constructor(private readonly db: DatabaseService) { }

  @TsRestHandler(wordContract)
  handler() {
    return tsRestHandler(wordContract, {
      getWord: async ({ params }) => {
        const word = params.word.toLowerCase();
        this.logger.log(`Fetching word: ${word}`);

        const cached = await this.db
          .selectFrom('words')
          .selectAll()
          .where('word', '=', word)
          .executeTakeFirst();

        if (cached) {
          this.logger.log(`Cache hit for word: ${word}`);
          this.logger.debug(`Cached data: ${JSON.stringify(cached)}`);
          return {
            status: HttpStatus.OK, body: {
              id: cached.id,
              phonetics: cached.phonetics,
              definitions: cached.definitions,
              word: cached.word,
              lastFetchedAt: cached.last_fetched_at.toISOString(),
              audioUrl: cached.audio_url,
              source: cached.source,
              origin: cached.origin
            }
          };
        }

        try {
          const { data } = await axios.get<DictionaryApiResponse>(
            `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
          );

          this.logger.debug(`API raw response: ${JSON.stringify(data[0])}`);

          const entry = data[0];

          const definitions = entry.meanings.flatMap((meaning) =>
            meaning.definitions.map((def) => ({
              definition: def.definition,
              example: def.example ?? undefined,
              partOfSpeech: meaning.partOfSpeech,
            }))
          );

          const phonetics = entry.phonetics
            .map((p) => p.text)
            .filter((t): t is string => Boolean(t));

          const audio_url =
            entry.phonetics.find((p) => p.audio)?.audio ?? null;

          this.logger.debug(`Prepared definitions: ${JSON.stringify(definitions)}`);
          this.logger.debug(`Phonetics: ${JSON.stringify(phonetics)}`);
          this.logger.debug(`Audio URL: ${audio_url}`);

          const newWord = await this.db
            .insertInto('words')
            .values({
              word,
              definitions: sql`${JSON.stringify(definitions)}`,
              phonetics: sql`${JSON.stringify(phonetics)}`,
              audio_url,
              origin: entry.origin ?? null,
              source: 'dictionaryapi.dev',
              last_fetched_at: new Date()
            })
            .returningAll()
            .executeTakeFirstOrThrow();

          this.logger.log(`Inserted word into DB: ${newWord.word}`);
          this.logger.debug(`DB response: ${JSON.stringify(newWord)}`);

          return {
            status: HttpStatus.OK, body: {
              id: newWord.id,
              phonetics: newWord.phonetics,
              definitions: newWord.definitions,
              word: newWord.word,
              lastFetchedAt: newWord.last_fetched_at.toISOString(),
              audioUrl: newWord.audio_url,
              source: newWord.source,
              origin: newWord.origin
            }
          };
        } catch (err) {
          this.logger.warn(`Word not found in API: ${word}`);
          this.logger.debug(`Error detail: ${err instanceof Error ? err.message : String(err)}`);
          throw new TsRestResponseError(wordContract.getWord, {
            status: HttpStatus.NOT_FOUND,
            body: {
              error: 'Not Found',
              message: 'Word not found',
            },
          });
        }
      },
    });
  }
}
