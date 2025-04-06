import { z } from "zod";

export const FlashcardSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  wordId: z.string().uuid(),
  topicId: z.string().uuid().nullable(),
  status: z.enum(["new", "learning", "mastered"]),
  nextReviewAt: z.string().datetime(),
  lastReviewedAt: z.string().datetime().nullable(),
  easeFactor: z.number(),
  intervalDays: z.number(),
  repetitions: z.number(),
});

export const CreateFlashcardRequest = z.object({
  wordId: z.string().uuid(),
  topicId: z.string().uuid().optional(),
});

export const UpdateFlashcardRequest = z.object({
  status: z.enum(["new", "learning", "mastered"]).optional(),
  nextReviewAt: z.string().datetime().optional(),
  lastReviewedAt: z.string().datetime().nullable().optional(),
  easeFactor: z.number().optional(),
  intervalDays: z.number().optional(),
  repetitions: z.number().optional(),
});
