import DashboardLayout from '@/components/dashboard';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { redirect } from 'next/navigation';
import { getMeQueryOptions } from '@/lib/queries';

export default async function Layout({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient()

  const user = await queryClient.fetchQuery(getMeQueryOptions)

  if (!user) redirect('/auth/login')
  return <HydrationBoundary state={dehydrate(queryClient)}>
    <DashboardLayout>{children}</DashboardLayout>;
  </HydrationBoundary>
}
