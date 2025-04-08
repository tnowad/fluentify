"use client";

import { useRouter } from "next/navigation";
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
import { toast } from "sonner";
import { CreateTopicRequest, HttpStatus } from "@workspace/contracts";
import { isDev } from "@/lib/env";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const formSchema = CreateTopicRequest;

type FormValues = z.infer<typeof formSchema>;

export default function CreateTopicPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: isDev
      ? {
          name: "Business Vocabulary",
          description: "Vocabulary related to business and finance.",
          isPublic: true,
        }
      : {
          name: "",
          description: "",
          isPublic: false,
        },
  });

  const mutation = useMutation({
    mutationFn: (data: FormValues) => api.topic.createTopic({ body: data }),
    onSuccess: (data) => {
      if (data.status === HttpStatus.CREATED) {
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="container flex h-14 items-center">
          <Button variant="ghost" size="icon" asChild className="mr-2">
            <Link href="/topics">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <h1 className="text-xl font-semibold">Create New Topic</h1>
        </div>
      </header>

      <main className="container py-6">
        <Card className="mx-auto max-w-2xl">
          <CardHeader>
            <CardTitle>Create a New Topic</CardTitle>
            <CardDescription>
              Create a new vocabulary topic to organize and study words.
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                        <FormLabel className="text-base">Make Public</FormLabel>
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
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" asChild>
              <Link href="/topics">Cancel</Link>
            </Button>
            <Button onClick={onSubmit} disabled={mutation.isPending}>
              {mutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Create Topic
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
