"use client"

import { useState } from "react"
import {
  Award,
  BookOpen,
  Calendar,
  Check,
  Clock,
  Flame,
  Gift,
  GraduationCap,
  Info,
  Lock,
  Medal,
  Star,
  Trophy,
  Zap,
} from "lucide-react"
import Link from "next/link"

import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Progress } from "@workspace/ui/components/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs"
import { Badge } from "@workspace/ui/components/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@workspace/ui/components/tooltip"

// Sample streak data
const streakData = {
  currentStreak: 16,
  longestStreak: 23,
  totalDays: 45,
  lastWeek: [true, true, true, true, true, false, true], // last 7 days, starting from 6 days ago to today
  streakMilestones: [
    { days: 7, achieved: true, reward: "50 XP Bonus" },
    { days: 14, achieved: true, reward: "Consistency Badge" },
    { days: 30, achieved: false, reward: "Dedication Badge" },
    { days: 60, achieved: false, reward: "Master Badge" },
    { days: 100, achieved: false, reward: "Legend Badge" },
  ],
}

// Sample achievements data
const achievementsData = [
  {
    id: 1,
    name: "Word Collector",
    description: "Learn 100 new words",
    icon: <BookOpen className="h-6 w-6" />,
    progress: 100,
    total: 100,
    achieved: true,
    category: "learning",
    date: "2 days ago",
  },
  {
    id: 2,
    name: "Perfect Quiz",
    description: "Score 100% on a daily quiz",
    icon: <Award className="h-6 w-6" />,
    progress: 100,
    total: 100,
    achieved: true,
    category: "accuracy",
    date: "1 week ago",
  },
  {
    id: 3,
    name: "Consistency Champion",
    description: "Maintain a 7-day learning streak",
    icon: <Flame className="h-6 w-6" />,
    progress: 100,
    total: 100,
    achieved: true,
    category: "consistency",
    date: "2 weeks ago",
  },
  {
    id: 4,
    name: "Vocabulary Builder",
    description: "Learn 500 new words",
    icon: <BookOpen className="h-6 w-6" />,
    progress: 248,
    total: 500,
    achieved: false,
    category: "learning",
    date: null,
  },
  {
    id: 5,
    name: "Speed Learner",
    description: "Review 50 words in under 10 minutes",
    icon: <Clock className="h-6 w-6" />,
    progress: 32,
    total: 50,
    achieved: false,
    category: "efficiency",
    date: null,
  },
  {
    id: 6,
    name: "Business Expert",
    description: "Master all business vocabulary words",
    icon: <GraduationCap className="h-6 w-6" />,
    progress: 75,
    total: 100,
    achieved: false,
    category: "mastery",
    date: null,
  },
  {
    id: 7,
    name: "Perfect Month",
    description: "Study every day for 30 days",
    icon: <Calendar className="h-6 w-6" />,
    progress: 16,
    total: 30,
    achieved: false,
    category: "consistency",
    date: null,
  },
  {
    id: 8,
    name: "Quiz Master",
    description: "Complete 50 daily quizzes",
    icon: <Trophy className="h-6 w-6" />,
    progress: 12,
    total: 50,
    achieved: false,
    category: "mastery",
    date: null,
  },
]

// Sample level data
const levelData = {
  currentLevel: 8,
  currentXP: 1250,
  nextLevelXP: 1500,
  totalXP: 7250,
}

export default function AchievementsPage() {
  const [activeTab, setActiveTab] = useState("all")

  // Filter achievements based on active tab
  const filteredAchievements = achievementsData.filter((achievement) => {
    if (activeTab === "all") return true
    if (activeTab === "completed") return achievement.achieved
    if (activeTab === "in-progress") return !achievement.achieved
    return achievement.category === activeTab
  })

  // Calculate level progress percentage
  const levelProgressPercentage = (levelData.currentXP / levelData.nextLevelXP) * 100

  // Get day name for streak calendar
  const getDayName = (index: number) => {
    const days = ["M", "T", "W", "T", "F", "S", "S"]
    return days[index]
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="container py-4">
          <h1 className="text-2xl font-bold">Streaks & Achievements</h1>
          <p className="text-sm text-muted-foreground">Track your progress and unlock rewards</p>
        </div>
      </header>

      <main className="container py-6">
        {/* Level and XP section */}
        <section className="mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                <div className="flex items-center gap-4">
                  <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <Star className="h-8 w-8 text-primary" />
                    <div className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                      {levelData.currentLevel}
                    </div>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Level {levelData.currentLevel}</h2>
                    <p className="text-sm text-muted-foreground">
                      {levelData.currentXP} / {levelData.nextLevelXP} XP to next level
                    </p>
                  </div>
                </div>
                <div className="w-full sm:w-1/2">
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span>XP Progress</span>
                    <span>{Math.round(levelProgressPercentage)}%</span>
                  </div>
                  <Progress value={levelProgressPercentage} className="h-2.5" />
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="flex items-center gap-1 px-3 py-1.5">
                    <Trophy className="h-3.5 w-3.5 text-amber-500" />
                    <span>{levelData.totalXP} Total XP</span>
                  </Badge>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                          <Info className="h-4 w-4" />
                          <span className="sr-only">XP Info</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Earn XP by learning words, completing quizzes, and maintaining streaks</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Streak section */}
        <section className="mb-6">
          <h2 className="mb-4 text-xl font-semibold">Learning Streak</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="overflow-hidden">
              <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium">Current Streak</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold">{streakData.currentStreak}</span>
                      <span>days</span>
                    </div>
                  </div>
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/20 p-4">
                    <Flame className="h-10 w-10" />
                  </div>
                </div>
              </div>
              <CardContent className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">This week's activity</div>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Calendar className="mr-1 h-3 w-3" />
                    <span>Longest: {streakData.longestStreak} days</span>
                  </Badge>
                </div>
                <div className="flex justify-between">
                  {streakData.lastWeek.map((active, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full ${
                          active ? "bg-orange-100 text-orange-600" : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {active ? <Check className="h-5 w-5" /> : null}
                      </div>
                      <span className="mt-1 text-xs">{getDayName(index)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="border-t bg-muted/20 px-6 py-3">
                <Button variant="ghost" className="w-full" asChild>
                  <Link href="/dashboard">
                    <Zap className="mr-2 h-4 w-4" />
                    Continue Streak Today
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Streak Milestones</CardTitle>
                <CardDescription>Keep your streak going to unlock rewards</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {streakData.streakMilestones.map((milestone, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full ${
                        milestone.achieved ? "bg-orange-100 text-orange-600" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {milestone.achieved ? <Medal className="h-5 w-5" /> : <Lock className="h-4 w-4" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{milestone.days}-Day Streak</h4>
                        <Badge variant={milestone.achieved ? "default" : "outline"}>
                          {milestone.achieved ? "Achieved" : `${streakData.currentStreak}/${milestone.days}`}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">Reward: {milestone.reward}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Achievements section */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Achievements</h2>
            <Badge variant="outline" className="flex items-center gap-1">
              <Trophy className="mr-1 h-3.5 w-3.5" />
              <span>
                {achievementsData.filter((a) => a.achieved).length}/{achievementsData.length} Unlocked
              </span>
            </Badge>
          </div>

          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="w-full sm:w-auto">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="in-progress">In Progress</TabsTrigger>
              <TabsTrigger value="learning">Learning</TabsTrigger>
              <TabsTrigger value="consistency">Consistency</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-4">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredAchievements.map((achievement) => (
                  <Card
                    key={achievement.id}
                    className={`overflow-hidden transition-all hover:shadow-md ${
                      achievement.achieved ? "border-primary/20" : ""
                    }`}
                  >
                    {achievement.achieved && <div className="h-1.5 w-full bg-primary" />}
                    <CardContent className="p-6">
                      <div className="mb-4 flex items-start justify-between">
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-lg ${
                            achievement.achieved ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {achievement.icon}
                        </div>
                        {achievement.achieved ? (
                          <Badge className="bg-primary">
                            <Check className="mr-1 h-3 w-3" />
                            Unlocked
                          </Badge>
                        ) : (
                          <Badge variant="outline">
                            <Lock className="mr-1 h-3 w-3" />
                            Locked
                          </Badge>
                        )}
                      </div>
                      <h3 className="mb-1 font-semibold">{achievement.name}</h3>
                      <p className="mb-3 text-sm text-muted-foreground">{achievement.description}</p>

                      {!achievement.achieved && (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span>Progress</span>
                            <span>
                              {achievement.progress}/{achievement.total}
                            </span>
                          </div>
                          <Progress value={(achievement.progress / achievement.total) * 100} className="h-2" />
                        </div>
                      )}

                      {achievement.achieved && achievement.date && (
                        <div className="mt-2 flex items-center text-xs text-muted-foreground">
                          <Gift className="mr-1 h-3 w-3" />
                          <span>Unlocked {achievement.date}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </section>
      </main>
    </div>
  )
}

