"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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

const formSchema = CreateFlashcardRequest;

type FormValues = z.infer<typeof formSchema>;

export default function CreateFlashcardPage() {
  const router = useRouter();
  const [examples, setExamples] = useState<string[]>([]);
  const [exampleInput, setExampleInput] = useState("");

  // Fetch topics for the dropdown
  const { data: topicsData, isLoading: isLoadingTopics } = useQuery({
    queryKey: ["topics", "my"],
    queryFn: async () => {
      const response = await api.topic.listMyTopics({
        query: { limit: "100" },
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
    defaultValues: {
      word: "",
      definition: "",
      imageUrl: null,
      partOfSpeech: "",
      phonetic: "",
      examples: [],
      note: "",
    },
  });

  // Create flashcard mutation
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

  // Handle form submission
  const onSubmit = (values: FormValues) => {
    // Add examples to the values
    const flashcardData = {
      ...values,
      examples: examples,
    };

    createFlashcard.mutate(flashcardData);
  };

  // Handle adding an example
  const handleAddExample = () => {
    if (exampleInput.trim() && examples.length < 10) {
      setExamples([...examples, exampleInput.trim()]);
      setExampleInput("");
    }
  };

  // Handle removing an example
  const handleRemoveExample = (index: number) => {
    setExamples(examples.filter((_, i) => i !== index));
  };

  // Handle example input keydown (add on Enter)
  const handleExampleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddExample();
    }
  };

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

                {/* Examples section */}
                <div className="space-y-2">
                  <FormLabel htmlFor="examples">Example Sentences</FormLabel>
                  <div className="flex items-center gap-2">
                    <Input
                      id="examples"
                      placeholder="Enter an example sentence using this word..."
                      value={exampleInput}
                      onChange={(e) => setExampleInput(e.target.value)}
                      onKeyDown={handleExampleKeyDown}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={handleAddExample}
                      disabled={!exampleInput.trim() || examples.length >= 10}
                    >
                      <Plus className="h-4 w-4" />
                      <span className="sr-only">Add example</span>
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Press Enter to add. Maximum 10 examples. {examples.length}
                    /10 added.
                  </p>

                  {/* Display added examples */}
                  {examples.length > 0 && (
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
                            onClick={() => handleRemoveExample(index)}
                          >
                            <X className="h-4 w-4" />
                            <span className="sr-only">Remove example</span>
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

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
