"use client";

import { useState } from "react";
import {
  BookOpen,
  ChevronDown,
  Clock,
  Edit,
  Filter,
  Plus,
  Search,
  SortAsc,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";

import { Button } from "@workspace/ui/components/button";
import { Card, CardContent } from "@workspace/ui/components/card";
import { Input } from "@workspace/ui/components/input";
import { Progress } from "@workspace/ui/components/progress";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Badge } from "@workspace/ui/components/badge";
import { Separator } from "@workspace/ui/components/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@workspace/ui/components/alert-dialog";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useDebounce } from "@uidotdev/usehooks";
import { toast } from "sonner";

// Sample flashcard data (replace with actual API data)
const sampleFlashcards = [
  {
    id: "1",
    word: "Facilitate",
    definition: "To make an action or process easier",
    progress: 85,
    status: "mastered",
    partOfSpeech: "verb",
    difficulty: "medium",
    topicName: "Business",
    tags: ["Business", "Communication"],
    lastReviewed: "2 days ago",
  },
  {
    id: "2",
    word: "Implement",
    definition: "To put a decision, plan, agreement, etc. into effect",
    progress: 65,
    status: "in-progress",
    partOfSpeech: "verb",
    difficulty: "medium",
    topicName: "Business",
    tags: ["Business", "Management"],
    lastReviewed: "1 day ago",
  },
  {
    id: "3",
    word: "Negotiate",
    definition: "To try to reach an agreement by formal discussion",
    progress: 40,
    status: "in-progress",
    partOfSpeech: "verb",
    difficulty: "hard",
    topicName: "Business",
    tags: ["Business", "Communication"],
    lastReviewed: "3 days ago",
  },
  {
    id: "4",
    word: "Accommodate",
    definition: "To provide someone with a place to live or stay temporarily",
    progress: 20,
    status: "in-progress",
    partOfSpeech: "verb",
    difficulty: "hard",
    topicName: "Travel",
    tags: ["Travel", "Hospitality"],
    lastReviewed: "5 days ago",
  },
  {
    id: "5",
    word: "Itinerary",
    definition: "A planned route or journey; a travel plan",
    progress: 90,
    status: "mastered",
    partOfSpeech: "noun",
    difficulty: "medium",
    topicName: "Travel",
    tags: ["Travel"],
    lastReviewed: "1 week ago",
  },
  {
    id: "6",
    word: "Delegate",
    definition: "To give a particular job or responsibility to someone else",
    progress: 75,
    status: "in-progress",
    partOfSpeech: "verb",
    difficulty: "medium",
    topicName: "Business",
    tags: ["Business", "Management"],
    lastReviewed: "2 days ago",
  },
];

// Available topics for filtering
const allTopics = [
  "Business",
  "Communication",
  "Management",
  "Travel",
  "Hospitality",
  "Legal",
  "Finance",
];

// Available parts of speech for filtering
const allPartsOfSpeech = [
  "noun",
  "verb",
  "adjective",
  "adverb",
  "preposition",
  "conjunction",
  "pronoun",
];

// Available difficulties for filtering
const allDifficulties = ["easy", "medium", "hard"];

export default function FlashcardsPage() {
  // State for filters
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedPartsOfSpeech, setSelectedPartsOfSpeech] = useState<string[]>(
    [],
  );
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>(
    [],
  );
  const [sortBy, setSortBy] = useState("alphabetical");

  // Fetch flashcards
  const {
    data: flashcardsData,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isError,
    refetch,
  } = useInfiniteQuery({
    queryKey: [
      "flashcards",
      debouncedSearchQuery,
      statusFilter,
      selectedTopics,
      selectedPartsOfSpeech,
      selectedDifficulties,
      sortBy,
    ],
    queryFn: async ({ pageParam }) => {
      // In a real app, this would call the API with all the filters
      // For now, we'll use the sample data
      return {
        items: sampleFlashcards,
        nextCursor: null,
      };
    },
    initialPageParam: "",
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  const flashcards = flashcardsData?.pages.flatMap((page) => page.items) || [];

  // Toggle topic selection
  const toggleTopic = (topic: string) => {
    if (selectedTopics.includes(topic)) {
      setSelectedTopics(selectedTopics.filter((t) => t !== topic));
    } else {
      setSelectedTopics([...selectedTopics, topic]);
    }
  };

  // Toggle part of speech selection
  const togglePartOfSpeech = (pos: string) => {
    if (selectedPartsOfSpeech.includes(pos)) {
      setSelectedPartsOfSpeech(selectedPartsOfSpeech.filter((p) => p !== pos));
    } else {
      setSelectedPartsOfSpeech([...selectedPartsOfSpeech, pos]);
    }
  };

  // Toggle difficulty selection
  const toggleDifficulty = (difficulty: string) => {
    if (selectedDifficulties.includes(difficulty)) {
      setSelectedDifficulties(
        selectedDifficulties.filter((d) => d !== difficulty),
      );
    } else {
      setSelectedDifficulties([...selectedDifficulties, difficulty]);
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setSelectedTopics([]);
    setSelectedPartsOfSpeech([]);
    setSelectedDifficulties([]);
    setSortBy("alphabetical");
  };

  // Delete flashcard
  const deleteFlashcard = async (id: string) => {
    try {
      // In a real app, this would call the API to delete the flashcard
      toast.success("Flashcard deleted", {
        description: "The flashcard has been deleted successfully.",
      });
      // Refetch the flashcards
      refetch();
    } catch (error) {
      console.error("Error deleting flashcard:", error);
      toast.error("Error", {
        description: "Failed to delete flashcard. Please try again.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="container py-4">
          <h1 className="text-2xl font-bold">Flashcards</h1>
          <p className="text-sm text-muted-foreground">
            Browse and manage your vocabulary flashcards
          </p>
        </div>
      </header>

      <main className="container py-6">
        {/* Action buttons */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <Button asChild>
            <Link href="/flashcards/create">
              <Plus className="mr-2 h-4 w-4" />
              Create Flashcard
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/flashcards/study">
              <BookOpen className="mr-2 h-4 w-4" />
              Study Flashcards
            </Link>
          </Button>
        </div>

        {/* Search and filter section */}
        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search words or definitions..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 rounded-full"
                onClick={() => setSearchQuery("")}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Clear search</span>
              </Button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {/* Status filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Words</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="mastered">Mastered</SelectItem>
              </SelectContent>
            </Select>

            {/* Topic filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-1">
                  <Filter className="h-4 w-4" />
                  Topics
                  {selectedTopics.length > 0 && (
                    <Badge
                      variant="secondary"
                      className="ml-1 rounded-full px-1.5 py-0 text-xs"
                    >
                      {selectedTopics.length}
                    </Badge>
                  )}
                  <ChevronDown className="ml-1 h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[200px]">
                <DropdownMenuLabel>Filter by Topic</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {allTopics.map((topic) => (
                  <DropdownMenuCheckboxItem
                    key={topic}
                    checked={selectedTopics.includes(topic)}
                    onCheckedChange={() => toggleTopic(topic)}
                  >
                    {topic}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Part of Speech filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-1">
                  <Filter className="h-4 w-4" />
                  Part of Speech
                  {selectedPartsOfSpeech.length > 0 && (
                    <Badge
                      variant="secondary"
                      className="ml-1 rounded-full px-1.5 py-0 text-xs"
                    >
                      {selectedPartsOfSpeech.length}
                    </Badge>
                  )}
                  <ChevronDown className="ml-1 h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[200px]">
                <DropdownMenuLabel>Filter by Part of Speech</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {allPartsOfSpeech.map((pos) => (
                  <DropdownMenuCheckboxItem
                    key={pos}
                    checked={selectedPartsOfSpeech.includes(pos)}
                    onCheckedChange={() => togglePartOfSpeech(pos)}
                  >
                    {pos.charAt(0).toUpperCase() + pos.slice(1)}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Difficulty filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-1">
                  <Filter className="h-4 w-4" />
                  Difficulty
                  {selectedDifficulties.length > 0 && (
                    <Badge
                      variant="secondary"
                      className="ml-1 rounded-full px-1.5 py-0 text-xs"
                    >
                      {selectedDifficulties.length}
                    </Badge>
                  )}
                  <ChevronDown className="ml-1 h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[200px]">
                <DropdownMenuLabel>Filter by Difficulty</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {allDifficulties.map((difficulty) => (
                  <DropdownMenuCheckboxItem
                    key={difficulty}
                    checked={selectedDifficulties.includes(difficulty)}
                    onCheckedChange={() => toggleDifficulty(difficulty)}
                  >
                    {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Sort options */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[140px]">
                <SortAsc className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="alphabetical">Alphabetical</SelectItem>
                <SelectItem value="progress-asc">
                  Progress (Low-High)
                </SelectItem>
                <SelectItem value="progress-desc">
                  Progress (High-Low)
                </SelectItem>
                <SelectItem value="recently-reviewed">
                  Recently Reviewed
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Clear filters button - only show if filters are applied */}
            {(searchQuery ||
              statusFilter !== "all" ||
              selectedTopics.length > 0 ||
              selectedPartsOfSpeech.length > 0 ||
              selectedDifficulties.length > 0 ||
              sortBy !== "alphabetical") && (
              <Button
                variant="ghost"
                onClick={clearFilters}
                className="ml-auto"
              >
                <X className="mr-2 h-4 w-4" />
                Clear Filters
              </Button>
            )}
          </div>

          {/* Active filters display */}
          <div className="flex flex-wrap gap-1">
            {selectedTopics.map((topic) => (
              <Badge
                key={topic}
                variant="secondary"
                className="flex items-center gap-1"
              >
                {topic}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0"
                  onClick={() => toggleTopic(topic)}
                >
                  <X className="h-3 w-3" />
                  <span className="sr-only">Remove {topic} filter</span>
                </Button>
              </Badge>
            ))}
            {selectedPartsOfSpeech.map((pos) => (
              <Badge
                key={pos}
                variant="secondary"
                className="flex items-center gap-1"
              >
                {pos.charAt(0).toUpperCase() + pos.slice(1)}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0"
                  onClick={() => togglePartOfSpeech(pos)}
                >
                  <X className="h-3 w-3" />
                  <span className="sr-only">Remove {pos} filter</span>
                </Button>
              </Badge>
            ))}
            {selectedDifficulties.map((difficulty) => (
              <Badge
                key={difficulty}
                variant="secondary"
                className="flex items-center gap-1"
              >
                {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0"
                  onClick={() => toggleDifficulty(difficulty)}
                >
                  <X className="h-3 w-3" />
                  <span className="sr-only">Remove {difficulty} filter</span>
                </Button>
              </Badge>
            ))}
          </div>

          {/* Results count */}
          <div className="text-sm text-muted-foreground">
            Showing {flashcards.length} flashcards
          </div>
        </div>

        {/* Flashcards grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="mt-4 text-sm text-muted-foreground">
              Loading flashcards...
            </p>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
            <X className="mb-2 h-10 w-10 text-red-500" />
            <h3 className="text-lg font-medium">Failed to load flashcards</h3>
            <p className="text-sm text-muted-foreground">
              There was an error loading your flashcards. Please try again.
            </p>
            <Button
              variant="outline"
              onClick={() => refetch()}
              className="mt-4"
            >
              Retry
            </Button>
          </div>
        ) : flashcards.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {flashcards.map((flashcard) => (
              <Card
                key={flashcard.id}
                className="h-full transition-all hover:shadow-md"
              >
                <CardContent className="p-4">
                  <div className="mb-2 flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-semibold">
                        {flashcard.word}
                      </h3>
                      <Badge
                        variant="outline"
                        className="text-xs font-normal text-muted-foreground"
                      >
                        {flashcard.partOfSpeech}
                      </Badge>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-4 w-4"
                          >
                            <circle cx="12" cy="12" r="1" />
                            <circle cx="12" cy="5" r="1" />
                            <circle cx="12" cy="19" r="1" />
                          </svg>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/flashcards/${flashcard.id}`}>
                            <BookOpen className="mr-2 h-4 w-4" />
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/flashcards/${flashcard.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem
                              onSelect={(e) => e.preventDefault()}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Delete flashcard?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete this flashcard and
                                all associated data.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteFlashcard(flashcard.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {flashcard.definition}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {flashcard.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{flashcard.topicName}</span>
                    <span className="flex items-center">
                      <Clock className="mr-1 h-3 w-3" />
                      {flashcard.lastReviewed}
                    </span>
                  </div>
                  <Separator className="my-3" />
                  <div className="w-full">
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span>Progress</span>
                      <span className="font-medium">{flashcard.progress}%</span>
                    </div>
                    <Progress value={flashcard.progress} className="h-1.5" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
            <BookOpen className="mb-2 h-10 w-10 text-muted-foreground" />
            <h3 className="text-lg font-medium">No flashcards found</h3>
            <p className="text-sm text-muted-foreground">
              {searchQuery ||
              statusFilter !== "all" ||
              selectedTopics.length > 0 ||
              selectedPartsOfSpeech.length > 0 ||
              selectedDifficulties.length > 0
                ? "Try adjusting your filters or search query"
                : "You haven't created any flashcards yet"}
            </p>
            {searchQuery ||
            statusFilter !== "all" ||
            selectedTopics.length > 0 ||
            selectedPartsOfSpeech.length > 0 ||
            selectedDifficulties.length > 0 ? (
              <Button variant="outline" onClick={clearFilters} className="mt-4">
                Clear All Filters
              </Button>
            ) : (
              <Button asChild className="mt-4">
                <Link href="/flashcards/create">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Flashcard
                </Link>
              </Button>
            )}
          </div>
        )}

        {/* Load more button */}
        {hasNextPage && (
          <div className="mt-6 flex justify-center">
            <Button
              variant="outline"
              onClick={() => fetchNextPage()}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                  Loading...
                </>
              ) : (
                "Load More"
              )}
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
