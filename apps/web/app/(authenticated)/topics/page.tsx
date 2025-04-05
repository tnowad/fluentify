"use client"

import { useState } from "react"
import { Badge, BookOpen, ChevronRight, Edit, Filter, Heart, Layers, Plus, Search, Star, Tag, Trash2, Users, X } from "lucide-react"
import Link from "next/link"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Input } from "@workspace/ui/components/input"
import { Tabs, TabsContent, TabsList, TabsTrigger, } from "@workspace/ui/components/tabs"
import { Progress } from "@workspace/ui/components/progress"
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@workspace/ui/components/alert-dialog"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@workspace/ui/components/dropdown-menu"
import { z } from "zod"
import { HttpStatus, TopicSchema } from "@workspace/contracts"
import { useInfiniteQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"

// Type inference from the schema
type Topic = z.infer<typeof TopicSchema>

// Extended topic type with UI-specific properties
type ExtendedTopic = Topic & {
  icon: string
  count: number
  progress?: number
  subtopics: string[]
  lastStudied?: string
  isSaved?: boolean
  rating?: number
  users?: number
  creator?: string
}

// Current user ID (would come from auth in a real app)
const currentUserId = "550e8400-e29b-41d4-a716-446655440000"

// Sample topics data
const topicsData: ExtendedTopic[] = [
  {
    id: "123e4567-e89b-12d3-a456-426614174000",
    name: "Business Meetings",
    description: "Vocabulary for conducting and participating in business meetings",
    isPublic: false,
    createdBy: currentUserId,
    createdAt: "2023-05-15T10:30:00Z",
    icon: "💼",
    count: 45,
    progress: 75,
    subtopics: ["Agendas", "Minutes", "Presentations", "Q&A"],
    lastStudied: "2 days ago",
  },
  {
    id: "223e4567-e89b-12d3-a456-426614174001",
    name: "Email Communication",
    description: "Professional email vocabulary and phrases",
    isPublic: false,
    createdBy: currentUserId,
    createdAt: "2023-06-20T14:45:00Z",
    icon: "📧",
    count: 38,
    progress: 60,
    subtopics: ["Greetings", "Requests", "Follow-ups", "Closings"],
    lastStudied: "Yesterday",
  },
  {
    id: "323e4567-e89b-12d3-a456-426614174002",
    name: "Travel Essentials",
    description: "Must-know vocabulary for business travel",
    isPublic: true,
    createdBy: "650e8400-e29b-41d4-a716-446655440001",
    createdAt: "2023-04-10T09:15:00Z",
    icon: "✈️",
    count: 52,
    progress: 40,
    subtopics: ["Airport", "Hotel", "Transportation", "Dining"],
    lastStudied: "3 days ago",
    isSaved: true,
    creator: "TravelPro",
  },
  {
    id: "423e4567-e89b-12d3-a456-426614174003",
    name: "Interview Prep",
    description: "Terms and phrases for job interviews",
    isPublic: false,
    createdBy: currentUserId,
    createdAt: "2023-07-05T16:20:00Z",
    icon: "🤝",
    count: 65,
    progress: 90,
    subtopics: ["Skills", "Experience", "Questions", "Follow-up"],
    lastStudied: "1 week ago",
  },
  {
    id: "523e4567-e89b-12d3-a456-426614174004",
    name: "Tech Terminology",
    description: "Essential technology vocabulary for the workplace",
    isPublic: true,
    createdBy: "750e8400-e29b-41d4-a716-446655440002",
    createdAt: "2023-03-25T11:30:00Z",
    icon: "💻",
    count: 70,
    progress: 25,
    subtopics: ["Software", "Hardware", "Digital", "Security"],
    lastStudied: "5 days ago",
    isSaved: true,
    creator: "TechVocab",
  },
]

// Sample public topics data
const publicTopicsData: ExtendedTopic[] = [
  {
    id: "623e4567-e89b-12d3-a456-426614174005",
    name: "TOEIC Official Business",
    description: "Official TOEIC business vocabulary collection",
    isPublic: true,
    createdBy: "850e8400-e29b-41d4-a716-446655440003",
    createdAt: "2023-01-15T08:30:00Z",
    icon: "🏢",
    count: 120,
    subtopics: ["Corporate", "Finance", "Marketing", "Management"],
    isSaved: true,
    rating: 4.8,
    users: 2450,
    creator: "TOEIC Official",
  },
  {
    id: "723e4567-e89b-12d3-a456-426614174006",
    name: "Essential Hospitality",
    description: "Customer service and hospitality industry terms",
    isPublic: true,
    createdBy: "950e8400-e29b-41d4-a716-446655440004",
    createdAt: "2023-02-20T13:45:00Z",
    icon: "🏨",
    count: 85,
    subtopics: ["Hotels", "Restaurants", "Service", "Tourism"],
    isSaved: false,
    rating: 4.6,
    users: 1280,
    creator: "HospitalityPro",
  },
  {
    id: "823e4567-e89b-12d3-a456-426614174007",
    name: "Finance & Banking",
    description: "Comprehensive financial terminology collection",
    isPublic: true,
    createdBy: "150e8400-e29b-41d4-a716-446655440005",
    createdAt: "2023-03-10T10:15:00Z",
    icon: "💰",
    count: 110,
    subtopics: ["Banking", "Investments", "Accounting", "Markets"],
    isSaved: true,
    rating: 4.7,
    users: 1850,
    creator: "FinancialEnglish",
  },
  {
    id: "923e4567-e89b-12d3-a456-426614174008",
    name: "Medical English",
    description: "Healthcare and medical terminology",
    isPublic: true,
    createdBy: "250e8400-e29b-41d4-a716-446655440006",
    createdAt: "2023-04-05T09:30:00Z",
    icon: "🏥",
    count: 95,
    subtopics: ["Anatomy", "Procedures", "Pharmacy", "Patient Care"],
    isSaved: false,
    rating: 4.5,
    users: 1120,
    creator: "MedicalPro",
  },
  {
    id: "023e4567-e89b-12d3-a456-426614174009",
    name: "Legal Terminology",
    description: "Essential legal vocabulary for professionals",
    isPublic: true,
    createdBy: "350e8400-e29b-41d4-a716-446655440007",
    createdAt: "2023-05-12T14:20:00Z",
    icon: "⚖️",
    count: 105,
    subtopics: ["Contracts", "Litigation", "Corporate", "International"],
    isSaved: false,
    rating: 4.4,
    users: 980,
    creator: "LegalEnglish",
  },
  {
    id: "123e4567-e89b-12d3-a456-426614174010",
    name: "IT & Software",
    description: "Information technology and software development terms",
    isPublic: true,
    createdBy: "450e8400-e29b-41d4-a716-446655440008",
    createdAt: "2023-06-18T11:45:00Z",
    icon: "🖥️",
    count: 130,
    subtopics: ["Programming", "Networks", "Security", "Cloud"],
    isSaved: false,
    rating: 4.9,
    users: 2100,
    creator: "TechVocab",
  },
]

export default function TopicsPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const [activeView, setActiveView] = useState<"grid" | "list">("grid")
  const [activeTab, setActiveTab] = useState<"my-topics" | "public-topics">("my-topics")
  const [myTopics, setMyTopics] = useState<ExtendedTopic[]>(topicsData)
  const [publicTopics, setPublicTopics] = useState<ExtendedTopic[]>(publicTopicsData)


  const { data } = useInfiniteQuery({
    queryKey: ['list-my-topics', searchQuery],
    queryFn: ({ pageParam }) => api.topic.listMyTopics({
      query: {
        search: searchQuery,
        cursor: pageParam,
      }
    }),
    initialPageParam: "",
    getNextPageParam: (lastPage) => lastPage.status == HttpStatus.OK ? lastPage.body.nextCursor : undefined,
  })

  // Filter topics based on search query
  const filteredMyTopics = myTopics.filter(
    (topic) =>
      topic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (topic.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
      topic.subtopics.some((subtopic) => subtopic.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const filteredPublicTopics = publicTopics.filter(
    (topic) =>
      topic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (topic.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
      topic.subtopics.some((subtopic) => subtopic.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  // Check if a topic is created by the current user
  const isCreatedByMe = (topic: ExtendedTopic) => topic.createdBy === currentUserId

  // Handle delete topic
  const deleteTopic = (id: string) => {
    setMyTopics(myTopics.filter((topic) => topic.id !== id))
  }

  // Handle save/unsave public topic
  const toggleSaveTopic = (id: string) => {
    setPublicTopics(publicTopics.map((topic) => (topic.id === id ? { ...topic, isSaved: !topic.isSaved } : topic)))
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="container py-4">
          <h1 className="text-2xl font-bold">Topics</h1>
          <p className="text-sm text-muted-foreground">Browse and manage vocabulary topics</p>
        </div>
      </header>

      <main className="container py-6">
        {/* Main tabs for My Topics vs Public Topics */}
        <Tabs defaultValue="my-topics" value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <TabsList className="w-full sm:w-auto">
              <TabsTrigger value="my-topics" className="flex items-center gap-1">
                <BookOpen className="h-4 w-4" />
                My Topics
              </TabsTrigger>
              <TabsTrigger value="public-topics" className="flex items-center gap-1">
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
                <Badge variant="outline" className="bg-primary/10 text-primary">
                  {publicTopics.filter((t) => t.isSaved).length} Saved
                </Badge>
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
                    ? `${filteredMyTopics.length} topics`
                    : `${filteredPublicTopics.length} topics`}
                </Badge>
              </div>
              <div className="flex items-center gap-1 rounded-md border p-1">
                <Button
                  variant={activeView === "grid" ? "secondary" : "ghost"}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setActiveView("grid")}
                >
                  <Layers className="h-4 w-4" />
                  <span className="sr-only">Grid view</span>
                </Button>
                <Button
                  variant={activeView === "list" ? "secondary" : "ghost"}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setActiveView("list")}
                >
                  <Tag className="h-4 w-4" />
                  <span className="sr-only">List view</span>
                </Button>
              </div>
            </div>
          </div>

          {/* My Topics Content */}
          <TabsContent value="my-topics" className="mt-0">
            {filteredMyTopics.length > 0 ? (
              activeView === "grid" ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {filteredMyTopics.map((topic) => (
                    <Card key={topic.id} className="h-full transition-all hover:shadow-md">
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <div className="text-3xl">{topic.icon}</div>
                            <CardTitle>{topic.name}</CardTitle>
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
                                  <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    {isCreatedByMe(topic) ? "Delete" : "Remove"}
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      {isCreatedByMe(topic) ? "Delete topic?" : "Remove from your topics?"}
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      {isCreatedByMe(topic)
                                        ? "This will permanently delete this topic and all associated data."
                                        : "This will remove this topic from your saved topics."}
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => deleteTopic(topic.id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      {isCreatedByMe(topic) ? "Delete" : "Remove"}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <CardDescription className="line-clamp-2">{topic.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="mb-3 flex items-center justify-between">
                          <Badge variant="outline">{topic.count} words</Badge>
                          <div className="flex items-center gap-2">
                            {isCreatedByMe(topic) ? (
                              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                Created
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-green-50 text-green-700">
                                Saved
                              </Badge>
                            )}
                            <span className="text-xs text-muted-foreground">{formatDate(topic.createdAt)}</span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {topic.subtopics.map((subtopic, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {subtopic}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                      <CardFooter className="pt-2">
                        {topic.progress !== undefined && (
                          <div className="w-full">
                            <div className="mb-1 flex items-center justify-between text-xs">
                              <span>Progress</span>
                              <span className="font-medium">{topic.progress}%</span>
                            </div>
                            <Progress value={topic.progress} className="h-1.5" />
                          </div>
                        )}
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredMyTopics.map((topic) => (
                    <Card key={topic.id} className="transition-all hover:shadow-md">
                      <CardContent className="flex items-center gap-4 p-4">
                        <div className="text-3xl">{topic.icon}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{topic.name}</h3>
                            {isCreatedByMe(topic) ? (
                              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                Created
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-green-50 text-green-700">
                                Saved
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{topic.count} words</p>
                          {topic.progress !== undefined && (
                            <div className="mt-1 flex items-center gap-2">
                              <Progress value={topic.progress} className="h-1.5 w-24" />
                              <span className="text-xs text-muted-foreground">{topic.progress}%</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/topics/${topic.id}`}>Study</Link>
                          </Button>
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
                              {isCreatedByMe(topic) && (
                                <DropdownMenuItem asChild>
                                  <Link href={`/topics/${topic.id}/edit`}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                  </Link>
                                </DropdownMenuItem>
                              )}
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    {isCreatedByMe(topic) ? "Delete" : "Remove"}
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      {isCreatedByMe(topic) ? "Delete topic?" : "Remove from your topics?"}
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      {isCreatedByMe(topic)
                                        ? "This will permanently delete this topic and all associated data."
                                        : "This will remove this topic from your saved topics."}
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => deleteTopic(topic.id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      {isCreatedByMe(topic) ? "Delete" : "Remove"}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )
            ) : (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                <BookOpen className="mb-2 h-10 w-10 text-muted-foreground" />
                <h3 className="text-lg font-medium">No topics found</h3>
                <p className="text-sm text-muted-foreground">
                  {searchQuery ? "Try adjusting your search query" : "You haven't created or saved any topics yet"}
                </p>
                {searchQuery ? (
                  <Button variant="outline" onClick={() => setSearchQuery("")} className="mt-4">
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
                    <Button variant="outline" onClick={() => setActiveTab("public-topics")}>
                      Browse Public Topics
                    </Button>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* Public Topics Content */}
          <TabsContent value="public-topics" className="mt-0">
            {filteredPublicTopics.length > 0 ? (
              activeView === "grid" ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {filteredPublicTopics.map((topic) => (
                    <Card key={topic.id} className="h-full transition-all hover:shadow-md">
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <div className="text-3xl">{topic.icon}</div>
                            <CardTitle>{topic.name}</CardTitle>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                            onClick={() => toggleSaveTopic(topic.id)}
                          >
                            <Heart className={`h-5 w-5 ${topic.isSaved ? "fill-primary text-primary" : ""}`} />
                            <span className="sr-only">{topic.isSaved ? "Unsave" : "Save"}</span>
                          </Button>
                        </div>
                        <CardDescription className="line-clamp-2">{topic.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="mb-3 flex items-center justify-between">
                          <Badge variant="outline">{topic.count} words</Badge>
                          {topic.rating && (
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                              <span className="text-sm font-medium">{topic.rating}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {topic.subtopics.map((subtopic, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {subtopic}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                      <CardFooter className="flex items-center justify-between pt-2">
                        {topic.users && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Users className="h-3.5 w-3.5" />
                            <span>{topic.users.toLocaleString()} users</span>
                          </div>
                        )}
                        <span className="text-xs text-muted-foreground">{formatDate(topic.createdAt)}</span>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredPublicTopics.map((topic) => (
                    <Card key={topic.id} className="transition-all hover:shadow-md">
                      <CardContent className="flex items-center gap-4 p-4">
                        <div className="text-3xl">{topic.icon}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{topic.name}</h3>
                            {topic.rating && (
                              <div className="flex items-center gap-1">
                                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                                <span className="text-xs font-medium">{topic.rating}</span>
                              </div>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {topic.count} words {topic.users && `• ${topic.users.toLocaleString()} users`}
                          </p>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {topic.subtopics.slice(0, 2).map((subtopic, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {subtopic}
                              </Badge>
                            ))}
                            {topic.subtopics.length > 2 && (
                              <Badge variant="secondary" className="text-xs">
                                +{topic.subtopics.length - 2} more
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant={topic.isSaved ? "default" : "outline"}
                            size="sm"
                            className={topic.isSaved ? "gap-1" : ""}
                            onClick={() => toggleSaveTopic(topic.id)}
                          >
                            {topic.isSaved && <Heart className="h-3.5 w-3.5 fill-current" />}
                            {topic.isSaved ? "Saved" : "Save"}
                          </Button>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/topics/${topic.id}`}>View</Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )
            ) : (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                <Users className="mb-2 h-10 w-10 text-muted-foreground" />
                <h3 className="text-lg font-medium">No public topics found</h3>
                <p className="text-sm text-muted-foreground">
                  {searchQuery ? "Try adjusting your search query" : "There are no public topics available"}
                </p>
                {searchQuery && (
                  <Button variant="outline" onClick={() => setSearchQuery("")} className="mt-4">
                    Clear Search
                  </Button>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
