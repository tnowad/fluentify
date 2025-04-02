import { initClient } from '@ts-rest/core';
import { apiContracts } from '@workspace/contracts';

export const api = initClient(apiContracts, {
  baseUrl: 'http://127.0.0.1:3200',
  baseHeaders: {}
});
