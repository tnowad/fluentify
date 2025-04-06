"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  ArrowDown,
  ArrowUp,
  Calendar,
  Check,
  ChevronDown,
  Clock,
  Flame,
  HelpCircle,
  Info,
  X,
} from "lucide-react";

import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";
import { Badge } from "@workspace/ui/components/badge";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@workspace/ui/components/chart";

// Sample data for the line chart (daily progress)
const dailyProgressData = [
  { date: "Mon", wordsLearned: 12, accuracy: 85, timeSpent: 15 },
  { date: "Tue", wordsLearned: 8, accuracy: 78, timeSpent: 10 },
  { date: "Wed", wordsLearned: 15, accuracy: 92, timeSpent: 20 },
  { date: "Thu", wordsLearned: 10, accuracy: 80, timeSpent: 12 },
  { date: "Fri", wordsLearned: 5, accuracy: 75, timeSpent: 8 },
  { date: "Sat", wordsLearned: 18, accuracy: 88, timeSpent: 25 },
  { date: "Sun", wordsLearned: 14, accuracy: 90, timeSpent: 18 },
];

// Sample data for the bar chart (category performance)
const categoryPerformanceData = [
  { category: "Business", wordsLearned: 45, accuracy: 82 },
  { category: "Technology", wordsLearned: 32, accuracy: 78 },
  { category: "Travel", wordsLearned: 28, accuracy: 90 },
  { category: "Finance", wordsLearned: 38, accuracy: 75 },
  { category: "Communication", wordsLearned: 42, accuracy: 85 },
];

// Sample data for review logs
const reviewLogs = [
  {
    id: 1,
    word: "Facilitate",
    date: "Today, 10:30 AM",
    result: "correct",
    responseTime: 1.8,
    difficulty: "Medium",
  },
  {
    id: 2,
    word: "Procurement",
    date: "Today, 10:28 AM",
    result: "incorrect",
    responseTime: 3.2,
    difficulty: "Hard",
  },
  {
    id: 3,
    word: "Negotiate",
    date: "Today, 10:25 AM",
    result: "correct",
    responseTime: 2.1,
    difficulty: "Medium",
  },
  {
    id: 4,
    word: "Itinerary",
    date: "Today, 10:22 AM",
    result: "correct",
    responseTime: 1.5,
    difficulty: "Easy",
  },
  {
    id: 5,
    word: "Compliance",
    date: "Today, 10:20 AM",
    result: "incorrect",
    responseTime: 4.5,
    difficulty: "Hard",
  },
  {
    id: 6,
    word: "Delegate",
    date: "Yesterday, 3:45 PM",
    result: "correct",
    responseTime: 2.3,
    difficulty: "Medium",
  },
  {
    id: 7,
    word: "Correspondence",
    date: "Yesterday, 3:42 PM",
    result: "correct",
    responseTime: 1.9,
    difficulty: "Medium",
  },
  {
    id: 8,
    word: "Venture",
    date: "Yesterday, 3:40 PM",
    result: "incorrect",
    responseTime: 3.8,
    difficulty: "Hard",
  },
];

// Overall statistics
const overallStats = {
  totalWordsLearned: 248,
  averageAccuracy: 84,
  currentStreak: 16,
  totalTimeSpent: 42.5,
  wordsLearnedChange: 15,
  accuracyChange: 3,
  streakChange: 5,
  timeSpentChange: 8.5,
};

export default function ProgressPage() {
  const [timeRange, setTimeRange] = useState("week");

  // Function to render trend indicator
  const renderTrend = (change: number) => {
    if (change > 0) {
      return (
        <div className="flex items-center text-green-600">
          <ArrowUp className="mr-1 h-3 w-3" />
          <span>{change}%</span>
        </div>
      );
    } else if (change < 0) {
      return (
        <div className="flex items-center text-red-600">
          <ArrowDown className="mr-1 h-3 w-3" />
          <span>{Math.abs(change)}%</span>
        </div>
      );
    }
    return <span>No change</span>;
  };

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="container py-4">
          <h1 className="text-2xl font-bold">Progress & Statistics</h1>
          <p className="text-sm text-muted-foreground">
            Track your learning journey
          </p>
        </div>
      </header>

      <main className="container">
        {/* Time range selector */}
        <div className="my-4 flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-1">
                <Calendar className="mr-1 h-4 w-4" />
                {timeRange === "week"
                  ? "This Week"
                  : timeRange === "month"
                    ? "This Month"
                    : "All Time"}
                <ChevronDown className="ml-1 h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTimeRange("week")}>
                This Week
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTimeRange("month")}>
                This Month
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTimeRange("all")}>
                All Time
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Stats overview cards */}
        <section className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Words Learned
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold">
                  {overallStats.totalWordsLearned}
                </div>
                {renderTrend(overallStats.wordsLearnedChange)}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                vs. previous {timeRange}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Recall Accuracy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold">
                  {overallStats.averageAccuracy}%
                </div>
                {renderTrend(overallStats.accuracyChange)}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                vs. previous {timeRange}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Review Streak
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Flame className="mr-2 h-5 w-5 text-orange-500" />
                  <div className="text-3xl font-bold">
                    {overallStats.currentStreak}
                  </div>
                </div>
                {renderTrend(overallStats.streakChange)}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                consecutive days
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Time Spent
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold">
                  {overallStats.totalTimeSpent}h
                </div>
                {renderTrend(overallStats.timeSpentChange)}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                vs. previous {timeRange}
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Charts section */}
        <section className="mb-6">
          <Tabs defaultValue="daily">
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="daily">Daily Progress</TabsTrigger>
                <TabsTrigger value="category">By Category</TabsTrigger>
              </TabsList>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-1"
              >
                <Info className="h-4 w-4" />
                <span className="text-xs">About these charts</span>
              </Button>
            </div>

            {/* Daily progress chart */}
            <TabsContent value="daily" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Learning Progress Over Time</CardTitle>
                  <CardDescription>
                    Track your daily words learned and accuracy
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[350px]">
                    <ChartContainer
                      config={{
                        wordsLearned: {
                          label: "Words Learned",
                          color: "hsl(var(--chart-1))",
                        },
                        accuracy: {
                          label: "Accuracy (%)",
                          color: "hsl(var(--chart-2))",
                        },
                      }}
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={dailyProgressData}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis yAxisId="left" orientation="left" />
                          <YAxis yAxisId="right" orientation="right" />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Legend />
                          <Line
                            yAxisId="left"
                            type="monotone"
                            dataKey="wordsLearned"
                            stroke="var(--color-wordsLearned)"
                            activeDot={{ r: 8 }}
                          />
                          <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="accuracy"
                            stroke="var(--color-accuracy)"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Category performance chart */}
            <TabsContent value="category" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Performance by Category</CardTitle>
                  <CardDescription>
                    Compare your progress across different topics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[350px]">
                    <ChartContainer
                      config={{
                        wordsLearned: {
                          label: "Words Learned",
                          color: "hsl(var(--chart-1))",
                        },
                        accuracy: {
                          label: "Accuracy (%)",
                          color: "hsl(var(--chart-2))",
                        },
                      }}
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={categoryPerformanceData}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="category" />
                          <YAxis yAxisId="left" orientation="left" />
                          <YAxis yAxisId="right" orientation="right" />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Legend />
                          <Bar
                            yAxisId="left"
                            dataKey="wordsLearned"
                            fill="var(--color-wordsLearned)"
                          />
                          <Bar
                            yAxisId="right"
                            dataKey="accuracy"
                            fill="var(--color-accuracy)"
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

        {/* Recent review logs */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Recent Review Logs</h2>
            <Button variant="outline" size="sm">
              Export Data
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Word</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Result</TableHead>
                    <TableHead>Response Time</TableHead>
                    <TableHead>Difficulty</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reviewLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-medium">{log.word}</TableCell>
                      <TableCell>{log.date}</TableCell>
                      <TableCell>
                        {log.result === "correct" ? (
                          <Badge className="bg-green-500 hover:bg-green-600">
                            <Check className="mr-1 h-3 w-3" />
                            Correct
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                          >
                            <X className="mr-1 h-3 w-3" />
                            Incorrect
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Clock className="mr-1 h-3 w-3 text-muted-foreground" />
                          {log.responseTime}s
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            log.difficulty === "Easy"
                              ? "border-green-200 bg-green-50 text-green-700"
                              : log.difficulty === "Medium"
                                ? "border-blue-200 bg-blue-50 text-blue-700"
                                : "border-red-200 bg-red-50 text-red-700"
                          }
                        >
                          {log.difficulty}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="mt-4 flex items-center justify-center">
            <Button variant="outline">Load More</Button>
          </div>
        </section>

        {/* Learning insights */}
        <section className="mt-8">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-primary" />
                <CardTitle>Learning Insights</CardTitle>
              </div>
              <CardDescription>
                Personalized recommendations based on your performance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-amber-50 p-4">
                <h3 className="mb-1 font-medium text-amber-800">
                  Focus on Hard Words
                </h3>
                <p className="text-sm text-amber-700">
                  Your accuracy with difficult words is 25% lower than with
                  medium difficulty words. Consider spending more time reviewing
                  words like "Procurement" and "Compliance".
                </p>
              </div>

              <div className="rounded-lg bg-blue-50 p-4">
                <h3 className="mb-1 font-medium text-blue-800">
                  Consistent Progress
                </h3>
                <p className="text-sm text-blue-700">
                  You've maintained a 16-day learning streak! Consistency is key
                  to vocabulary retention. Keep up the good work to improve your
                  long-term memory.
                </p>
              </div>

              <div className="rounded-lg bg-green-50 p-4">
                <h3 className="mb-1 font-medium text-green-800">
                  Strong in Travel Vocabulary
                </h3>
                <p className="text-sm text-green-700">
                  You're performing exceptionally well in the Travel category
                  with 90% accuracy. Consider challenging yourself with more
                  advanced words in this category.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
