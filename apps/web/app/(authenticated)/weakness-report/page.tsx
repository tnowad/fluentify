"use client";

import { useState } from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Calendar,
  Clock,
  Download,
  HelpCircle,
  Info,
  Lightbulb,
  Play,
  Target,
  Zap,
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
import { Progress } from "@workspace/ui/components/progress";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";
import { Badge } from "@workspace/ui/components/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@workspace/ui/components/chart";

// Sample data for topic performance (radar chart)
const topicPerformanceData = [
  { topic: "Business Verbs", score: 45, fullMark: 100 },
  { topic: "Time Expressions", score: 30, fullMark: 100 },
  { topic: "Office Vocabulary", score: 65, fullMark: 100 },
  { topic: "Travel Terms", score: 80, fullMark: 100 },
  { topic: "Financial Terms", score: 40, fullMark: 100 },
  { topic: "Technology Words", score: 55, fullMark: 100 },
];

// Sample data for parts of speech performance (bar chart)
const partsOfSpeechData = [
  { partOfSpeech: "Verbs", score: 45, average: 70 },
  { partOfSpeech: "Nouns", score: 72, average: 75 },
  { partOfSpeech: "Adjectives", score: 58, average: 65 },
  { partOfSpeech: "Adverbs", score: 40, average: 60 },
  { partOfSpeech: "Prepositions", score: 35, average: 68 },
  { partOfSpeech: "Conjunctions", score: 65, average: 72 },
];

// Sample data for commonly failed words
const commonlyFailedWords = [
  {
    id: 1,
    word: "Procurement",
    partOfSpeech: "noun",
    failureRate: 85,
    attempts: 7,
    lastAttempt: "2 days ago",
    topic: "Business",
  },
  {
    id: 2,
    word: "Facilitate",
    partOfSpeech: "verb",
    failureRate: 75,
    attempts: 8,
    lastAttempt: "1 day ago",
    topic: "Business",
  },
  {
    id: 3,
    word: "Subsequently",
    partOfSpeech: "adverb",
    failureRate: 80,
    attempts: 5,
    lastAttempt: "3 days ago",
    topic: "Time Expressions",
  },
  {
    id: 4,
    word: "Reconciliation",
    partOfSpeech: "noun",
    failureRate: 90,
    attempts: 6,
    lastAttempt: "4 days ago",
    topic: "Financial Terms",
  },
  {
    id: 5,
    word: "Preliminary",
    partOfSpeech: "adjective",
    failureRate: 70,
    attempts: 10,
    lastAttempt: "2 days ago",
    topic: "Business",
  },
  {
    id: 6,
    word: "Notwithstanding",
    partOfSpeech: "preposition",
    failureRate: 95,
    attempts: 4,
    lastAttempt: "5 days ago",
    topic: "Legal Terms",
  },
];

// Sample data for weak topics
const weakTopics = [
  {
    id: 1,
    name: "Business Verbs",
    accuracy: 45,
    wordCount: 32,
    lastPracticed: "2 days ago",
    priority: "high",
  },
  {
    id: 2,
    name: "Time Expressions",
    accuracy: 30,
    wordCount: 24,
    lastPracticed: "5 days ago",
    priority: "critical",
  },
  {
    id: 3,
    name: "Financial Terms",
    accuracy: 40,
    wordCount: 28,
    lastPracticed: "3 days ago",
    priority: "high",
  },
  {
    id: 4,
    name: "Prepositions",
    accuracy: 35,
    wordCount: 18,
    lastPracticed: "1 week ago",
    priority: "high",
  },
];

// Sample improvement suggestions
const improvementSuggestions = [
  {
    id: 1,
    title: "Focus on Time Expressions",
    description:
      "Your accuracy with time-related vocabulary is 30%, which is significantly below average. Spend 15 minutes daily on these terms.",
    estimatedTime: "15 min daily",
    priority: "critical",
  },
  {
    id: 2,
    title: "Business Verb Flashcards",
    description:
      "Create a separate deck for business verbs and review them more frequently than other words.",
    estimatedTime: "10 min daily",
    priority: "high",
  },
  {
    id: 3,
    title: "Preposition Practice",
    description:
      "Your preposition usage is below average. Try reading business articles and highlighting prepositions.",
    estimatedTime: "20 min, 3x weekly",
    priority: "medium",
  },
];

export default function WeaknessReportPage() {
  const [timeRange, setTimeRange] = useState("month");

  // Function to render priority badge
  const renderPriorityBadge = (priority: string) => {
    switch (priority) {
      case "critical":
        return (
          <Badge className="bg-red-500 hover:bg-red-600">
            <AlertTriangle className="mr-1 h-3 w-3" />
            Critical
          </Badge>
        );
      case "high":
        return (
          <Badge className="bg-orange-500 hover:bg-orange-600">
            <Zap className="mr-1 h-3 w-3" />
            High
          </Badge>
        );
      case "medium":
        return (
          <Badge className="bg-yellow-500 hover:bg-yellow-600">
            <Target className="mr-1 h-3 w-3" />
            Medium
          </Badge>
        );
      default:
        return (
          <Badge className="bg-blue-500 hover:bg-blue-600">
            <Info className="mr-1 h-3 w-3" />
            Low
          </Badge>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="container py-4">
          <h1 className="text-2xl font-bold">Weakness Report</h1>
          <p className="text-sm text-muted-foreground">
            Identify and improve your weak areas
          </p>
        </div>
      </header>

      <main className="container">
        {/* Time range selector */}
        <div className="my-4 flex justify-between">
          <Button variant="outline" className="flex items-center gap-1">
            <Download className="mr-1 h-4 w-4" />
            Export Report
          </Button>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Last 7 Days</SelectItem>
              <SelectItem value="month">Last 30 Days</SelectItem>
              <SelectItem value="quarter">Last 3 Months</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Overview cards */}
        <section className="mb-6">
          <Card className="bg-amber-50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                <CardTitle className="text-amber-800">
                  Weakness Overview
                </CardTitle>
              </div>
              <CardDescription className="text-amber-700">
                Based on your recent performance, here are your key areas for
                improvement
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg bg-white p-3 shadow-sm">
                <div className="text-sm font-medium text-muted-foreground">
                  Weakest Topic
                </div>
                <div className="mt-1 text-xl font-bold">Time Expressions</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  30% accuracy
                </div>
              </div>
              <div className="rounded-lg bg-white p-3 shadow-sm">
                <div className="text-sm font-medium text-muted-foreground">
                  Weakest Part of Speech
                </div>
                <div className="mt-1 text-xl font-bold">Prepositions</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  35% accuracy
                </div>
              </div>
              <div className="rounded-lg bg-white p-3 shadow-sm">
                <div className="text-sm font-medium text-muted-foreground">
                  Most Failed Word
                </div>
                <div className="mt-1 text-xl font-bold">Notwithstanding</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  95% failure rate
                </div>
              </div>
              <div className="rounded-lg bg-white p-3 shadow-sm">
                <div className="text-sm font-medium text-muted-foreground">
                  Overall Weak Words
                </div>
                <div className="mt-1 text-xl font-bold">42</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Below 50% accuracy
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Charts section */}
        <section className="mb-6">
          <Tabs defaultValue="topics">
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="topics">Topic Performance</TabsTrigger>
                <TabsTrigger value="speech">Parts of Speech</TabsTrigger>
              </TabsList>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-1"
              >
                <Info className="h-4 w-4" />
                <span className="text-xs">How to read this chart</span>
              </Button>
            </div>

            {/* Topic performance radar chart */}
            <TabsContent value="topics" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Topic Performance Analysis</CardTitle>
                  <CardDescription>
                    Lower scores indicate areas that need improvement
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart
                        cx="50%"
                        cy="50%"
                        outerRadius="80%"
                        data={topicPerformanceData}
                      >
                        <PolarGrid />
                        <PolarAngleAxis dataKey="topic" />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} />
                        <Radar
                          name="Your Score"
                          dataKey="score"
                          stroke="#2563eb"
                          fill="#3b82f6"
                          fillOpacity={0.6}
                        />
                        <Tooltip />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Parts of speech bar chart */}
            <TabsContent value="speech" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Parts of Speech Performance</CardTitle>
                  <CardDescription>
                    Comparison with average TOEIC learner performance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[350px]">
                    <ChartContainer
                      config={{
                        score: {
                          label: "Your Score",
                          color: "hsl(var(--chart-1))",
                        },
                        average: {
                          label: "Average Score",
                          color: "hsl(var(--chart-2))",
                        },
                      }}
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={partsOfSpeechData}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="partOfSpeech" />
                          <YAxis />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Legend />
                          <Bar
                            dataKey="score"
                            fill="var(--color-score)"
                            name="Your Score"
                          />
                          <Bar
                            dataKey="average"
                            fill="var(--color-average)"
                            name="Average Score"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </section>

        {/* Weak topics section */}
        <section className="mb-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Weak Topics</h2>
            <Button variant="outline" size="sm">
              View All Topics
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {weakTopics.map((topic) => (
              <Card key={topic.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle>{topic.name}</CardTitle>
                    {renderPriorityBadge(topic.priority)}
                  </div>
                  <CardDescription>
                    {topic.wordCount} words • Last practiced{" "}
                    {topic.lastPracticed}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span>Accuracy</span>
                    <span className="font-medium">{topic.accuracy}%</span>
                  </div>
                  <Progress
                    value={topic.accuracy}
                    className="h-2"
                    indicatorClassName={
                      topic.accuracy < 40
                        ? "bg-red-500"
                        : topic.accuracy < 60
                          ? "bg-orange-500"
                          : topic.accuracy < 80
                            ? "bg-yellow-500"
                            : "bg-green-500"
                    }
                  />
                </CardContent>
                <CardFooter>
                  <div className="flex w-full gap-2">
                    <Button className="flex-1" size="sm" asChild>
                      <Link href={`/review/${topic.id}`}>
                        <Zap className="mr-1 h-4 w-4" />
                        Review
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      size="sm"
                      asChild
                    >
                      <Link href={`/practice/${topic.id}`}>
                        <Play className="mr-1 h-4 w-4" />
                        Practice
                      </Link>
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>

        {/* Commonly failed words */}
        <section className="mb-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Commonly Failed Words</h2>
            <Button variant="outline" size="sm">
              View All Failed Words
            </Button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {commonlyFailedWords.map((word) => (
              <Card key={word.id} className="overflow-hidden">
                <div
                  className={`h-1 w-full ${
                    word.failureRate > 80
                      ? "bg-red-500"
                      : word.failureRate > 60
                        ? "bg-orange-500"
                        : "bg-yellow-500"
                  }`}
                />
                <CardContent className="p-4">
                  <div className="mb-2 flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{word.word}</h3>
                      <p className="text-sm text-muted-foreground">
                        {word.partOfSpeech} • {word.topic}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className="border-red-200 bg-red-50 text-red-700"
                    >
                      {word.failureRate}% fail
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      <Clock className="mr-1 inline-block h-3 w-3" />
                      Last attempt {word.lastAttempt}
                    </span>
                    <span className="text-muted-foreground">
                      {word.attempts} attempts
                    </span>
                  </div>
                </CardContent>
                <CardFooter className="border-t bg-muted/20 p-2">
                  <Button variant="ghost" size="sm" className="w-full" asChild>
                    <Link href={`/words/${word.word.toLowerCase()}`}>
                      <BookOpen className="mr-1 h-4 w-4" />
                      Review Word
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>

        {/* Improvement suggestions */}
        <section>
          <div className="mb-3">
            <h2 className="text-lg font-semibold">
              Personalized Improvement Plan
            </h2>
            <p className="text-sm text-muted-foreground">
              Follow these recommendations to improve your weak areas
            </p>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-primary" />
                <CardTitle>Recommended Actions</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {improvementSuggestions.map((suggestion) => (
                  <div key={suggestion.id} className="p-4">
                    <div className="mb-2 flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium">{suggestion.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {suggestion.description}
                        </p>
                      </div>
                      <div className="ml-4 flex flex-col items-end gap-2">
                        {renderPriorityBadge(suggestion.priority)}
                        <span className="flex items-center text-xs text-muted-foreground">
                          <Clock className="mr-1 h-3 w-3" />
                          {suggestion.estimatedTime}
                        </span>
                      </div>
                    </div>
                    <Button className="mt-2 w-full" size="sm">
                      Start Now
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="border-t p-4">
              <Button variant="outline" className="w-full">
                <HelpCircle className="mr-2 h-4 w-4" />
                Get Detailed Learning Plan
              </Button>
            </CardFooter>
          </Card>
        </section>
      </main>
    </div>
  );
}
