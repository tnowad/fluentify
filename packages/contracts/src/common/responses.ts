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

export const NotFoundResponse = z.object({
  error: z.literal('Not Found'),
  message: z.string(),
});

export const CursorPaginationQuery = z.object({
  limit: z.coerce.number().min(1).max(100).default(20),
  cursor: z.string().optional(),
})

export const CursorPaginationResponse = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    items: z.array(itemSchema),
    nextCursor: z.string().nullable(),
  })
