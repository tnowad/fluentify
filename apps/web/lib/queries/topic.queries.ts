import { HttpStatus } from "@workspace/contracts";
import { infiniteQueryOptions } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function myTopicsInfiniteQuery({
  searchQuery,
  enabled = true,
}: {
  searchQuery: string;
  enabled?: boolean;
}) {
  return infiniteQueryOptions({
    queryKey: ["topics", "my", searchQuery],
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
    enabled,
  });
}

export function publicTopicsInfiniteQuery({
  searchQuery,
  enabled = true,
}: {
  searchQuery: string;
  enabled?: boolean;
}) {
  return infiniteQueryOptions({
    queryKey: ["topics", "public", searchQuery],
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
    enabled,
  });
}
