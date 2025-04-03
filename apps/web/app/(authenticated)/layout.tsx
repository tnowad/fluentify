import { api } from '@/lib/api';
import { HttpStatus } from '@workspace/contracts';
import DashboardLayout from '@/components/dashboard';
import { dehydrate, HydrationBoundary, QueryClient, queryOptions } from '@tanstack/react-query';
import { redirect } from 'next/navigation';

const getMeQueryOptions = queryOptions({
  queryKey: ['me'],
  queryFn: async () => {
    const { status, body, headers } = await api.auth.me({ cache: 'no-cache' });
    console.log(status, body, headers)
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

export default async function Layout({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient()

  const user = await queryClient.fetchQuery(getMeQueryOptions)
  console.log(user)

  if (!user) redirect('/auth/login')
  return <HydrationBoundary state={dehydrate(queryClient)}>
    <DashboardLayout>{children}</DashboardLayout>;
  </HydrationBoundary>
}
