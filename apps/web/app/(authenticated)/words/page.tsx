"use client"

import { useState } from "react"
import { BookOpen, Check, ChevronDown, Clock, Filter, Search, SortAsc, X } from "lucide-react"
import Link from "next/link"

import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardFooter } from "@workspace/ui/components/card"
import { Input } from "@workspace/ui/components/input"
import { Progress } from "@workspace/ui/components/progress"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import { Badge } from "@workspace/ui/components/badge"
import { Separator } from "@workspace/ui/components/separator"

// Sample word data
const wordList = [
  {
    id: 1,
    word: "Facilitate",
    definition: "To make an action or process easier",
    progress: 85,
    status: "mastered",
    topics: ["Business", "Communication"],
  },
  {
    id: 2,
    word: "Implement",
    definition: "To put a decision, plan, agreement, etc. into effect",
    progress: 65,
    status: "in-progress",
    topics: ["Business", "Management"],
  },
  {
    id: 3,
    word: "Negotiate",
    definition: "To try to reach an agreement by formal discussion",
    progress: 40,
    status: "in-progress",
    topics: ["Business", "Communication"],
  },
  {
    id: 4,
    word: "Accommodate",
    definition: "To provide someone with a place to live or stay temporarily",
    progress: 20,
    status: "in-progress",
    topics: ["Travel", "Hospitality"],
  },
  {
    id: 5,
    word: "Itinerary",
    definition: "A planned route or journey; a travel plan",
    progress: 90,
    status: "mastered",
    topics: ["Travel"],
  },
  {
    id: 6,
    word: "Delegate",
    definition: "To give a particular job or responsibility to someone else",
    progress: 75,
    status: "in-progress",
    topics: ["Business", "Management"],
  },
  {
    id: 7,
    word: "Compliance",
    definition: "The act of obeying an order, rule, or request",
    progress: 30,
    status: "in-progress",
    topics: ["Business", "Legal"],
  },
  {
    id: 8,
    word: "Procurement",
    definition: "The action of obtaining or procuring something",
    progress: 15,
    status: "in-progress",
    topics: ["Business", "Finance"],
  },
  {
    id: 9,
    word: "Reservation",
    definition: "An arrangement to have something held for someone",
    progress: 100,
    status: "mastered",
    topics: ["Travel", "Hospitality"],
  },
  {
    id: 10,
    word: "Correspondence",
    definition: "Communication by exchanging letters, emails, etc.",
    progress: 55,
    status: "in-progress",
    topics: ["Business", "Communication"],
  },
  {
    id: 11,
    word: "Venture",
    definition: "A business enterprise involving risk",
    progress: 45,
    status: "in-progress",
    topics: ["Business", "Finance"],
  },
  {
    id: 12,
    word: "Destination",
    definition: "A place to which someone or something is going",
    progress: 95,
    status: "mastered",
    topics: ["Travel"],
  },
]

// Available topics for filtering
const allTopics = ["Business", "Communication", "Management", "Travel", "Hospitality", "Legal", "Finance"]

export default function WordListPage() {
  // State for filters
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedTopics, setSelectedTopics] = useState<string[]>([])
  const [sortBy, setSortBy] = useState("alphabetical")

  // Filter and sort words based on current filters
  const filteredWords = wordList
    .filter((word) => {
      // Filter by search query
      const matchesSearch =
        word.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
        word.definition.toLowerCase().includes(searchQuery.toLowerCase())

      // Filter by status
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "in-progress" && word.status === "in-progress") ||
        (statusFilter === "mastered" && word.status === "mastered")

      // Filter by topics
      const matchesTopics = selectedTopics.length === 0 || word.topics.some((topic) => selectedTopics.includes(topic))

      return matchesSearch && matchesStatus && matchesTopics
    })
    .sort((a, b) => {
      if (sortBy === "alphabetical") {
        return a.word.localeCompare(b.word)
      } else if (sortBy === "progress-asc") {
        return a.progress - b.progress
      } else if (sortBy === "progress-desc") {
        return b.progress - a.progress
      }
      return 0
    })

  // Toggle topic selection
  const toggleTopic = (topic: string) => {
    if (selectedTopics.includes(topic)) {
      setSelectedTopics(selectedTopics.filter((t) => t !== topic))
    } else {
      setSelectedTopics([...selectedTopics, topic])
    }
  }

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("")
    setStatusFilter("all")
    setSelectedTopics([])
    setSortBy("alphabetical")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="container py-4">
          <h1 className="text-2xl font-bold">Word List</h1>
          <p className="text-sm text-muted-foreground">Browse and filter your TOEIC vocabulary</p>
        </div>
      </header>

      <main className="container py-6">
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
                    <Badge variant="secondary" className="ml-1 rounded-full px-1.5 py-0 text-xs">
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

            {/* Sort options */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[140px]">
                <SortAsc className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="alphabetical">Alphabetical</SelectItem>
                <SelectItem value="progress-asc">Progress (Low-High)</SelectItem>
                <SelectItem value="progress-desc">Progress (High-Low)</SelectItem>
              </SelectContent>
            </Select>

            {/* Clear filters button - only show if filters are applied */}
            {(searchQuery || statusFilter !== "all" || selectedTopics.length > 0 || sortBy !== "alphabetical") && (
              <Button variant="ghost" onClick={clearFilters} className="ml-auto">
                <X className="mr-2 h-4 w-4" />
                Clear Filters
              </Button>
            )}
          </div>

          {/* Active filters display */}
          {selectedTopics.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {selectedTopics.map((topic) => (
                <Badge key={topic} variant="secondary" className="flex items-center gap-1">
                  {topic}
                  <Button variant="ghost" size="icon" className="h-4 w-4 p-0" onClick={() => toggleTopic(topic)}>
                    <X className="h-3 w-3" />
                    <span className="sr-only">Remove {topic} filter</span>
                  </Button>
                </Badge>
              ))}
            </div>
          )}

          {/* Results count */}
          <div className="text-sm text-muted-foreground">
            Showing {filteredWords.length} of {wordList.length} words
          </div>
        </div>

        {/* Word grid */}
        {filteredWords.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredWords.map((word) => (
              <Link href={`/words/${word.word.toLowerCase()}`} key={word.id} className="block">
                <Card className="h-full transition-all hover:shadow-md">
                  <CardContent className="p-4">
                    <div className="mb-2 flex items-start justify-between">
                      <h3 className="text-xl font-semibold">{word.word}</h3>
                      {word.status === "mastered" ? (
                        <Badge className="bg-green-500 hover:bg-green-600">
                          <Check className="mr-1 h-3 w-3" />
                          Mastered
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground">
                          <Clock className="mr-1 h-3 w-3" />
                          In Progress
                        </Badge>
                      )}
                    </div>
                    <p className="line-clamp-2 text-sm text-muted-foreground">{word.definition}</p>
                    <div className="mt-3 flex flex-wrap gap-1">
                      {word.topics.map((topic) => (
                        <Badge key={topic} variant="secondary" className="text-xs">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                  <Separator />
                  <CardFooter className="p-4 pt-3">
                    <div className="w-full">
                      <div className="mb-1 flex items-center justify-between text-xs">
                        <span>Progress</span>
                        <span className="font-medium">{word.progress}%</span>
                      </div>
                      <Progress value={word.progress} className="h-1.5" />
                    </div>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
            <BookOpen className="mb-2 h-10 w-10 text-muted-foreground" />
            <h3 className="text-lg font-medium">No words found</h3>
            <p className="text-sm text-muted-foreground">Try adjusting your filters or search query</p>
            <Button variant="outline" onClick={clearFilters} className="mt-4">
              Clear All Filters
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}

