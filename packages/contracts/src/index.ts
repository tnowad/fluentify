import { initContract } from '@ts-rest/core';
import { authContract } from './auth.contract';

const c = initContract();

export const apiContracts = c.router({
  auth: authContract
})

export * from "./auth"
export * from "./common"
