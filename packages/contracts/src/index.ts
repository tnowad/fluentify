import { initContract } from "@ts-rest/core";
import { authContract } from "./auth/auth.contract";
import { wordContract } from "./word/word.contract";
import { topicContract } from "./topic/topic.contract";
import { flashcardContract } from "./flashcard/flashcard.contract";
import { statisticContract } from "./statistic/statistic.contract";

const c = initContract();

export const apiContracts = c.router({
  auth: authContract,
  word: wordContract,
  topic: topicContract,
  flashcard: flashcardContract,
  statistic: statisticContract,
});

export * from "./common/responses";
export * from "./common/http-status";
export * from "./auth/auth.contract";
export * from "./auth/auth.schemas";
export * from "./word/word.contract";
export * from "./word/word.schemas";
export * from "./topic/topic.contract";
export * from "./topic/topic.schemas";
export * from "./flashcard/flashcard.contract";
export * from "./flashcard/flashcard.schemas";
export * from "./statistic/statistic.contract";
export * from "./statistic/statistic.schemas";
