import { initContract } from '@ts-rest/core';
import { HttpStatus } from 'src/common/http-status';
import { WordSchema, GetWordParams } from './word.schemas';
import { NotFoundResponse } from '../common/responses';

const c = initContract();

export const wordContract = c.router({
  getWord: {
    method: 'GET',
    path: '/words/:word',
    summary: 'Fetch a word (from cache or dictionary API)',
    pathParams: GetWordParams,
    responses: {
      [HttpStatus.OK]: WordSchema,
      [HttpStatus.NOT_FOUND]: NotFoundResponse,
    },
  },
});
