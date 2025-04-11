import { z } from "zod";

export const SentenceBreakdownSchema = z.object({
  word: z.string().describe("Original word or phrase from the sentence"),
  reading: z.string().describe("Phonetic reading or pronunciation"),
  partOfSpeech: z.string().describe("Part of speech (e.g., noun, verb)"),
  meaning: z.string().describe("English meaning of the word/phrase"),
  notes: z
    .string()
    .optional()
    .nullable()
    .describe("Additional context or usage notes"),
});

export const KeyVocabularySchema = z.object({
  word: z.string().describe("Vocabulary word from the sentence"),
  reading: z.string().describe("Pronunciation of the word"),
  meaning: z.string().describe("Meaning in English"),
  usage: z.string().describe("Example or explanation of how it's used"),
});

export const AlternativeExpressionSchema = z.object({
  expression: z
    .string()
    .describe("Alternative way to say the original sentence"),
  translation: z.string().describe("Translation of the alternative expression"),
  formality: z
    .enum(["formal", "neutral", "informal"])
    .describe("Formality level of the alternative"),
  notes: z.string().optional().describe("Contextual or usage notes"),
});

export const HowDoISayRequest = z.object({
  originalSentence: z
    .string()
    .max(500, "Sentence too long")
    .describe("Sentence to be translated and analyzed"),
  context: z
    .string()
    .max(100, "Context too long")
    .optional()
    .describe("Optional context to help improve translation accuracy"),
});

export const HowDoISayResponse = z.object({
  originalSentence: z
    .string()
    .describe("The original sentence in the source language"),
  translation: z
    .string()
    .describe("Natural and context-appropriate English translation"),
  context: z.string().describe("Provided or inferred context for the sentence"),
  recipient: z
    .string()
    .describe("Intended recipient of the sentence (e.g., boss, friend)"),
  formality: z
    .enum(["formal", "neutral", "informal"])
    .describe("Formality level of the translation"),
  sentenceBreakdown: z
    .array(SentenceBreakdownSchema)
    .describe("Detailed breakdown of each word/phrase in the sentence"),
  aboutSentence: z
    .string()
    .describe("Overall explanation of the sentence and its tone/register"),
  grammar: z
    .string()
    .describe("Grammar structure and relevant syntax patterns used"),
  keyVocabulary: z
    .array(KeyVocabularySchema)
    .describe("Important vocabulary words and how they're used"),
  alternativeExpressions: z
    .array(AlternativeExpressionSchema)
    .describe("Alternative ways to express the sentence"),
});

export const HistoryHowDoISayResponse = z
  .array(
    HowDoISayRequest.extend({
      id: z.string().uuid().describe("Unique identifier for the request"),
      createdAt: z
        .string()
        .datetime()
        .describe("Timestamp of when the request was made"),
    }),
  )
  .describe("History of past translation/analysis requests");
