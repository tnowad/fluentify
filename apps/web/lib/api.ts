import { initClient } from '@ts-rest/core';
import { apiContracts } from '@workspace/contracts';

export const api = initClient(apiContracts, {
  baseUrl: 'http://localhost:3200',
  baseHeaders: {}
});
