import { Controller, HttpStatus, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { wordContract } from '@workspace/contracts';
import { tsRestHandler, TsRestHandler } from '@ts-rest/nest';
import axios from 'axios';
import { TsRestResponseError } from '@ts-rest/core';
import { sql } from 'kysely';

export type DictionaryApiResponse = {
  word: string;
  phonetic?: string;
  phonetics: { text?: string; audio?: string }[];
  meanings: {
    partOfSpeech: string;
    definitions: {
      definition: string;
      example?: string;
      synonyms?: string[];
    }[];
    synonyms: string[];
  }[];
  origin?: string;
  sourceUrls: string[];
}[];

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
          return {
            status: HttpStatus.OK,
            body: {
              id: cached.id,
              word: cached.word,
              phonetics: cached.phonetics,
              definitions: cached.definitions,
              audioUrl: cached.audio_url,
              origin: cached.origin,
              source: cached.source,
              lastFetchedAt: cached.last_fetched_at.toISOString(),
              mainPhonetic: cached.main_phonetic,
              examples: cached?.examples,
              synonyms: cached?.synonyms,
            },
          };
        }

        try {
          const { data } = await axios.get<DictionaryApiResponse>(
            `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
          );
          const entry = data[0];

          const definitions = entry.meanings.flatMap((meaning) =>
            meaning.definitions.map((def) => ({
              definition: def.definition,
              example: def.example ?? undefined,
              partOfSpeech: meaning.partOfSpeech,
            }))
          );

          const examples = definitions
            .map((d) => d.example)
            .filter((e): e is string => Boolean(e));

          const synonyms = Array.from(
            new Set(
              entry.meanings.flatMap((m) => [
                ...m.synonyms,
                ...m.definitions.flatMap((d) => d.synonyms ?? []),
              ])
            )
          );

          const phonetics = entry.phonetics
            .map((p) => p.text)
            .filter((t): t is string => Boolean(t));

          const audio_url = entry.phonetics.find((p) => p.audio)?.audio ?? null;
          const main_phonetic = entry.phonetic ?? phonetics[0] ?? null;

          const aiFeedback = {
            commonMistakes: "Often confused with similar-sounding words.",
            grammarTips: "This verb should be followed by a direct object.",
            usageTips: "Commonly used in formal and academic contexts.",
          };

          const relatedWords = [
            { word: "Facilitation", partOfSpeech: "noun" },
            { word: "Facilitator", partOfSpeech: "noun" },
            { word: "Facilitating", partOfSpeech: "adjective" },
          ];

          const inserted = await this.db
            .insertInto('words')
            .values({
              word,
              main_phonetic,
              phonetics: sql`${JSON.stringify(phonetics)}`,
              definitions: sql`${JSON.stringify(definitions)}`,
              examples: sql`${JSON.stringify(examples)}`,
              synonyms: sql`${JSON.stringify(synonyms)}`,
              origin: entry.origin ?? null,
              audio_url,
              source: 'dictionaryapi.dev',
              last_fetched_at: new Date(),
            })
            .returningAll()
            .executeTakeFirstOrThrow();

          return {
            status: HttpStatus.OK,
            body: {
              id: inserted.id,
              word: inserted.word,
              phonetics: inserted.phonetics,
              definitions: inserted.definitions,
              audioUrl: inserted.audio_url,
              origin: inserted.origin,
              source: inserted.source,
              lastFetchedAt: inserted.last_fetched_at.toISOString(),
              mainPhonetic: inserted.main_phonetic,
              examples: inserted.examples,
              synonyms: inserted.synonyms,
              aiFeedback,
              relatedWords
            },
          };
        } catch (err) {
          this.logger.warn(`Failed to fetch word: ${word}`);
          this.logger.debug(err instanceof Error ? err.message : String(err));
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
