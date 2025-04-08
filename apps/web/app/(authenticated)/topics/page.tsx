"use client";

import { useCallback, useState } from "react";
import {
  BookOpen,
  Edit,
  Filter,
  Plus,
  Search,
  Trash2,
  Users,
  X,
} from "lucide-react";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@workspace/ui/components/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@workspace/ui/components/dropdown-menu";
import { Badge } from "@workspace/ui/components/badge";
import { z } from "zod";
import { HttpStatus, TopicSchema } from "@workspace/contracts";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { getQueryClient } from "@/app/get-query-client";
import { useDebounce } from "@uidotdev/usehooks";
import { getMeQueryOptions } from "@/lib/queries";

type Topic = z.infer<typeof TopicSchema>;

export default function TopicsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [activeTab, setActiveTab] = useState<"my-topics" | "public-topics">(
    "my-topics",
  );
  const { data: user } = useQuery(getMeQueryOptions);

  const {
    data: myTopicsData,
    fetchNextPage: fetchNextMyTopicsPage,
    hasNextPage: hasNextMyTopicsPage,
    isLoading: isLoadingMyTopics,
    isError: isErrorMyTopics,
  } = useInfiniteQuery({
    queryKey: ["topics", "my", debouncedSearchQuery],
    queryFn: async ({ pageParam }) => {
      const response = await api.topic.listMyTopics({
        query: {
          search: searchQuery,
          cursor: pageParam,
        },
      });
      if (response.status !== HttpStatus.OK) {
        throw new Error("Failed to fetch topics");
      }
      return response.body;
    },
    initialPageParam: "",
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  const {
    data: publicTopicsData,
    fetchNextPage: fetchNextPublicTopicsPage,
    hasNextPage: hasNextPublicTopicsPage,
    isLoading: isLoadingPublicTopics,
    isError: isErrorPublicTopics,
  } = useInfiniteQuery({
    queryKey: ["topics", "public", debouncedSearchQuery],
    queryFn: async ({ pageParam }) => {
      const response = await api.topic.listPublicTopics({
        query: {
          search: searchQuery,
          cursor: pageParam,
        },
      });
      if (response.status !== HttpStatus.OK) {
        throw new Error("Failed to fetch topics");
      }
      return response.body;
    },
    initialPageParam: "",
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  const myTopics = myTopicsData?.pages.flatMap((page) => page.items) || [];
  const publicTopics =
    publicTopicsData?.pages.flatMap((page) => page.items) || [];

  const isCreatedByMe = useCallback(
    (topic: Topic) => {
      return topic.createdBy === user?.id;
    },
    [user?.id],
  );

  const deleteTopic = async (id: string) => {
    try {
      const response = await api.topic.deleteTopic({
        params: { id },
      });
      if (response.status !== HttpStatus.OK) {
        throw new Error("Failed to delete topic");
      }
      getQueryClient().invalidateQueries({ queryKey: ["list-my-topics"] });
    } catch (error) {
      console.error("Error deleting topic:", error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="container py-4">
          <h1 className="text-2xl font-bold">Topics</h1>
          <p className="text-sm text-muted-foreground">
            Browse and manage vocabulary topics
          </p>
        </div>
      </header>

      <main className="container py-6">
        {/* Main tabs for My Topics vs Public Topics */}
        <Tabs
          defaultValue="my-topics"
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as any)}
        >
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <TabsList className="w-full sm:w-auto">
              <TabsTrigger
                value="my-topics"
                className="flex items-center gap-1"
              >
                <BookOpen className="h-4 w-4" />
                My Topics
              </TabsTrigger>
              <TabsTrigger
                value="public-topics"
                className="flex items-center gap-1"
              >
                <Users className="h-4 w-4" />
                Public Topics
              </TabsTrigger>
            </TabsList>

            {activeTab === "my-topics" ? (
              <Button asChild>
                <Link href="/topics/create">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Topic
                </Link>
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="bg-primary/10 text-primary"
                ></Badge>
                <Button variant="outline" asChild>
                  <Link href="/topics/browse">Browse All</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Search and filter section */}
          <div className="mb-6 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={`Search ${activeTab === "my-topics" ? "your" : "public"} topics...`}
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

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="h-8">
                  <Filter className="mr-2 h-3.5 w-3.5" />
                  Filter
                </Button>
                <Badge variant="outline" className="text-xs">
                  {activeTab === "my-topics"
                    ? `${myTopics.length} topics`
                    : `${publicTopics.length} topics`}
                </Badge>
              </div>
            </div>
          </div>

          {/* My Topics Content */}
          <TabsContent value="my-topics" className="mt-0">
            {isLoadingMyTopics && myTopics.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                <p className="mt-4 text-sm text-muted-foreground">
                  Loading topics...
                </p>
              </div>
            ) : isErrorMyTopics ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                <X className="mb-2 h-10 w-10 text-red-500" />
                <h3 className="text-lg font-medium">Failed to load topics</h3>
                <p className="text-sm text-muted-foreground">
                  There was an error loading your topics. Please try again.
                </p>
                <Button variant="outline" className="mt-4">
                  Retry
                </Button>
              </div>
            ) : myTopics.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {myTopics.map((topic) => {
                  return (
                    <Card
                      key={topic.id}
                      className="h-full transition-all hover:shadow-md"
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <CardTitle>{topic.name}</CardTitle>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                              >
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
                                <Link href={`/topics/${topic.id}`}>
                                  <BookOpen className="mr-2 h-4 w-4" />
                                  Study
                                </Link>
                              </DropdownMenuItem>
                              {isCreatedByMe(topic) && (
                                <DropdownMenuItem asChild>
                                  <Link href={`/topics/${topic.id}/edit`}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                  </Link>
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem
                                    onSelect={(e) => e.preventDefault()}
                                    className="text-red-600"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    {isCreatedByMe(topic) ? "Delete" : "Remove"}
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      {isCreatedByMe(topic)
                                        ? "Delete topic?"
                                        : "Remove from your topics?"}
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      {isCreatedByMe(topic)
                                        ? "This will permanently delete this topic and all associated data."
                                        : "This will remove this topic from your saved topics."}
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => deleteTopic(topic.id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      {isCreatedByMe(topic)
                                        ? "Delete"
                                        : "Remove"}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <CardDescription className="line-clamp-2">
                          {topic.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="mb-3 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {isCreatedByMe(topic) ? (
                              <Badge
                                variant="outline"
                                className="bg-blue-50 text-blue-700"
                              >
                                Created
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="bg-green-50 text-green-700"
                              >
                                Saved
                              </Badge>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {formatDate(topic.createdAt)}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                <BookOpen className="mb-2 h-10 w-10 text-muted-foreground" />
                <h3 className="text-lg font-medium">No topics found</h3>
                <p className="text-sm text-muted-foreground">
                  {searchQuery
                    ? "Try adjusting your search query"
                    : "You haven't created or saved any topics yet"}
                </p>
                {searchQuery ? (
                  <Button
                    variant="outline"
                    onClick={() => setSearchQuery("")}
                    className="mt-4"
                  >
                    Clear Search
                  </Button>
                ) : (
                  <div className="mt-4 flex gap-2">
                    <Button asChild>
                      <Link href="/topics/create">
                        <Plus className="mr-2 h-4 w-4" />
                        Create Topic
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setActiveTab("public-topics")}
                    >
                      Browse Public Topics
                    </Button>
                  </div>
                )}
              </div>
            )}
            {hasNextMyTopicsPage && (
              <div className="mt-6 flex justify-center">
                <Button
                  variant="outline"
                  onClick={() => fetchNextMyTopicsPage()}
                  disabled={isLoadingMyTopics}
                >
                  {isLoadingMyTopics ? (
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
          </TabsContent>

          {/* Public Topics Content */}
          <TabsContent value="public-topics" className="mt-0">
            {isLoadingPublicTopics && publicTopics.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                <p className="mt-4 text-sm text-muted-foreground">
                  Loading topics...
                </p>
              </div>
            ) : isErrorPublicTopics ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                <X className="mb-2 h-10 w-10 text-red-500" />
                <h3 className="text-lg font-medium">Failed to load topics</h3>
                <p className="text-sm text-muted-foreground">
                  There was an error loading public topics. Please try again.
                </p>
                <Button variant="outline" className="mt-4">
                  Retry
                </Button>
              </div>
            ) : publicTopics.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {publicTopics.map((topic) => {
                  return (
                    <Card
                      key={topic.id}
                      className="h-full transition-all hover:shadow-md"
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <CardTitle>{topic.name}</CardTitle>
                          </div>
                        </div>
                        <CardDescription className="line-clamp-2">
                          {topic.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="mb-3 flex items-center justify-between"></div>
                      </CardContent>
                      <CardFooter className="flex items-center justify-between pt-2">
                        <span className="text-xs text-muted-foreground">
                          {formatDate(topic.createdAt)}
                        </span>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                <Users className="mb-2 h-10 w-10 text-muted-foreground" />
                <h3 className="text-lg font-medium">No public topics found</h3>
                <p className="text-sm text-muted-foreground">
                  {searchQuery
                    ? "Try adjusting your search query"
                    : "There are no public topics available"}
                </p>
                {searchQuery && (
                  <Button
                    variant="outline"
                    onClick={() => setSearchQuery("")}
                    className="mt-4"
                  >
                    Clear Search
                  </Button>
                )}
              </div>
            )}
            {hasNextPublicTopicsPage && (
              <div className="mt-6 flex justify-center">
                <Button
                  variant="outline"
                  onClick={() => fetchNextPublicTopicsPage()}
                  disabled={isLoadingPublicTopics}
                >
                  {isLoadingPublicTopics ? (
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
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
