"use client"

import type React from "react"

import { useState } from "react"
import { ArrowRight, BookOpen, ChevronRight, Clock, Flame, Mic, Search, Star, Zap } from "lucide-react"
import Link from "next/link"

import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Input } from "@workspace/ui/components/input"
import { Badge } from "@workspace/ui/components/badge"
import { ScrollArea, ScrollBar } from "@workspace/ui/components/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs"

// Sample categories
const categories = [
  { id: 1, name: "Business", count: 245, icon: "💼" },
  { id: 2, name: "Technology", count: 178, icon: "💻" },
  { id: 3, name: "Travel", count: 156, icon: "✈️" },
  { id: 4, name: "Marketing", count: 132, icon: "📊" },
  { id: 5, name: "Finance", count: 203, icon: "💰" },
  { id: 6, name: "Communication", count: 187, icon: "🗣️" },
  { id: 7, name: "Management", count: 165, icon: "📋" },
  { id: 8, name: "Hospitality", count: 112, icon: "🏨" },
]

// Sample trending words
const trendingWords = [
  { id: 1, word: "Procurement", topic: "Business", difficulty: "Hard", isNew: true },
  { id: 2, word: "Delegation", topic: "Management", difficulty: "Medium", isNew: false },
  { id: 3, word: "Compliance", topic: "Legal", difficulty: "Hard", isNew: false },
  { id: 4, word: "Optimization", topic: "Technology", difficulty: "Hard", isNew: true },
  { id: 5, word: "Negotiation", topic: "Business", difficulty: "Medium", isNew: false },
]

// Sample difficult words
const difficultWords = [
  { id: 1, word: "Contingency", topic: "Management", difficulty: "Hard", lastReviewed: "3 days ago" },
  { id: 2, word: "Reconciliation", topic: "Finance", difficulty: "Hard", lastReviewed: "5 days ago" },
  { id: 3, word: "Acquisition", topic: "Business", difficulty: "Hard", lastReviewed: "2 days ago" },
  { id: 4, word: "Infrastructure", topic: "Technology", difficulty: "Medium", lastReviewed: "1 day ago" },
  { id: 5, word: "Consolidation", topic: "Finance", difficulty: "Hard", lastReviewed: "4 days ago" },
]

// Sample recommended words based on user's learning pattern
const recommendedWords = [
  { id: 1, word: "Facilitate", topic: "Communication", difficulty: "Medium", reason: "Based on your interests" },
  { id: 2, word: "Allocation", topic: "Finance", difficulty: "Medium", reason: "Similar to words you've learned" },
  { id: 3, word: "Implementation", topic: "Management", difficulty: "Medium", reason: "Frequently used in TOEIC" },
  { id: 4, word: "Correspondence", topic: "Communication", difficulty: "Medium", reason: "Based on your interests" },
  { id: 5, word: "Verification", topic: "Technology", difficulty: "Hard", reason: "Frequently used in TOEIC" },
]

// Recent searches
const recentSearches = ["negotiation", "budget", "schedule", "proposal"]

export default function DiscoverPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [showRecentSearches, setShowRecentSearches] = useState(false)

  // Handle search focus
  const handleSearchFocus = () => {
    setShowRecentSearches(true)
  }

  // Handle search blur
  const handleSearchBlur = () => {
    // Small delay to allow for clicking on recent searches
    setTimeout(() => {
      setShowRecentSearches(false)
    }, 200)
  }

  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, this would navigate to search results
    console.log("Searching for:", searchQuery)
    setShowRecentSearches(false)
  }

  // Render difficulty badge
  const renderDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return (
          <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700">
            Easy
          </Badge>
        )
      case "Medium":
        return (
          <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">
            Medium
          </Badge>
        )
      case "Hard":
        return (
          <Badge variant="outline" className="border-red-200 bg-red-50 text-red-700">
            Hard
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="container py-4">
          <h1 className="text-2xl font-bold">Discover</h1>
          <p className="text-sm text-muted-foreground">Find new words to learn</p>
        </div>
      </header>

      <main className="container">
        {/* Search section */}
        <section className="relative my-4">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search for words, topics, or phrases..."
              className="pl-10 pr-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={handleSearchFocus}
              onBlur={handleSearchBlur}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 h-7 w-7 -translate-y-1/2 rounded-full"
            >
              <Mic className="h-4 w-4 text-muted-foreground" />
              <span className="sr-only">Voice search</span>
            </Button>
          </form>

          {/* Recent searches dropdown */}
          {showRecentSearches && recentSearches.length > 0 && (
            <div className="absolute z-10 mt-1 w-full rounded-md border bg-background p-2 shadow-md">
              <p className="mb-2 px-2 text-xs font-medium text-muted-foreground">Recent Searches</p>
              <ul>
                {recentSearches.map((search, index) => (
                  <li key={index}>
                    <Button
                      variant="ghost"
                      className="flex w-full items-center justify-start px-2 py-1.5 text-sm"
                      onClick={() => setSearchQuery(search)}
                    >
                      <Clock className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                      {search}
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {/* Categories section */}
        <section className="my-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Categories</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/categories" className="flex items-center text-sm">
                View all
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <ScrollArea className="w-full whitespace-nowrap pb-4">
            <div className="flex gap-3">
              {categories.map((category) => (
                <Link href={`/categories/${category.id}`} key={category.id} className="block">
                  <Card className="w-[140px]">
                    <CardContent className="flex flex-col items-center justify-center p-4">
                      <div className="mb-2 text-3xl">{category.icon}</div>
                      <h3 className="font-medium">{category.name}</h3>
                      <p className="text-xs text-muted-foreground">{category.count} words</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </section>

        {/* Tabs for different word recommendations */}
        <section className="my-6">
          <Tabs defaultValue="trending">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="trending">
                <Flame className="mr-2 h-4 w-4" />
                Trending
              </TabsTrigger>
              <TabsTrigger value="difficult">
                <Zap className="mr-2 h-4 w-4" />
                Need Review
              </TabsTrigger>
              <TabsTrigger value="recommended">
                <Star className="mr-2 h-4 w-4" />
                For You
              </TabsTrigger>
            </TabsList>

            {/* Trending words tab */}
            <TabsContent value="trending" className="mt-4">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {trendingWords.map((word) => (
                  <Link href={`/words/${word.word.toLowerCase()}`} key={word.id} className="block">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-semibold">{word.word}</h3>
                            <p className="text-sm text-muted-foreground">{word.topic}</p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            {renderDifficultyBadge(word.difficulty)}
                            {word.isNew && <Badge className="bg-primary">New</Badge>}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
              <div className="mt-4 text-center">
                <Button variant="outline" asChild>
                  <Link href="/trending" className="flex items-center">
                    See all trending words
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </TabsContent>

            {/* Difficult words tab */}
            <TabsContent value="difficult" className="mt-4">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {difficultWords.map((word) => (
                  <Link href={`/words/${word.word.toLowerCase()}`} key={word.id} className="block">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-semibold">{word.word}</h3>
                            <p className="text-sm text-muted-foreground">{word.topic}</p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            {renderDifficultyBadge(word.difficulty)}
                            <p className="text-xs text-muted-foreground">
                              <Clock className="mr-1 inline-block h-3 w-3" />
                              {word.lastReviewed}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
              <div className="mt-4 text-center">
                <Button variant="outline" asChild>
                  <Link href="/review-needed" className="flex items-center">
                    See all words to review
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </TabsContent>

            {/* Recommended words tab */}
            <TabsContent value="recommended" className="mt-4">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {recommendedWords.map((word) => (
                  <Link href={`/words/${word.word.toLowerCase()}`} key={word.id} className="block">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-semibold">{word.word}</h3>
                            <p className="text-sm text-muted-foreground">{word.topic}</p>
                          </div>
                          <div>{renderDifficultyBadge(word.difficulty)}</div>
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground">{word.reason}</p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
              <div className="mt-4 text-center">
                <Button variant="outline" asChild>
                  <Link href="/recommendations" className="flex items-center">
                    See all recommendations
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </section>

        {/* Study sets section */}
        <section className="my-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Popular Study Sets</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/study-sets" className="flex items-center text-sm">
                View all
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { title: "Essential Business Vocabulary", count: 50, level: "Intermediate" },
              { title: "TOEIC Part 7 Reading Keywords", count: 35, level: "Advanced" },
              { title: "Office Communication Terms", count: 45, level: "Intermediate" },
              { title: "Interview Vocabulary", count: 30, level: "Beginner" },
            ].map((set, index) => (
              <Card key={index}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{set.title}</CardTitle>
                  <CardDescription>
                    {set.count} words • {set.level}
                  </CardDescription>
                </CardHeader>
                <CardFooter className="pt-2">
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <Link href={`/study-sets/${index + 1}`}>
                      <BookOpen className="mr-2 h-4 w-4" />
                      Start Learning
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}

