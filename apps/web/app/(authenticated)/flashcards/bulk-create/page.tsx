"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  ArrowLeft,
  Check,
  Download,
  FileSpreadsheet,
  Loader2,
  Plus,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import Link from "next/link";
import { useMutation, useQuery } from "@tanstack/react-query";
import * as XLSX from "xlsx";
import { z } from "zod";

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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";
import { Textarea } from "@workspace/ui/components/textarea";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { Separator } from "@workspace/ui/components/separator";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@workspace/ui/components/alert";
import { HttpStatus } from "@workspace/contracts";

// Form schema for the topic selection
const topicFormSchema = z.object({
  topicId: z.string().uuid().optional(),
});

type TopicFormValues = z.infer<typeof topicFormSchema>;

export default function BulkCreateFlashcardsPage() {
  const router = useRouter();
  const [flashcards, setFlashcards] = useState<any[]>([]);
  const [validationErrors, setValidationErrors] = useState<
    Record<number, string[]>
  >({});
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState("upload");

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

  // Initialize form for topic selection
  const form = useForm<TopicFormValues>({
    resolver: zodResolver(topicFormSchema),
    defaultValues: {
      topicId: undefined,
    },
  });

  // Create flashcards mutation
  const createFlashcards = useMutation({
    mutationFn: async (data: { flashcards: any[] }) => {
      // In a real app, you would have a bulk create endpoint
      // For now, we'll simulate sequential creation
      const results = [];
      for (const flashcard of data.flashcards) {
        const response = await api.flashcard.createFlashcard({
          body: flashcard,
        });

        if (response.status !== HttpStatus.CREATED) {
          throw new Error(`Failed to create flashcard: ${flashcard.word}`);
        }

        results.push(response.body);
      }

      return results;
    },
    onSuccess: () => {
      toast({
        title: "Flashcards created",
        description: `Successfully created ${flashcards.length} flashcards.`,
      });

      // Redirect to flashcards page
      if (form.getValues("topicId")) {
        router.push(`/topics/${form.getValues("topicId")}`);
      } else {
        router.push("/flashcards");
      }
    },
    onError: (error) => {
      console.error("Error creating flashcards:", error);
      toast({
        title: "Error",
        description:
          "Failed to create some flashcards. Please check and try again.",
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const onSubmit = (values: TopicFormValues) => {
    // Validate all flashcards
    const errors: Record<number, string[]> = {};
    let hasErrors = false;

    flashcards.forEach((flashcard, index) => {
      // Apply topic ID to all flashcards if selected
      if (values.topicId) {
        flashcard.topicId = values.topicId;
      }

      // Validate each flashcard
      const result = CreateFlashcardRequest.safeParse(flashcard);
      if (!result.success) {
        errors[index] = result.error.errors.map(
          (err) => `${err.path.join(".")}: ${err.message}`,
        );
        hasErrors = true;
      }
    });

    if (hasErrors) {
      setValidationErrors(errors);
      toast({
        title: "Validation errors",
        description:
          "Some flashcards have validation errors. Please fix them before submitting.",
        variant: "destructive",
      });
      return;
    }

    // Submit if no errors
    createFlashcards.mutate({ flashcards });
  };

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setValidationErrors({});

    try {
      const data = await readExcelFile(file);
      setFlashcards(data);
      setActiveTab("review");

      toast({
        title: "File uploaded",
        description: `Successfully parsed ${data.length} flashcards from the file.`,
      });
    } catch (error) {
      console.error("Error parsing Excel file:", error);
      toast({
        title: "Error",
        description:
          "Failed to parse the Excel file. Please check the format and try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      // Reset the input
      e.target.value = "";
    }
  };

  // Read Excel file
  const readExcelFile = (file: File): Promise<CreateFlashcardRequestType[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: "array" });

          // Get the first worksheet
          const worksheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[worksheetName];

          // Convert to JSON
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          // Map to flashcard schema
          const flashcards: CreateFlashcardRequestType[] = jsonData.map(
            (row: any) => ({
              word: row.word || "",
              definition: row.definition || "",
              partOfSpeech: row.partOfSpeech || "",
              phonetic: row.phonetic || "",
              imageUrl: row.imageUrl || null,
              note: row.note || "",
              examples: row.examples
                ? row.examples.split(";").map((ex: string) => ex.trim())
                : [],
            }),
          );

          resolve(flashcards);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => {
        reject(new Error("Failed to read file"));
      };

      reader.readAsArrayBuffer(file);
    });
  };

  // Download template
  const downloadTemplate = () => {
    // Create a template workbook
    const worksheet = XLSX.utils.json_to_sheet([
      {
        word: "example",
        definition: "a thing characteristic of its kind",
        partOfSpeech: "noun",
        phonetic: "/ɪɡˈzɑːmpəl/",
        imageUrl: "https://example.com/image.jpg",
        examples: "This is an example; Here's another example",
        note: "Remember this word by thinking of 'ex' (out) + 'ample' (sample)",
      },
    ]);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Flashcards");

    // Generate and download the file
    XLSX.writeFile(workbook, "flashcard_template.xlsx");
  };

  // Handle removing a flashcard
  const handleRemoveFlashcard = (index: number) => {
    setFlashcards(flashcards.filter((_, i) => i !== index));

    // Also remove any validation errors for this index
    if (validationErrors[index]) {
      const newErrors = { ...validationErrors };
      delete newErrors[index];
      setValidationErrors(newErrors);
    }
  };

  // Handle editing a flashcard
  const handleEditFlashcard = (
    index: number,
    field: keyof CreateFlashcardRequestType,
    value: any,
  ) => {
    const updatedFlashcards = [...flashcards];
    updatedFlashcards[index] = {
      ...updatedFlashcards[index],
      [field]: value,
    };
    setFlashcards(updatedFlashcards);

    // Clear validation error for this field if it exists
    if (validationErrors[index]) {
      const fieldErrors = validationErrors[index].filter(
        (err) => !err.startsWith(field as string),
      );

      if (fieldErrors.length === 0) {
        const newErrors = { ...validationErrors };
        delete newErrors[index];
        setValidationErrors(newErrors);
      } else {
        setValidationErrors({
          ...validationErrors,
          [index]: fieldErrors,
        });
      }
    }
  };

  // Handle adding examples to a flashcard
  const handleAddExample = (index: number, example: string) => {
    if (!example.trim()) return;

    const updatedFlashcards = [...flashcards];
    const currentExamples = updatedFlashcards[index].examples || [];

    if (currentExamples.length < 10) {
      updatedFlashcards[index] = {
        ...updatedFlashcards[index],
        examples: [...currentExamples, example.trim()],
      };
      setFlashcards(updatedFlashcards);
    }
  };

  // Handle removing an example from a flashcard
  const handleRemoveExample = (
    flashcardIndex: number,
    exampleIndex: number,
  ) => {
    const updatedFlashcards = [...flashcards];
    const currentExamples = updatedFlashcards[flashcardIndex].examples || [];

    updatedFlashcards[flashcardIndex] = {
      ...updatedFlashcards[flashcardIndex],
      examples: currentExamples.filter((_, i) => i !== exampleIndex),
    };
    setFlashcards(updatedFlashcards);
  };

  // Add empty flashcard
  const addEmptyFlashcard = () => {
    setFlashcards([
      ...flashcards,
      {
        word: "",
        definition: "",
        partOfSpeech: "",
        phonetic: "",
        imageUrl: null,
        examples: [],
        note: "",
      },
    ]);
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
          <h1 className="text-xl font-semibold">Bulk Create Flashcards</h1>
        </div>
      </header>

      <main className="container py-6">
        <Card className="mx-auto max-w-4xl">
          <CardHeader>
            <CardTitle>Bulk Create Flashcards</CardTitle>
            <CardDescription>
              Create multiple flashcards at once by uploading an Excel file or
              adding them manually.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upload">Upload Excel</TabsTrigger>
                <TabsTrigger value="review">Review & Edit</TabsTrigger>
              </TabsList>

              <TabsContent value="upload" className="space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <Button variant="outline" onClick={downloadTemplate}>
                      <Download className="mr-2 h-4 w-4" />
                      Download Template
                    </Button>

                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        accept=".xlsx,.xls"
                        id="excel-upload"
                        className="hidden"
                        onChange={handleFileUpload}
                        disabled={isUploading}
                      />
                      <Button asChild disabled={isUploading}>
                        <label
                          htmlFor="excel-upload"
                          className="cursor-pointer"
                        >
                          {isUploading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="mr-2 h-4 w-4" />
                              Upload Excel
                            </>
                          )}
                        </label>
                      </Button>

                      <Button variant="outline" onClick={addEmptyFlashcard}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Manually
                      </Button>
                    </div>
                  </div>

                  <Alert>
                    <FileSpreadsheet className="h-4 w-4" />
                    <AlertTitle>Excel Format Instructions</AlertTitle>
                    <AlertDescription>
                      <p className="mb-2">
                        Your Excel file should have the following columns:
                      </p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>
                          <strong>word</strong> (required): The vocabulary word
                          or phrase
                        </li>
                        <li>
                          <strong>definition</strong> (required): The meaning of
                          the word
                        </li>
                        <li>
                          <strong>partOfSpeech</strong> (optional): Noun, verb,
                          adjective, etc.
                        </li>
                        <li>
                          <strong>phonetic</strong> (optional): Pronunciation
                          guide
                        </li>
                        <li>
                          <strong>imageUrl</strong> (optional): URL to an image
                        </li>
                        <li>
                          <strong>examples</strong> (optional): Example
                          sentences separated by semicolons
                        </li>
                        <li>
                          <strong>note</strong> (optional): Additional notes or
                          mnemonics
                        </li>
                      </ul>
                    </AlertDescription>
                  </Alert>
                </div>
              </TabsContent>

              <TabsContent value="review">
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                  >
                    <FormField
                      control={form.control}
                      name="topicId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Assign All to Topic (Optional)</FormLabel>
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
                            Optionally assign all flashcards to a single topic.
                            You can leave this blank.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {flashcards.length === 0 ? (
                      <div className="text-center py-8">
                        <FileSpreadsheet className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h3 className="mt-2 text-lg font-medium">
                          No flashcards yet
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Upload an Excel file or add flashcards manually to get
                          started.
                        </p>
                        <div className="mt-4 flex justify-center gap-2">
                          <Button variant="outline" asChild>
                            <label
                              htmlFor="excel-upload"
                              className="cursor-pointer"
                            >
                              <Upload className="mr-2 h-4 w-4" />
                              Upload Excel
                            </label>
                          </Button>
                          <Button onClick={addEmptyFlashcard}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Manually
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="flex justify-between items-center">
                          <h3 className="text-lg font-medium">
                            {flashcards.length} Flashcard
                            {flashcards.length !== 1 ? "s" : ""}
                          </h3>
                          <Button variant="outline" onClick={addEmptyFlashcard}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Flashcard
                          </Button>
                        </div>

                        <ScrollArea className="h-[500px] rounded-md border">
                          <div className="p-4 space-y-8">
                            {flashcards.map((flashcard, index) => (
                              <div key={index} className="space-y-4">
                                <div className="flex justify-between items-center">
                                  <h4 className="text-md font-medium">
                                    Flashcard #{index + 1}
                                  </h4>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleRemoveFlashcard(index)}
                                  >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                    <span className="sr-only">
                                      Remove flashcard
                                    </span>
                                  </Button>
                                </div>

                                {validationErrors[index] &&
                                  validationErrors[index].length > 0 && (
                                    <Alert
                                      variant="destructive"
                                      className="mb-4"
                                    >
                                      <AlertTitle>Validation Errors</AlertTitle>
                                      <AlertDescription>
                                        <ul className="list-disc pl-5">
                                          {validationErrors[index].map(
                                            (error, i) => (
                                              <li key={i}>{error}</li>
                                            ),
                                          )}
                                        </ul>
                                      </AlertDescription>
                                    </Alert>
                                  )}

                                <div className="grid gap-4 md:grid-cols-2">
                                  <div>
                                    <FormLabel htmlFor={`word-${index}`}>
                                      Word
                                    </FormLabel>
                                    <Input
                                      id={`word-${index}`}
                                      value={flashcard.word || ""}
                                      onChange={(e) =>
                                        handleEditFlashcard(
                                          index,
                                          "word",
                                          e.target.value,
                                        )
                                      }
                                      placeholder="e.g., Facilitate"
                                      className={
                                        validationErrors[index]?.some((err) =>
                                          err.startsWith("word"),
                                        )
                                          ? "border-destructive"
                                          : ""
                                      }
                                    />
                                  </div>

                                  <div>
                                    <FormLabel
                                      htmlFor={`partOfSpeech-${index}`}
                                    >
                                      Part of Speech
                                    </FormLabel>
                                    <Input
                                      id={`partOfSpeech-${index}`}
                                      value={flashcard.partOfSpeech || ""}
                                      onChange={(e) =>
                                        handleEditFlashcard(
                                          index,
                                          "partOfSpeech",
                                          e.target.value,
                                        )
                                      }
                                      placeholder="e.g., noun"
                                    />
                                  </div>
                                </div>

                                <div>
                                  <FormLabel htmlFor={`definition-${index}`}>
                                    Definition
                                  </FormLabel>
                                  <Textarea
                                    id={`definition-${index}`}
                                    value={flashcard.definition || ""}
                                    onChange={(e) =>
                                      handleEditFlashcard(
                                        index,
                                        "definition",
                                        e.target.value,
                                      )
                                    }
                                    placeholder="Enter the definition"
                                    className={
                                      validationErrors[index]?.some((err) =>
                                        err.startsWith("definition"),
                                      )
                                        ? "border-destructive"
                                        : ""
                                    }
                                  />
                                </div>

                                <div>
                                  <FormLabel htmlFor={`phonetic-${index}`}>
                                    Phonetic
                                  </FormLabel>
                                  <Input
                                    id={`phonetic-${index}`}
                                    value={flashcard.phonetic || ""}
                                    onChange={(e) =>
                                      handleEditFlashcard(
                                        index,
                                        "phonetic",
                                        e.target.value,
                                      )
                                    }
                                    placeholder="e.g., /fəˈsɪlɪteɪt/"
                                  />
                                </div>

                                <div>
                                  <FormLabel htmlFor={`examples-${index}`}>
                                    Examples
                                  </FormLabel>
                                  <div className="space-y-2">
                                    {(flashcard.examples || []).map(
                                      (example, exampleIndex) => (
                                        <div
                                          key={exampleIndex}
                                          className="flex items-center gap-2"
                                        >
                                          <Input value={example} disabled />
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() =>
                                              handleRemoveExample(
                                                index,
                                                exampleIndex,
                                              )
                                            }
                                          >
                                            <X className="h-4 w-4" />
                                            <span className="sr-only">
                                              Remove example
                                            </span>
                                          </Button>
                                        </div>
                                      ),
                                    )}

                                    {(flashcard.examples || []).length < 10 && (
                                      <div className="flex items-center gap-2">
                                        <Input
                                          id={`new-example-${index}`}
                                          placeholder="Add an example sentence"
                                          onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                              e.preventDefault();
                                              handleAddExample(
                                                index,
                                                e.currentTarget.value,
                                              );
                                              e.currentTarget.value = "";
                                            }
                                          }}
                                        />
                                        <Button
                                          type="button"
                                          variant="outline"
                                          size="icon"
                                          onClick={(e) => {
                                            const input =
                                              document.getElementById(
                                                `new-example-${index}`,
                                              ) as HTMLInputElement;
                                            handleAddExample(
                                              index,
                                              input.value,
                                            );
                                            input.value = "";
                                          }}
                                        >
                                          <Plus className="h-4 w-4" />
                                          <span className="sr-only">
                                            Add example
                                          </span>
                                        </Button>
                                      </div>
                                    )}
                                    <p className="text-xs text-muted-foreground">
                                      Press Enter to add.{" "}
                                      {(flashcard.examples || []).length}/10
                                      examples.
                                    </p>
                                  </div>
                                </div>

                                <div>
                                  <FormLabel htmlFor={`note-${index}`}>
                                    Notes
                                  </FormLabel>
                                  <Textarea
                                    id={`note-${index}`}
                                    value={flashcard.note || ""}
                                    onChange={(e) =>
                                      handleEditFlashcard(
                                        index,
                                        "note",
                                        e.target.value,
                                      )
                                    }
                                    placeholder="Add any additional notes or mnemonics"
                                  />
                                </div>

                                <div>
                                  <FormLabel htmlFor={`imageUrl-${index}`}>
                                    Image URL
                                  </FormLabel>
                                  <Input
                                    id={`imageUrl-${index}`}
                                    value={flashcard.imageUrl || ""}
                                    onChange={(e) =>
                                      handleEditFlashcard(
                                        index,
                                        "imageUrl",
                                        e.target.value,
                                      )
                                    }
                                    placeholder="https://example.com/image.jpg"
                                  />
                                </div>

                                <Separator />
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </div>
                    )}
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" asChild>
              <Link href="/flashcards">Cancel</Link>
            </Button>
            <Button
              onClick={form.handleSubmit(onSubmit)}
              disabled={createFlashcards.isPending || flashcards.length === 0}
            >
              {createFlashcards.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Create {flashcards.length} Flashcard
                  {flashcards.length !== 1 ? "s" : ""}
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
