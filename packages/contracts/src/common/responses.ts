import { z } from 'zod';

export const ValidationErrorResponse = z.object({
  error: z.literal('Unprocessable Entity'),
  issues: z.array(z.object({
    path: z.array(z.string()),
    message: z.string(),
  })),
});

export const ConflictResponse = z.object({
  error: z.literal('Conflict'),
  message: z.literal('Email already in use'),
});

export const UnauthorizedResponse = z.object({
  error: z.literal('Unauthorized'),
  message: z.string(),
});

export const BadRequestTokenError = z.object({
  error: z.literal('Bad Request'),
  message: z.string(),
});

