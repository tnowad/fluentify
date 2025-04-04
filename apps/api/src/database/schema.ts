export interface DB {
  users: UsersTable;
  words: WordsTable;
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
