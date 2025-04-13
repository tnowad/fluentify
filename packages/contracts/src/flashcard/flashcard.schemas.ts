import { z } from "zod";

export const FlashcardSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  topicId: z.string().uuid().nullable(),
  status: z.enum(["new", "learning", "mastered"]),
  nextReviewAt: z.string().datetime(),
  lastReviewedAt: z.string().datetime().nullable(),
  easeFactor: z.number(),
  intervalDays: z.number(),
  repetitions: z.number(),

  word: z.string(),
  definition: z.string(),
  imageUrl: z.string().url().nullable(),
  partOfSpeech: z.string().nullable(),
  phonetic: z.string().nullable(),
  examples: z.array(z.string()).max(10),
  note: z.string().nullable(),
});

export const CreateFlashcardRequest = z.object({
  topicId: z.string().uuid().optional(),
  word: z.string(),
  definition: z.string(),
  imageUrl: z.string().url().nullable().optional(),
  partOfSpeech: z.string().optional(),
  phonetic: z.string().optional(),
  examples: z.array(z.string()).max(10).optional(),
  note: z.string().optional(),
});

export const UpdateFlashcardRequest = z.object({
  status: z.enum(["new", "learning", "mastered"]).optional(),
  nextReviewAt: z.string().datetime().optional(),
  lastReviewedAt: z.string().datetime().nullable().optional(),
  easeFactor: z.number().optional(),
  intervalDays: z.number().optional(),
  repetitions: z.number().optional(),

  word: z.string().optional(),
  definition: z.string().optional(),
  imageUrl: z.string().url().nullable().optional(),
  partOfSpeech: z.string().optional(),
  phonetic: z.string().optional(),
  examples: z.array(z.string()).max(10).optional(),
  note: z.string().optional(),
});
