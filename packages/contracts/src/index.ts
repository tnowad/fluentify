import { initContract } from '@ts-rest/core';
import { authContract } from './auth/auth.contract';

const c = initContract();

export const apiContracts = c.router({
  auth: authContract
})

export * from "./common/responses"
export * from "./common/http-status"
export * from "./auth/auth.contract"
export * from "./auth/auth.schemas"
export * from "./word/word.contract"
export * from "./word/word.schemas"
