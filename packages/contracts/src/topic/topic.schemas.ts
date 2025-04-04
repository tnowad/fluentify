import { z } from 'zod';

export const TopicSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  isPublic: z.boolean(),
  createdBy: z.string().uuid(),
  createdAt: z.string().datetime(),
});

export const CreateTopicRequest = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  isPublic: z.boolean().default(false),
});

export const UpdateTopicRequest = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  isPublic: z.boolean().optional(),
});

export const FlashcardSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  wordId: z.string().uuid(),
  status: z.enum(['new', 'learning', 'mastered']),
  nextReviewAt: z.string().datetime(),
  lastReviewedAt: z.string().datetime().nullable(),
  easeFactor: z.number(),
  intervalDays: z.number(),
  repetitions: z.number(),
});
