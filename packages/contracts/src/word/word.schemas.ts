import { z } from "zod";

export const WordDefinitionSchema = z.object({
  definition: z.string(),
  example: z.string().optional(),
  partOfSpeech: z.string(),
});

export const AiFeedbackSchema = z.object({
  commonMistakes: z.string(),
  grammarTips: z.string(),
  usageTips: z.string(),
});

export const RelatedWordSchema = z.object({
  word: z.string(),
  partOfSpeech: z.string(),
});

export const WordSchema = z.object({
  id: z.string().uuid(),
  word: z.string(),
  mainPhonetic: z.string().nullable(),
  phonetics: z.array(z.string()),
  definitions: z.array(WordDefinitionSchema),
  examples: z.array(z.string()),
  synonyms: z.array(z.string()),
  audioUrl: z.string().nullable(),
  origin: z.string().nullable(),
  source: z.string(),
  lastFetchedAt: z.string().datetime(),
  aiFeedback: AiFeedbackSchema.optional(),
  relatedWords: z.array(RelatedWordSchema).optional(),
});

export const GetWordParams = z.object({
  word: z.string(),
});
