"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { z } from "zod";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Check,
  Clock,
  Edit,
  Heart,
  MoreHorizontal,
  Play,
  Plus,
  Search,
  Share2,
  Shuffle,
  SortAsc,
  Star,
  Users,
  X,
  Trash2,
} from "lucide-react";
import Link from "next/link";

import { Button } from "@workspace/ui/components/button";
import { Card, CardContent } from "@workspace/ui/components/card";
import { Input } from "@workspace/ui/components/input";
import { Badge } from "@workspace/ui/components/badge";
import { Progress } from "@workspace/ui/components/progress";
import { Tabs, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { useQuery } from "@tanstack/react-query";
import { getMeQueryOptions } from "@/lib/queries";
import { api } from "@/lib/api";
import { HttpStatus } from "@workspace/contracts";

// Word schema
const WordSchema = z.object({
  id: z.string().uuid(),
  word: z.string(),
  definition: z.string(),
  partOfSpeech: z.string(),
  example: z.string().nullable(),
  difficulty: z.enum(["easy", "medium", "hard"]),
  progress: z.number().min(0).max(100),
  lastReviewed: z.string().datetime().nullable(),
  status: z.enum(["new", "learning", "reviewing", "mastered"]),
  topicId: z.string().uuid(),
});

type Word = z.infer<typeof WordSchema>;

export default function TopicDetailPage() {
  const { topicId } = useParams<{ topicId: string }>();
  const router = useRouter();
  const { data: user } = useQuery(getMeQueryOptions);
  const { data: topic, isLoading } = useQuery({
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
    enabled: !!topicId,
    select: (data) => data.body,
  });

  const [words] = useState<Word[]>([]);

  // State for filtering and sorting
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [sortBy, setSortBy] = useState("alphabetical");

  const isCreatedByMe = useMemo(() => {
    return topic?.createdBy === user?.id;
  }, [user?.id, topic?.id]);

  // Filter and sort words
  const filteredWords = words
    .filter((word) => {
      // Filter by search query
      const matchesSearch =
        word.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
        word.definition.toLowerCase().includes(searchQuery.toLowerCase());

      // Filter by status
      const matchesStatus =
        statusFilter === "all" || word.status === statusFilter;

      // Filter by difficulty
      const matchesDifficulty =
        difficultyFilter === "all" || word.difficulty === difficultyFilter;

      return matchesSearch && matchesStatus && matchesDifficulty;
    })
    .sort((a, b) => {
      // Sort words
      if (sortBy === "alphabetical") {
        return a.word.localeCompare(b.word);
      } else if (sortBy === "progress-asc") {
        return a.progress - b.progress;
      } else if (sortBy === "progress-desc") {
        return b.progress - a.progress;
      } else if (sortBy === "recently-reviewed") {
        const dateA = a.lastReviewed ? new Date(a.lastReviewed).getTime() : 0;
        const dateB = b.lastReviewed ? new Date(b.lastReviewed).getTime() : 0;
        return dateB - dateA;
      }
      return 0;
    });

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Format last reviewed date
  const formatLastReviewed = (dateString: string | null) => {
    if (!dateString) return "Never";

    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return formatDate(dateString);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setDifficultyFilter("all");
    setSortBy("alphabetical");
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-sm text-muted-foreground">Loading topic...</p>
        </div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <h1 className="text-2xl font-bold">Topic not found</h1>
        <p className="text-muted-foreground">
          The topic you're looking for doesn't exist or has been removed.
        </p>
        <Button asChild className="mt-4">
          <Link href="/topics">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Topics
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/topics">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back</span>
              </Link>
            </Button>
            <h1 className="text-xl font-semibold">Topic Details</h1>
          </div>
          <div className="flex items-center gap-2">
            {topic.isPublic && !isCreatedByMe && (
              <Button variant="outline" size="sm">
                <Heart className="h-4 w-4" />
                Save
              </Button>
            )}
            <Button variant="outline" size="sm" className="gap-1">
              <Share2 className="h-4 w-4" />
              Share
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">More options</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {isCreatedByMe && (
                  <DropdownMenuItem asChild>
                    <Link href={`/topics/${topic.id}/edit`}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Topic
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem>
                  <BookOpen className="mr-2 h-4 w-4" />
                  Export Words
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem
                      onSelect={(e) => e.preventDefault()}
                      className="text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      {isCreatedByMe ? "Delete Topic" : "Remove from My Topics"}
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        {isCreatedByMe
                          ? "Delete topic?"
                          : "Remove from your topics?"}
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        {isCreatedByMe
                          ? "This will permanently delete this topic and all associated words."
                          : "This will remove this topic from your saved topics."}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => router.push("/topics")}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        {isCreatedByMe ? "Delete" : "Remove"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="container py-6">
        {/* Topic overview card */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="flex items-start gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold">{topic.name}</h2>
                    {topic.isPublic ? (
                      <Badge
                        variant="outline"
                        className="bg-green-50 text-green-700"
                      >
                        Public
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="bg-blue-50 text-blue-700"
                      >
                        Private
                      </Badge>
                    )}
                  </div>
                  <p className="mt-1 text-muted-foreground">
                    {topic.description}
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-2 rounded-lg border p-3 md:min-w-[200px]">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Words</span>
                  <span className="font-medium">{topic.count}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Progress
                  </span>
                  <span className="font-medium">{topic.progress}%</span>
                </div>
                <Progress value={topic.progress} className="h-2" />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    <Calendar className="mr-1 inline-block h-3 w-3" />
                    Created {formatDate(topic.createdAt)}
                  </span>
                  {topic.lastStudiedAt && (
                    <span>
                      <Clock className="mr-1 inline-block h-3 w-3" />
                      Studied {topic.lastStudiedAt}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Study actions */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Button size="lg" className="h-auto py-6">
            <div className="flex flex-col items-center gap-2">
              <Play className="h-6 w-6" />
              <span>Study All Words</span>
            </div>
          </Button>
          <Button size="lg" variant="outline" className="h-auto py-6">
            <div className="flex flex-col items-center gap-2">
              <Shuffle className="h-6 w-6" />
              <span>Random Review</span>
            </div>
          </Button>
          <Button size="lg" variant="outline" className="h-auto py-6">
            <div className="flex flex-col items-center gap-2">
              <BookOpen className="h-6 w-6" />
              <span>Flashcards</span>
            </div>
          </Button>
          <Button size="lg" variant="outline" className="h-auto py-6">
            <div className="flex flex-col items-center gap-2">
              <Plus className="h-6 w-6" />
              <span>Add New Words</span>
            </div>
          </Button>
        </div>

        {/* Words section */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Words</h2>
          <Tabs defaultValue="all" className="w-[400px]">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="new">New</TabsTrigger>
              <TabsTrigger value="learning">Learning</TabsTrigger>
              <TabsTrigger value="mastered">Mastered</TabsTrigger>
            </TabsList>
          </Tabs>
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
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="learning">Learning</SelectItem>
                <SelectItem value="reviewing">Reviewing</SelectItem>
                <SelectItem value="mastered">Mastered</SelectItem>
              </SelectContent>
            </Select>

            {/* Difficulty filter */}
            <Select
              value={difficultyFilter}
              onValueChange={setDifficultyFilter}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Difficulty</SelectItem>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort options */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
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
              difficultyFilter !== "all" ||
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

          {/* Results count */}
          <div className="text-sm text-muted-foreground">
            Showing {filteredWords.length} of {words.length} words
          </div>
        </div>

        {/* Word list */}
        {filteredWords.length > 0 ? (
          <div className="space-y-3">
            {filteredWords.map((word) => (
              <Card key={word.id} className="transition-all hover:shadow-md">
                <CardContent className="p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold">{word.word}</h3>
                        <Badge
                          variant="outline"
                          className="text-xs font-normal"
                        >
                          {word.partOfSpeech}
                        </Badge>
                        {getStatusBadge(word.status)}
                      </div>
                      <p className="text-muted-foreground">{word.definition}</p>
                      {word.example && (
                        <p className="mt-1 text-sm italic text-muted-foreground">
                          "{word.example}"
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {formatLastReviewed(word.lastReviewed)}
                        </span>
                        {getDifficultyBadge(word.difficulty)}
                      </div>
                      <div className="w-32">
                        <div className="mb-1 flex items-center justify-between text-xs">
                          <span>Progress</span>
                          <span className="font-medium">{word.progress}%</span>
                        </div>
                        <Progress value={word.progress} className="h-1.5" />
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/words/${word.word.toLowerCase()}`}>
                          View Details
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
            <BookOpen className="mb-2 h-10 w-10 text-muted-foreground" />
            <h3 className="text-lg font-medium">No words found</h3>
            <p className="text-sm text-muted-foreground">
              {searchQuery ||
              statusFilter !== "all" ||
              difficultyFilter !== "all"
                ? "Try adjusting your filters or search query"
                : "This topic doesn't have any words yet"}
            </p>
            {searchQuery ||
            statusFilter !== "all" ||
            difficultyFilter !== "all" ? (
              <Button variant="outline" onClick={clearFilters} className="mt-4">
                Clear All Filters
              </Button>
            ) : (
              <Button className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Add Words
              </Button>
            )}
          </div>
        )}

        {/* Pagination */}
        {filteredWords.length > 10 && (
          <div className="mt-6 flex items-center justify-center">
            <Button variant="outline" size="sm">
              Load More
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}

// Helper function to get status badge
function getStatusBadge(status: string) {
  switch (status) {
    case "new":
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700">
          New
        </Badge>
      );
    case "learning":
      return (
        <Badge variant="outline" className="bg-amber-50 text-amber-700">
          Learning
        </Badge>
      );
    case "reviewing":
      return (
        <Badge variant="outline" className="bg-purple-50 text-purple-700">
          Reviewing
        </Badge>
      );
    case "mastered":
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700">
          <Check className="mr-1 h-3 w-3" />
          Mastered
        </Badge>
      );
    default:
      return null;
  }
}

// Helper function to get difficulty badge
function getDifficultyBadge(difficulty: string) {
  switch (difficulty) {
    case "easy":
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700">
          Easy
        </Badge>
      );
    case "medium":
      return (
        <Badge variant="outline" className="bg-amber-50 text-amber-700">
          Medium
        </Badge>
      );
    case "hard":
      return (
        <Badge variant="outline" className="bg-red-50 text-red-700">
          Hard
        </Badge>
      );
    default:
      return null;
  }
}
