"use client";

import type React from "react";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowRight,
  Book,
  BookOpen,
  Copy,
  HelpCircle,
  History,
  Info,
  Lightbulb,
  MessageSquare,
  Plus,
  Redo,
  Save,
} from "lucide-react";

import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Label } from "@workspace/ui/components/label";
import { Textarea } from "@workspace/ui/components/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";
import { Badge } from "@workspace/ui/components/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form";
import { HowDoISayRequest, HttpStatus } from "@workspace/contracts";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { isDev } from "@/lib/env";
import { api } from "@/lib/api";
import { toast } from "sonner";

const formSchema = HowDoISayRequest;
type FormValues = z.infer<typeof formSchema>;

export default function HowDoISayPage() {
  const [showHistory, setShowHistory] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: isDev
      ? {
          originalSentence:
            "Trống trải vùng núi bên trên, mười mấy tên thiếu niên áo trắng đang luyện kiếm, lóa mắt linh lực bao vây lấy trường kiếm, mũi kiếm vạch phá không khí, trên không trung chấn động không thôi.",
          context: "Truyền tranh",
        }
      : {
          originalSentence: "",
          context: "business",
        },
  });

  const queryClient = useQueryClient();

  const historyQuery = useQuery({
    queryKey: ["how-do-i-say", "history"],
    queryFn: async () => {
      const response = await api.gemini.historyHowDoISay();
      if (response.status !== HttpStatus.OK) {
        throw new Error("Failed to fetch history");
      }
      return response.body;
    },
    enabled: showHistory,
  });

  const mutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const response = await api.gemini.howDoISay({
        body: data,
      });
      if (response.status !== HttpStatus.OK) {
        throw new Error("Failed to analyze sentence");
      }
      return response.body;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sentenceHistory"] });

      toast.success("Analysis complete", {
        description: "Your sentence has been analyzed successfully.",
      });
    },
    onError: (error) => {
      toast.error("Analysis failed", {
        description:
          error instanceof Error
            ? error.message
            : "There was an error analyzing your sentence. Please try again.",
      });
    },
  });

  const onSubmit = form.handleSubmit((data) => {
    mutation.mutate(data);
  });

  const loadHistoryItem = (item: HistoryItem) => {
    setInputSentence(item.originalSentence);
    setContext(item.context);
    setShowHistory(false);
  };

  const resetForm = () => {
    form.reset();
    mutation.reset();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard", {
      description: "Text has been copied to your clipboard.",
    });
  };

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="container py-4">
          <h1 className="text-2xl font-bold">How Do I Say?</h1>
          <p className="text-sm text-muted-foreground">
            Translate and understand sentences in context
          </p>
        </div>
      </header>

      <main className="container py-6">
        <div className="grid gap-6 md:grid-cols-3">
          {/* Input section */}
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  Enter Your Sentence
                </CardTitle>
                <CardDescription>
                  Provide a sentence you want to translate and understand
                </CardDescription>
              </CardHeader>

              <CardContent>
                <Form {...form}>
                  <form onSubmit={onSubmit} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="originalSentence"
                      render={({ field }) => (
                        <FormItem>
                          <Label>Sentence</Label>
                          <FormControl>
                            <Textarea
                              placeholder="Enter the sentence you want to translate..."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="context"
                      render={({ field }) => (
                        <FormItem>
                          <Label>Context</Label>
                          <FormControl>
                            <Textarea
                              placeholder="Provide any additional context..."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={mutation.isPending}
                    >
                      {mutation.isPending ? (
                        <>
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <ArrowRight className="mr-2 h-4 w-4" />
                          Analyze Sentence
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
              <CardFooter className="flex justify-between border-t px-6 py-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowHistory(!showHistory)}
                >
                  <History className="mr-2 h-4 w-4" />
                  History
                </Button>
                <Button variant="ghost" size="sm" onClick={resetForm}>
                  <Redo className="mr-2 h-4 w-4" />
                  Reset
                </Button>
              </CardFooter>
            </Card>

            {/* History panel */}
            {showHistory && (
              <Card className="mt-4">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Recent Sentences</CardTitle>
                </CardHeader>
                <CardContent className="px-6 py-0">
                  {historyQuery.isPending ? (
                    <div className="flex items-center justify-center py-4">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    </div>
                  ) : historyQuery.isError ? (
                    <div className="py-4 text-center text-sm text-muted-foreground">
                      Error loading history. Please try again.
                    </div>
                  ) : historyQuery.data?.length === 0 ? (
                    <div className="py-4 text-center text-sm text-muted-foreground">
                      No history found. Analyze some sentences to see them here.
                    </div>
                  ) : (
                    <ul className="space-y-2">
                      {historyQuery.data?.map((item) => (
                        <li key={item.id}>
                          <Button
                            variant="ghost"
                            className="w-full justify-start px-2 py-1.5 text-left text-sm"
                            onClick={() => loadHistoryItem(item)}
                          >
                            <div className="flex w-full items-start gap-2">
                              <Badge
                                variant="outline"
                                className="mt-0.5 shrink-0"
                              >
                                {item.context}
                              </Badge>
                              <div className="overflow-hidden">
                                <p className="truncate font-medium">
                                  {item.originalSentence}
                                </p>
                                <p className="truncate text-xs text-muted-foreground">
                                  {item.translation}
                                </p>
                              </div>
                            </div>
                          </Button>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
                <CardFooter className="border-t px-6 py-3">
                  <Button variant="ghost" size="sm" className="w-full">
                    View All History
                  </Button>
                </CardFooter>
              </Card>
            )}
          </div>

          {/* Results section */}
          <div className="md:col-span-2">
            {mutation.isPending ? (
              <div className="flex h-full flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
                <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                <h3 className="mb-2 text-lg font-medium">
                  Analyzing your sentence...
                </h3>
                <p className="max-w-md text-sm text-muted-foreground">
                  We're processing your request. This may take a moment.
                </p>
              </div>
            ) : mutation.isError ? (
              <div className="flex h-full flex-col items-center justify-center rounded-lg border border-dashed border-destructive p-12 text-center">
                <HelpCircle className="mb-4 h-12 w-12 text-destructive" />
                <h3 className="mb-2 text-lg font-medium">Analysis failed</h3>
                <p className="mb-4 max-w-md text-sm text-muted-foreground">
                  There was an error analyzing your sentence. Please try again
                  or contact support if the issue persists.
                </p>
                <Button onClick={resetForm} variant="outline">
                  Try Again
                </Button>
              </div>
            ) : mutation.data ? (
              <div className="space-y-6">
                {/* Original and translation */}
                <Card>
                  <CardHeader>
                    <CardTitle>Translation Result</CardTitle>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">{mutation.data.context}</Badge>
                      <Badge variant="outline">{mutation.data.recipient}</Badge>
                      <Badge variant="outline">{mutation.data.formality}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-muted-foreground">
                        Original Sentence
                      </Label>
                      <div className="mt-1 flex items-start justify-between rounded-md border p-3">
                        <p className="text-lg font-medium">
                          {mutation.data.originalSentence}
                        </p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() =>
                            copyToClipboard(mutation.data.originalSentence)
                          }
                        >
                          <Copy className="h-4 w-4" />
                          <span className="sr-only">Copy original</span>
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">
                        English Translation
                      </Label>
                      <div className="mt-1 flex items-start justify-between rounded-md border p-3">
                        <p className="text-lg font-medium">
                          {mutation.data.translation}
                        </p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() =>
                            copyToClipboard(mutation.data.translation)
                          }
                        >
                          <Copy className="h-4 w-4" />
                          <span className="sr-only">Copy translation</span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Sentence breakdown */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Book className="h-5 w-5 text-primary" />
                      Sentence Breakdown
                    </CardTitle>
                    <CardDescription>
                      Word-by-word analysis with parts of speech and meanings
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <div className="inline-flex flex-wrap gap-2 pb-2">
                        {mutation.data.sentenceBreakdown.map((word, index) => (
                          <TooltipProvider key={index}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="group relative cursor-help rounded-md border p-2 transition-colors hover:bg-muted">
                                  <div className="mb-1 text-center text-lg font-medium">
                                    {word.word}
                                  </div>
                                  <div className="text-center text-xs text-muted-foreground">
                                    {word.reading}
                                  </div>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent
                                side="bottom"
                                className="max-w-xs"
                              >
                                <div className="space-y-2 p-1">
                                  <div className="flex items-center justify-between">
                                    <span className="font-medium">
                                      {word.meaning}
                                    </span>
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {word.partOfSpeech}
                                    </Badge>
                                  </div>
                                  <p className="text-xs">{word.notes}</p>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Detailed analysis tabs */}
                <Tabs defaultValue="about">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="about">About</TabsTrigger>
                    <TabsTrigger value="grammar">Grammar</TabsTrigger>
                    <TabsTrigger value="alternatives">Alternatives</TabsTrigger>
                  </TabsList>

                  <TabsContent value="about" className="mt-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Info className="h-5 w-5 text-primary" />
                          About This Sentence
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="leading-relaxed">
                          {mutation.data.aboutSentence}
                        </p>

                        <div className="mt-6">
                          <h4 className="mb-2 font-medium">Key Vocabulary</h4>
                          <div className="space-y-2">
                            {mutation.data.keyVocabulary.map((item, index) => (
                              <div
                                key={index}
                                className="flex items-start rounded-md border p-3"
                              >
                                <div className="mr-3">
                                  <div className="font-medium">{item.word}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {item.reading}
                                  </div>
                                </div>
                                <div>
                                  <div className="font-medium">
                                    {item.meaning}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {item.usage}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="grammar" className="mt-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BookOpen className="h-5 w-5 text-primary" />
                          Grammar Structure
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="leading-relaxed">
                          {mutation.data.grammar}
                        </p>

                        <div className="mt-6 rounded-md bg-muted p-4">
                          <div className="flex items-center gap-2">
                            <Lightbulb className="h-5 w-5 text-amber-500" />
                            <h4 className="font-medium">Grammar Pattern</h4>
                          </div>
                          <p className="mt-2 text-sm">
                            Subject + Verb + Object (example pattern)
                          </p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <Badge variant="outline" className="bg-blue-50">
                              Subject
                            </Badge>
                            <Badge variant="outline" className="bg-green-50">
                              Verb
                            </Badge>
                            <Badge variant="outline" className="bg-orange-50">
                              Object
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="alternatives" className="mt-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <HelpCircle className="h-5 w-5 text-primary" />
                          Alternative Expressions
                        </CardTitle>
                        <CardDescription>
                          Other ways to express the same idea
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {mutation.data.alternativeExpressions.map(
                            (alt, index) => (
                              <div
                                key={index}
                                className="rounded-md border p-4"
                              >
                                <div className="mb-2 flex items-center justify-between">
                                  <h4 className="font-medium">
                                    {alt.expression}
                                  </h4>
                                  <Badge variant="outline">
                                    {alt.formality}
                                  </Badge>
                                </div>
                                <p className="mb-2 text-muted-foreground">
                                  {alt.translation}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {alt.notes}
                                </p>
                              </div>
                            ),
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>

                {/* Action buttons */}
                <div className="flex flex-wrap gap-3">
                  <Button onClick={resetForm} className="flex-1">
                    <Plus className="mr-2 h-4 w-4" />
                    New Sentence
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Save className="mr-2 h-4 w-4" />
                    Save to Flashcards
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
                <MessageSquare className="mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="mb-2 text-lg font-medium">
                  Enter a sentence to analyze
                </h3>
                <p className="mb-4 max-w-md text-sm text-muted-foreground">
                  Type a sentence in the input field, select a context, and
                  click "Analyze Sentence" to see a detailed breakdown and
                  translation.
                </p>
                <div className="flex flex-col gap-2">
                  <p className="text-sm font-medium">Try these examples:</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setInputSentence("Example business sentence");
                        setContext("business");
                      }}
                    >
                      Business example
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setInputSentence("Example travel sentence");
                        setContext("travel");
                      }}
                    >
                      Travel example
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setInputSentence("Example general sentence");
                        setContext("general");
                      }}
                    >
                      General example
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
