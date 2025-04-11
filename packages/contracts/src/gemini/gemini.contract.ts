import { initContract } from "@ts-rest/core";
import { HttpStatus } from "src/common/http-status";
import {
  HistoryHowDoISayResponse,
  HowDoISayRequest,
  HowDoISayResponse,
} from "./gemini.schemas";

const c = initContract();
export const geminiContract = c.router({
  howDoISay: {
    method: "POST",
    path: "/gemini/how-do-i-say",
    body: HowDoISayRequest,
    responses: {
      [HttpStatus.OK]: HowDoISayResponse,
    },
    summary: "How do I say this?",
    description:
      "Get a translation of a sentence with deeply contextual meaning.",
  },
  historyHowDoISay: {
    method: "GET",
    path: "/gemini/how-do-i-say/history",
    summary: "Get history of how do I say requests",
    responses: {
      [HttpStatus.OK]: HistoryHowDoISayResponse,
    },
    description: "Get history of how do I say requests",
  },
});
