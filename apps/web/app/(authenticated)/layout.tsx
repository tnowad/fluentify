import { redirect } from 'next/navigation';
import { api } from '@/lib/api';
import { HttpStatus } from '@workspace/contracts';

export default async function Layout({ children }: { children: React.ReactNode }) {
  const response = await api.auth.me();

  if (response.status !== HttpStatus.OK) {
    redirect('/auth/login');
  }

  return <>{children}</>;
}
