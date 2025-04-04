export interface DB {
  users: UsersTable;
  words: WordsTable;
  topics: TopicsTable;
  flashcards: FlashcardsTable;
  reviews: ReviewsTable;
}

interface UsersTable {
  id: string;
  email: string;
  hashed_password: string;
  name: string;
  created_at: Date;
}

interface WordsTable {
  id: string;
  word: string;
  main_phonetic: string | null;
  phonetics: string[];
  definitions: {
    definition: string;
    example?: string;
    partOfSpeech: string;
  }[];
  examples: string[];
  synonyms: string[];
  audio_url: string | null;
  origin?: string | null;
  source: string;
  last_fetched_at: Date;
}

interface TopicsTable {
  id: string;
  name: string;
  description?: string;
  is_public: boolean;
  created_by: string;
  created_at: Date;
}

interface FlashcardsTable {
  id: string;
  user_id: string;
  word_id: string;
  topic_id?: string;
  status: 'new' | 'learning' | 'mastered';
  next_review_at: Date;
  last_reviewed_at: Date | null;
  ease_factor: number;
  interval_days: number;
  repetitions: number;
}

interface ReviewsTable {
  id: string;
  user_id: string;
  word_id: string;
  rating: 'forgot' | 'hard' | 'easy';
  response_time_ms: number;
  reviewed_at: Date;
}
