import { z } from 'zod';

export const analysisPromptSchema = z.object({
  originalSentence: z.string(),
  translation: z.string(),
  context: z.string(),
  recipient: z.string(),
  formality: z.enum(["formal", "neutral", "informal"]),
  sentenceBreakdown: z.array(
    z.object({
      word: z.string(),
      reading: z.string(),
      partOfSpeech: z.string(),
      meaning: z.string(),
      notes: z.string(),
    })
  ),
  aboutSentence: z.string(),
  grammar: z.string(),
  keyVocabulary: z.array(
    z.object({
      word: z.string(),
      reading: z.string(),
      meaning: z.string(),
      usage: z.string(),
    })
  ),
  alternativeExpressions: z.array(
    z.object({
      expression: z.string(),
      translation: z.string(),
      formality: z.enum(["formal", "neutral", "informal"]),
      notes: z.string(),
    })
  ),
});

export const analyzeCommonErrorsPromptSchema = z.object({
  originalSentence: z.string(),
  commonErrors: z.array(
    z.object({
      error: z.string(),
      location: z.string(),
      correction: z.string(),
      explanation: z.string(),
    })
  ),
  context: z.string(),
  formality: z.enum(["formal", "neutral", "informal"]),
  sentenceBreakdown: z.array(
    z.object({
      word: z.string(),
      reading: z.string(),
      partOfSpeech: z.string(),
      meaning: z.string(),
      notes: z.string(),
    })
  ),
  grammar: z.string(),
});

export const suggestSynonymsPromptSchema = z.object({
  originalSentence: z.string(),
  synonyms: z.array(
    z.object({
      synonym: z.string(),
      context: z.string(),
      formality: z.enum(["formal", "neutral", "informal"]),
      notes: z.string(),
    })
  ),
  formality: z.enum(["formal", "neutral", "informal"]),
});

export const analyzeSentenceStructurePromptSchema = z.object({
  originalSentence: z.string(),
  sentenceStructure: z.object({
    subject: z.string(),
    verb: z.string(),
    object: z.string().optional(),
    complement: z.string().optional(),
  }),
  syntaxAnalysis: z.array(
    z.object({
      phraseType: z.string(),
      position: z.string(),
      notes: z.string(),
    })
  ),
  context: z.string(),
  formality: z.enum(["formal", "neutral", "informal"]),
});

export const translateWithContextPromptSchema = z.object({
  originalSentence: z.string(),
  translation: z.string(),
  context: z.string(),
  formality: z.enum(["formal", "neutral", "informal"]),
  culturalImplications: z.string(),
});

export const identifyIdiomPromptSchema = z.object({
  originalSentence: z.string(),
  idioms: z.array(
    z.object({
      idiom: z.string(),
      meaning: z.string(),
      context: z.string(),
      notes: z.string(),
    })
  ),
  formality: z.enum(["formal", "neutral", "informal"]),
});

export const provideToneVariationsPromptSchema = z.object({
  originalSentence: z.string(),
  variations: z.array(
    z.object({
      tone: z.enum(["friendly", "sarcastic", "professional"]),
      text: z.string(),
    })
  ),
});

export const explainGrammarRulePromptSchema = z.object({
  originalSentence: z.string(),
  grammarRule: z.string(),
  explanation: z.string(),
  examples: z.array(
    z.object({
      exampleSentence: z.string(),
      context: z.string(),
    })
  ),
});

export const identifyMoodPromptSchema = z.object({
  originalSentence: z.string(),
  mood: z.enum(["imperative", "declarative", "interrogative", "exclamatory"]),
  justification: z.string(),
});
