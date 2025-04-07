import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as Prompts from './prompts.inputs';
import * as Schemas from './prompts.schemas';
import { ZodType } from 'zod';

@Injectable()
export class GeminiService {
  private genAI: GoogleGenerativeAI;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY is not defined');
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  private async runPrompt<T>(promptFn: (input: string) => string, schema: ZodType<T>, input: string): Promise<T> {
    const prompt = promptFn(input);
    const model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const { response } = await model.generateContent(prompt);
    const parsed = schema.safeParse(JSON.parse(response.text()));
    if (!parsed.success) throw new Error('Invalid response from Gemini API');
    return parsed.data;
  }

  analyzeCommonErrors(input: string) {
    return this.runPrompt(Prompts.analyzeCommonErrorsPrompt, Schemas.analyzeCommonErrorsPromptSchema, input);
  }

  analysisPrompts(input: string) {
    return this.runPrompt(Prompts.analysisPrompts, Schemas.analysisPromptSchema, input);
  }

  suggestSynonyms(input: string) {
    return this.runPrompt(Prompts.suggestSynonymsPrompt, Schemas.suggestSynonymsPromptSchema, input);
  }

  analyzeSentenceStructure(input: string) {
    return this.runPrompt(Prompts.analyzeSentenceStructurePrompt, Schemas.analyzeSentenceStructurePromptSchema, input);
  }

  translateWithContext(input: string) {
    return this.runPrompt(Prompts.translateWithContextPrompt, Schemas.translateWithContextPromptSchema, input);
  }

  identifyIdiom(input: string) {
    return this.runPrompt(Prompts.identifyIdiomPrompt, Schemas.identifyIdiomPromptSchema, input);
  }

  provideToneVariations(input: string) {
    return this.runPrompt(Prompts.provideToneVariationsPrompt, Schemas.provideToneVariationsPromptSchema, input);
  }

  explainGrammarRule(input: string) {
    return this.runPrompt(Prompts.explainGrammarRulePrompt, Schemas.explainGrammarRulePromptSchema, input);
  }

  identifyMood(input: string) {
    return this.runPrompt(Prompts.identifyMoodPrompt, Schemas.identifyMoodPromptSchema, input);
  }
}
