"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { ArrowLeft, Check, Loader2, Plus, X } from "lucide-react";
import Link from "next/link";
import { useMutation, useQuery } from "@tanstack/react-query";

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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { api } from "@/lib/api";
import { CreateFlashcardRequest, HttpStatus } from "@workspace/contracts";
import { toast } from "sonner";
import { isDev } from "@/lib/env";
import { z } from "zod";

// Parts of speech options
const partsOfSpeech = [
  { value: "noun", label: "Noun" },
  { value: "verb", label: "Verb" },
  { value: "adjective", label: "Adjective" },
  { value: "adverb", label: "Adverb" },
  { value: "preposition", label: "Preposition" },
  { value: "conjunction", label: "Conjunction" },
  { value: "pronoun", label: "Pronoun" },
  { value: "interjection", label: "Interjection" },
];

const formSchema = CreateFlashcardRequest.extend({
  exampleInput: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CreateFlashcardPage() {
  const router = useRouter();

  const { data: topicsData, isLoading: isLoadingTopics } = useQuery({
    queryKey: ["topics", "my"],
    queryFn: async () => {
      const response = await api.topic.listMyTopics({
        query: { limit: 100 },
      });
      if (response.status !== HttpStatus.OK) {
        throw new Error("Failed to fetch topics");
      }
      return response.body;
    },
  });

  const topics = topicsData?.items || [];

  // Initialize form
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: isDev
      ? {
          word: "Facilitate",
          definition: "To make a process easier or more achievable.",
          imageUrl: "https://example.com/image.jpg",
          partOfSpeech: "verb",
          phonetic: "/fəˈsɪlɪteɪt/",
          examples: ["The teacher facilitated the discussion."],
          exampleInput: "I facilitated a workshop on teamwork.",
          note: "Mnemonic: 'Facilitate' sounds like 'facilitate'.",
        }
      : {
          word: "",
          definition: "",
          imageUrl: null,
          partOfSpeech: "",
          phonetic: "",
          exampleInput: "",
          examples: [],
          note: "",
        },
  });

  const createFlashcard = useMutation({
    mutationFn: async (data: FormValues) => {
      const response = await api.flashcard.createFlashcard({
        body: data,
      });

      if (response.status !== HttpStatus.CREATED) {
        throw new Error("Failed to create flashcard");
      }

      return response.body;
    },
    onSuccess: () => {
      toast.success("Flashcard created", {
        description: "Your flashcard has been created successfully.",
      });

      // Redirect to flashcards page or clear form for another entry
      if (form.getValues("topicId")) {
        router.push(`/topics/${form.getValues("topicId")}`);
      } else {
        router.push("/flashcards");
      }
    },
    onError: (error) => {
      console.error("Error creating flashcard:", error);
      toast.error("Error", {
        description: "Failed to create flashcard. Please try again.",
      });
    },
  });

  const onSubmit = (values: FormValues) => {
    const { exampleInput, ...flashcardData } = values;
    createFlashcard.mutate(flashcardData);
  };

  const examples = form.watch("examples");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="container flex h-14 items-center">
          <Button variant="ghost" size="icon" asChild className="mr-2">
            <Link href="/flashcards">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <h1 className="text-xl font-semibold">Create New Flashcard</h1>
        </div>
      </header>

      <main className="container py-6">
        <Card className="mx-auto max-w-2xl">
          <CardHeader>
            <CardTitle>Create a New Flashcard</CardTitle>
            <CardDescription>
              Add a new vocabulary word to your collection.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="word"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Word or Phrase</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Facilitate" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="partOfSpeech"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Part of Speech</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || ""}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select part of speech" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {partsOfSpeech.map((pos) => (
                              <SelectItem key={pos.value} value={pos.value}>
                                {pos.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phonetic"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phonetic Pronunciation</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., /fəˈsɪlɪteɪt/"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormDescription>
                          Optional IPA pronunciation guide
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="definition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Definition</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter the definition of the word..."
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="exampleInput"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="examples">
                        Example Sentences
                      </FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-2">
                          <Input
                            id="examples"
                            placeholder="Enter an example sentence using this word..."
                            {...field}
                            value={field.value || ""}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              if (form.getValues("examples").length >= 10) {
                                toast.error("Maximum 10 examples allowed");
                                return;
                              }
                              if (field.value) {
                                form.setValue(
                                  "examples",
                                  [...form.getValues("examples"), field.value],
                                  { shouldValidate: true },
                                );
                              }
                              field.onChange("");
                            }}
                          >
                            <Plus className="h-4 w-4" />
                            <span className="sr-only">Add example</span>
                          </Button>
                        </div>
                      </FormControl>
                      <FormDescription>
                        Press Enter to add. Maximum 10 examples. /10 added.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {examples?.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {examples.map((example, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded-md border p-2"
                      >
                        <p className="text-sm">{example}</p>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            const updatedExamples = examples.filter(
                              (_, i) => i !== index,
                            );
                            form.setValue("examples", updatedExamples);
                          }}
                        >
                          <X className="h-4 w-4" />
                          <span className="sr-only">Remove example</span>
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="note"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Add any additional notes or mnemonics..."
                          className="resize-none"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image URL (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://example.com/image.jpg"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormDescription>
                        Add an image URL to help remember this word
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="topicId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Topic</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || ""}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a topic" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {isLoadingTopics ? (
                            <SelectItem value="loading" disabled>
                              Loading topics...
                            </SelectItem>
                          ) : topics.length > 0 ? (
                            topics.map((topic) => (
                              <SelectItem key={topic.id} value={topic.id}>
                                {topic.name}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="none" disabled>
                              No topics available
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Assign this flashcard to a topic for organization.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" asChild>
              <Link href="/flashcards">Cancel</Link>
            </Button>
            <Button
              onClick={form.handleSubmit(onSubmit)}
              disabled={createFlashcard.isPending}
            >
              {createFlashcard.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Create Flashcard
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
