import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ZodType } from 'zod';

@Injectable()
export class GeminiService {
  private genAI: GoogleGenerativeAI;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY is not defined');
    this.genAI = new GoogleGenerativeAI(apiKey);
  }
}
