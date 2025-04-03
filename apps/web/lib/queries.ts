import { api } from '@/lib/api';
import { HttpStatus } from '@workspace/contracts';
import { queryOptions } from '@tanstack/react-query';

export const getMeQueryOptions = queryOptions({
  queryKey: ['me'],
  queryFn: async () => {
    const { status, body } = await api.auth.me();
    switch (status) {
      case HttpStatus.OK:
        return body;
      default:
        return null;
    }
  },
  enabled: true,
  retry: false,
  refetchOnWindowFocus: false,
})

