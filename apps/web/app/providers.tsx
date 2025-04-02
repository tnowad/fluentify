'use client'

import { QueryClientProvider } from "@tanstack/react-query"
import { getQueryClient } from "./get-query-client"
import { Providers as ThemeProviders } from "@/components/providers"

export function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient()

  return (
    <ThemeProviders>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </ThemeProviders>
  )
}
