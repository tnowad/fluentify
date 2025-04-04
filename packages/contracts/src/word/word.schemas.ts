import { z } from 'zod';

export const WordDefinitionSchema = z.object({
  definition: z.string(),
  example: z.string().optional(),
  partOfSpeech: z.string(),
});

export const WordSchema = z.object({
  id: z.string().uuid(),
  word: z.string(),
  definitions: z.array(WordDefinitionSchema),
  phonetics: z.array(z.string()),
  audioUrl: z.string().nullable(),
  origin: z.string().nullable(),
  source: z.string(),
  lastFetchedAt: z.string().datetime(),
});

export const GetWordParams = z.object({
  word: z.string(),
});
