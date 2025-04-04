import { initContract } from '@ts-rest/core';
import { z } from 'zod';
import {
  FlashcardSchema,
  CreateFlashcardRequest,
  UpdateFlashcardRequest,
} from './flashcard.schemas';
import {
  CursorPaginationQuery,
  CursorPaginationResponse,
  UnauthorizedResponse,
  NotFoundResponse,
  ValidationErrorResponse,
} from '../common/responses';
import { HttpStatus } from 'src/common/http-status';

const c = initContract();

export const flashcardContract = c.router({
  listMyFlashcards: {
    method: 'GET',
    path: '/flashcards',
    summary: 'List current user flashcards with pagination',
    query: CursorPaginationQuery.extend({
      topicId: z.string().uuid().optional(),
    }),
    responses: {
      [HttpStatus.OK]: CursorPaginationResponse(FlashcardSchema),
      [HttpStatus.UNAUTHORIZED]: UnauthorizedResponse,
    },
  },

  getFlashcardById: {
    method: 'GET',
    path: '/flashcards/:id',
    summary: 'Get flashcard detail',
    responses: {
      [HttpStatus.OK]: FlashcardSchema,
      [HttpStatus.NOT_FOUND]: NotFoundResponse,
    },
  },

  createFlashcard: {
    method: 'POST',
    path: '/flashcards',
    summary: 'Create a flashcard',
    body: CreateFlashcardRequest,
    responses: {
      [HttpStatus.CREATED]: FlashcardSchema,
      [HttpStatus.UNAUTHORIZED]: UnauthorizedResponse,
      [HttpStatus.UNPROCESSABLE_ENTITY]: ValidationErrorResponse,
    },
  },

  updateFlashcard: {
    method: 'PUT',
    path: '/flashcards/:id',
    summary: 'Update flashcard',
    body: UpdateFlashcardRequest,
    responses: {
      [HttpStatus.OK]: FlashcardSchema,
      [HttpStatus.NOT_FOUND]: NotFoundResponse,
      [HttpStatus.UNAUTHORIZED]: UnauthorizedResponse,
    },
  },

  deleteFlashcard: {
    method: 'DELETE',
    path: '/flashcards/:id',
    summary: 'Delete flashcard',
    responses: {
      [HttpStatus.NO_CONTENT]: z.null(),
      [HttpStatus.NOT_FOUND]: NotFoundResponse,
      [HttpStatus.UNAUTHORIZED]: UnauthorizedResponse,
    },
  },

  getDueFlashcards: {
    method: 'GET',
    path: '/flashcards/due',
    summary: 'Get flashcards due for review',
    query: z.object({
      topicId: z.string().uuid().optional(),
      limit: z.coerce.number().min(1).max(100).default(20),
      cursor: z.string().uuid().optional(),
    }),
    responses: {
      [HttpStatus.OK]: z.object({
        items: z.array(FlashcardSchema),
        nextCursor: z.string().uuid().nullable(),
      }),
    }
  },

  submitReview: {
    method: 'POST',
    path: '/flashcards/:id/review',
    summary: 'Submit flashcard review result',
    body: z.object({
      rating: z.enum(['forgot', 'hard', 'easy']),
      responseTimeMs: z.number().int().nonnegative(),
    }),
    responses: {
      [HttpStatus.OK]: FlashcardSchema,
      [HttpStatus.NOT_FOUND]: NotFoundResponse,
      [HttpStatus.UNAUTHORIZED]: UnauthorizedResponse,
    },
  }
});
