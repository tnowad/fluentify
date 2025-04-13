import { z } from 'zod';

export const UsersTableSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  hashed_password: z.string(),
  name: z.string(),
  created_at: z.date(),
});

export const WordsTableSchema = z.object({
  id: z.string(),
  word: z.string(),
  main_phonetic: z.string().nullable(),
  phonetics: z.array(z.string()),
  definitions: z.array(
    z.object({
      definition: z.string(),
      example: z.string().optional(),
      partOfSpeech: z.string(),
    }),
  ),
  examples: z.array(z.string()),
  synonyms: z.array(z.string()),
  audio_url: z.string().nullable(),
  origin: z.string().nullable(),
  source: z.string(),
  last_fetched_at: z.date(),
});

export const TopicsTableSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  is_public: z.boolean(),
  created_by: z.string(),
  created_at: z.date(),
});

export const FlashcardsTableSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  topic_id: z.string().nullable(),
  status: z.enum(['new', 'learning', 'mastered']),
  next_review_at: z.date(),
  last_reviewed_at: z.date().nullable(),
  ease_factor: z.number(),
  interval_days: z.number(),
  repetitions: z.number(),
  ebisu_model: z.tuple([z.number(), z.number(), z.number()]).nullable(),

  word: z.string(),
  definition: z.string(),
  image_url: z.string().url().nullable(),
  part_of_speech: z.string().nullable(),
  phonetic: z.string().nullable(),
  examples: z.array(z.string()),
  note: z.string().nullable(),
});

export const ReviewsTableSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  flashcard_id: z.string(),
  rating: z.enum(['forgot', 'hard', 'easy']),
  response_time_ms: z.number(),
  reviewed_at: z.date(),
});

export const PromptHistoryTableSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  type: z.string(),
  input: z.unknown(),
  input_hash: z.string(),
  response: z.unknown(),
  created_at: z.date(),
});

export type UsersTable = z.infer<typeof UsersTableSchema>;
export type WordsTable = z.infer<typeof WordsTableSchema>;
export type TopicsTable = z.infer<typeof TopicsTableSchema>;
export type FlashcardsTable = z.infer<typeof FlashcardsTableSchema>;
export type ReviewsTable = z.infer<typeof ReviewsTableSchema>;
export type PromptHistoryTable = z.infer<typeof PromptHistoryTableSchema>;

export interface DB {
  users: UsersTable;
  words: WordsTable;
  topics: TopicsTable;
  flashcards: FlashcardsTable;
  reviews: ReviewsTable;
  prompt_histories: PromptHistoryTable;
}
