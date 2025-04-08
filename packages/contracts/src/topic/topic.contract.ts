import { initContract } from "@ts-rest/core";
import { z } from "zod";
import {
  TopicSchema,
  CreateTopicRequest,
  UpdateTopicRequest,
  TopicExtendedSchema,
} from "./topic.schemas";
import {
  UnauthorizedResponse,
  ValidationErrorResponse,
  NotFoundResponse,
  ConflictResponse,
  CursorPaginationQuery,
  CursorPaginationResponse,
} from "../common/responses";
import { HttpStatus } from "src/common/http-status";
import { FlashcardSchema } from "src/flashcard/flashcard.schemas";

const c = initContract();

export const topicContract = c.router({
  listMyTopics: {
    method: "GET",
    path: "/topics/my",
    summary: "Get current user's topics with cursor pagination",
    query: CursorPaginationQuery.extend({
      search: z.string().optional(),
    }),
    responses: {
      [HttpStatus.OK]: CursorPaginationResponse(TopicSchema),
      [HttpStatus.UNAUTHORIZED]: UnauthorizedResponse,
    },
  },

  listPublicTopics: {
    method: "GET",
    path: "/topics/discover",
    summary: "List public topics with cursor pagination",
    query: CursorPaginationQuery.extend({
      search: z.string().optional(),
    }),
    responses: {
      [HttpStatus.OK]: CursorPaginationResponse(TopicSchema),
    },
  },

  getTopicById: {
    method: "GET",
    path: "/topics/:id",
    summary: "Get topic detail",
    responses: {
      [HttpStatus.OK]: TopicExtendedSchema,
      [HttpStatus.NOT_FOUND]: NotFoundResponse,
    },
  },

  createTopic: {
    method: "POST",
    path: "/topics",
    summary: "Create new topic",
    body: CreateTopicRequest,
    responses: {
      [HttpStatus.CREATED]: TopicSchema,
      [HttpStatus.UNAUTHORIZED]: UnauthorizedResponse,
      [HttpStatus.UNPROCESSABLE_ENTITY]: ValidationErrorResponse,
    },
  },

  updateTopic: {
    method: "PUT",
    path: "/topics/:id",
    summary: "Update topic",
    body: UpdateTopicRequest,
    responses: {
      [HttpStatus.OK]: TopicSchema,
      [HttpStatus.NOT_FOUND]: NotFoundResponse,
      [HttpStatus.UNAUTHORIZED]: UnauthorizedResponse,
    },
  },

  deleteTopic: {
    method: "DELETE",
    path: "/topics/:id",
    summary: "Delete topic",
    responses: {
      [HttpStatus.NO_CONTENT]: z.null(),
      [HttpStatus.NOT_FOUND]: NotFoundResponse,
      [HttpStatus.UNAUTHORIZED]: UnauthorizedResponse,
    },
  },

  listTopicFlashcards: {
    method: "GET",
    path: "/topics/:id/flashcards",
    summary: "List all flashcards in topic",
    query: CursorPaginationQuery,
    responses: {
      [HttpStatus.OK]: CursorPaginationResponse(FlashcardSchema),
      [HttpStatus.NOT_FOUND]: NotFoundResponse,
    },
  },

  uploadExcel: {
    method: "POST",
    path: "/topics/:id/import",
    summary: "Import flashcards from Excel",
    contentType: "multipart/form-data",
    body: z.object({
      file: z.any(),
    }),
    responses: {
      [HttpStatus.CREATED]: z.object({
        imported: z.number(),
        errors: z.array(z.string()),
      }),
      [HttpStatus.BAD_REQUEST]: ValidationErrorResponse,
      [HttpStatus.UNAUTHORIZED]: UnauthorizedResponse,
    },
  },

  cloneTopic: {
    method: "POST",
    path: "/topics/:id/clone",
    summary: "Clone public topic to current user's private list",
    body: z.object({
      name: z.string().optional(),
      description: z.string().optional(),
      isPublic: z.boolean().optional(),
    }),
    responses: {
      [HttpStatus.CREATED]: TopicSchema,
      [HttpStatus.NOT_FOUND]: NotFoundResponse,
      [HttpStatus.UNAUTHORIZED]: UnauthorizedResponse,
      [HttpStatus.CONFLICT]: ConflictResponse,
    },
  },
});
