export const analysisPrompts = (input: string) => `
  You are an expert multilingual linguist AI. Analyze the following sentence strictly and respond **only** with raw JSON, no explanations, no code blocks, no markdown. Follow this exact schema:

  Input: "${input}"

  {
    "originalSentence": "<original sentence>",
    "translation": "<translation in English>",
    "context": "<context of use: business, personal, academic, etc.>",
    "recipient": "<who is being spoken to: friend, colleague, teacher, etc.>",
    "formality": "formal" | "neutral" | "informal",
    "sentenceBreakdown": [
      {
        "word": "<word>",
        "reading": "<pronunciation>",
        "partOfSpeech": "<noun, verb, etc.>",
        "meaning": "<meaning in English>",
        "notes": "<grammar or cultural notes>"
      }
    ],
    "aboutSentence": "<explanation of sentence purpose or common usage>",
    "grammar": "<grammar structure and notable points>",
    "keyVocabulary": [
      {
        "word": "<word>",
        "reading": "<pronunciation>",
        "meaning": "<meaning in English>",
        "usage": "<how and when the word is commonly used>"
      }
    ],
    "alternativeExpressions": [
      {
        "expression": "<alternative sentence in original language>",
        "translation": "<translation in English>",
        "formality": "formal" | "neutral" | "informal",
        "notes": "<how this expression differs or when to use>"
      }
    ]
  }
`;

export const analyzeCommonErrorsPrompt = (input: string) => `
  You are a grammar expert. Analyze the following sentence strictly and respond **only** with raw JSON, no explanations, no code blocks, no markdown. Follow this exact schema:

  Input: "${input}"

  {
    "originalSentence": "<original sentence>",
    "commonErrors": [
      {
        "error": "<error type, e.g., spelling, grammar>",
        "location": "<where the error occurs in the sentence>",
        "correction": "<how to correct the error>",
        "explanation": "<brief explanation of the error>"
      }
    ],
    "context": "<context of use: business, personal, academic, etc.>",
    "formality": "formal" | "neutral" | "informal",
    "sentenceBreakdown": [
      {
        "word": "<word>",
        "reading": "<pronunciation>",
        "partOfSpeech": "<noun, verb, etc.>",
        "meaning": "<meaning in English>",
        "notes": "<grammar or cultural notes>"
      }
    ],
    "grammar": "<grammar structure and notable points>"
  }
`;


export const suggestSynonymsPrompt = (input: string) => `
  You are a language assistant. Suggest synonyms for the following sentence and respond **only** with raw JSON, no explanations, no code blocks, no markdown. Follow this exact schema:

  Input: "${input}"

  {
    "originalSentence": "<original sentence>",
    "synonyms": [
      {
        "synonym": "<synonym phrase>",
        "context": "<context where this synonym can be used>",
        "formality": "formal" | "neutral" | "informal",
        "notes": "<when to use this synonym>"
      }
    ],
    "formality": "formal" | "neutral" | "informal"
  }
`;

export const analyzeSentenceStructurePrompt = (input: string) => `
  You are a syntax expert. Analyze the following sentence's structure strictly and respond **only** with raw JSON, no explanations, no code blocks, no markdown. Follow this exact schema:

  Input: "${input}"

  {
    "originalSentence": "<original sentence>",
    "sentenceStructure": {
      "subject": "<subject of the sentence>",
      "verb": "<main verb of the sentence>",
      "object": "<object, if present>",
      "complement": "<any complements or modifiers>"
    },
    "syntaxAnalysis": [
      {
        "phraseType": "<noun phrase, verb phrase, etc.>",
        "position": "<position of the phrase in the sentence>",
        "notes": "<notes about syntax structure>"
      }
    ],
    "context": "<context of use: business, personal, academic, etc.>",
    "formality": "formal" | "neutral" | "informal"
  }
`;

export const translateWithContextPrompt = (input: string) => `
  You are a translation expert. Translate the following sentence into English considering its contextual meaning strictly and respond **only** with raw JSON, no explanations, no code blocks, no markdown. Follow this exact schema:

  Input: "${input}"

  {
    "originalSentence": "<original sentence>",
    "translation": "<translated sentence>",
    "context": "<context of use: business, personal, academic, etc.>",
    "formality": "formal" | "neutral" | "informal",
    "culturalImplications": "<any cultural nuances or challenges in translation>"
  }
`;

export const identifyIdiomPrompt = (input: string) => `
  You are an idiom expert. Identify any idiomatic expressions in the following sentence and explain their meaning and usage. Respond **only** with raw JSON, no explanations, no code blocks, no markdown. Follow this exact schema:

  Input: "${input}"

  {
    "originalSentence": "<original sentence>",
    "idioms": [
      {
        "idiom": "<idiomatic expression>",
        "meaning": "<meaning of the idiom>",
        "context": "<context where this idiom is used>",
        "notes": "<notes on how this idiom differs culturally or grammatically>"
      }
    ],
    "formality": "formal" | "neutral" | "informal"
  }
`;

export const provideToneVariationsPrompt = (input: string) => `
  You are a tone expert. Provide 3 different variations of the following sentence based on different tones:
  - Friendly
  - Sarcastic
  - Professional
  Respond **only** with raw JSON, no explanations, no code blocks, no markdown. Follow this exact schema:

  Input: "${input}"

  {
    "originalSentence": "<original sentence>",
    "variations": [
      {
        "tone": "friendly",
        "text": "<friendly tone variation>"
      },
      {
        "tone": "sarcastic",
        "text": "<sarcastic tone variation>"
      },
      {
        "tone": "professional",
        "text": "<professional tone variation>"
      }
    ]
  }
`;

export const explainGrammarRulePrompt = (input: string) => `
  You are a grammar teacher. Explain the use of a specific grammar rule present in the following sentence. Respond **only** with raw JSON, no explanations, no code blocks, no markdown. Follow this exact schema:

  Input: "${input}"

  {
    "originalSentence": "<original sentence>",
    "grammarRule": "<grammar rule being applied>",
    "explanation": "<detailed explanation of the rule's usage in this sentence>",
    "examples": [
      {
        "exampleSentence": "<example of the grammar rule>",
        "context": "<context where this rule applies>"
      }
    ]
  }
`;

export const identifyMoodPrompt = (input: string) => `
  You are a language expert. Identify the mood of the following sentence and respond **only** with raw JSON, no explanations, no code blocks, no markdown. Follow this exact schema:

  Input: "${input}"

  {
    "originalSentence": "<original sentence>",
    "mood": "imperative" | "declarative" | "interrogative" | "exclamatory",
    "justification": "<why this mood is applicable>"
  }
`;
