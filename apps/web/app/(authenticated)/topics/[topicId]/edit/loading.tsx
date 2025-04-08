import { Skeleton } from "@workspace/ui/components/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";

export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="container flex h-14 items-center">
          <Skeleton className="mr-2 h-8 w-8 rounded-full" />
          <Skeleton className="h-6 w-32" />
        </div>
      </header>

      <main className="container py-6">
        <Card className="mx-auto max-w-2xl">
          <CardHeader>
            <CardTitle>
              <Skeleton className="h-7 w-32" />
            </CardTitle>
            <CardDescription>
              <Skeleton className="h-5 w-64" />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-4 w-40" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-4 w-40" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-4 w-40" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <div className="flex gap-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-10" />
                </div>
                <Skeleton className="h-4 w-40" />
              </div>
              <Skeleton className="h-16 w-full" />
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
