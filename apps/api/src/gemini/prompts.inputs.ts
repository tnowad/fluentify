import { zodToJsonSchema } from 'zod-to-json-schema';
import { z } from 'zod';
import { HowDoISayRequest, HowDoISayResponse } from '@workspace/contracts';
import { extractJSONObject } from 'extract-first-json';

type PromptDefinition<TInput, TOutput> = {
  rules: string[];
  inputSchema: z.ZodSchema<TInput>;
  outputSchema: z.ZodSchema<TOutput>;
};

const PROMPT_TEMPLATE = `
Rules:
<rules>

Response Format:
<response>

Input:
<input>
`.trim();

const definePrompt = <TInput, TOutput>(
  config: PromptDefinition<TInput, TOutput>,
) => {
  const { rules, inputSchema, outputSchema } = config;

  const rulesText = rules.map((r) => `- ${r}`).join('\n');
  const jsonSchema = JSON.stringify(
    zodToJsonSchema(outputSchema, { errorMessages: false }),
    null,
    2,
  );

  return (input: TInput) => {
    const validatedInput = inputSchema.parse(input);
    const formattedInput = JSON.stringify(validatedInput, null, 2);

    const prompt = PROMPT_TEMPLATE.replace('<rules>', rulesText)
      .replace('<response>', jsonSchema)
      .replace('<input>', formattedInput);

    return {
      text: prompt,
      validate: (raw: string): TOutput => {
        const json = extractJSONObject(raw);
        if (!json) {
          throw new Error('Invalid JSON response');
        }

        return outputSchema.parse(json);
      },
    };
  };
};

export const buildHowDoISayPrompt = definePrompt({
  rules: [
    'Translate the sentence naturally based on the given context.',
    'Provide detailed linguistic breakdown and analysis.',
    'Strictly output raw JSON. Do not wrap in markdown.',
  ],
  inputSchema: HowDoISayRequest,
  outputSchema: HowDoISayResponse,
});
