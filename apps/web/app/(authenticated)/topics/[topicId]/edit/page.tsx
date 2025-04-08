"use client";

import { useRouter, useParams } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ArrowLeft, Check, Loader2 } from "lucide-react";
import Link from "next/link";

import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import { Switch } from "@workspace/ui/components/switch";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form";
import { api } from "@/lib/api";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { HttpStatus, UpdateTopicRequest } from "@workspace/contracts";
import {
  useMutation,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { toast } from "sonner";

const formSchema = UpdateTopicRequest;

type FormValues = z.infer<typeof formSchema>;

export default function EditTopicPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { topicId } = useParams<{ topicId: string }>();

  const {
    data: topic,
    isLoading,
    error,
  } = useSuspenseQuery({
    queryKey: ["topic", topicId],
    queryFn: async () => {
      const response = await api.topic.getTopicById({
        params: {
          id: topicId,
        },
      });
      if (response.status !== HttpStatus.OK) {
        throw new Error("Failed to fetch topic");
      }
      return response;
    },
    select: (data) => data.body,
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: topic?.name,
      description: topic?.description ?? "",
      isPublic: topic?.isPublic,
    },
  });

  const mutation = useMutation({
    mutationFn: (data: FormValues) =>
      api.topic.updateTopic({ params: { id: topicId }, body: data }),
    onSuccess: (data) => {
      if (data.status === HttpStatus.OK) {
        toast.success("Topic created successfully!");
        queryClient.invalidateQueries({
          queryKey: ["topics"],
        });
        router.push("/topics");
      } else {
        toast.error("Failed to create topic.");
      }
    },
    onError: () => {
      toast.error("An error occurred while creating the topic.");
    },
  });

  const onSubmit = form.handleSubmit((data) => {
    mutation.mutate(data);
  });

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>
              There was a problem loading the topic.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground">{error.message}</p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button asChild>
              <Link href="/topics">Return to Topics</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="container flex h-14 items-center">
          <Button variant="ghost" size="icon" asChild className="mr-2">
            <Link href={`/topics/${topicId}`}>
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <h1 className="text-xl font-semibold">Edit Topic</h1>
        </div>
      </header>

      <main className="container py-6">
        <Card className="mx-auto max-w-2xl">
          <CardHeader>
            <CardTitle>Edit Topic</CardTitle>
            <CardDescription>
              Update your vocabulary topic details.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
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
                <Skeleton className="h-16 w-full" />
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={onSubmit} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Topic Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., Business Vocabulary"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Give your topic a clear and descriptive name.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Briefly describe what this topic covers..."
                            className="resize-none"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormDescription>
                          Provide a short description to help you remember what
                          this topic is about.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isPublic"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Make Public
                          </FormLabel>
                          <FormDescription>
                            Allow other users to view and save this topic.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" asChild>
              <Link href={`/topics/${topicId}`}>Cancel</Link>
            </Button>
            <Button
              onClick={onSubmit}
              disabled={isLoading || mutation.isPending}
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Update Topic
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
