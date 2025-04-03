import {
  BookOpen,
  Calendar,
  CheckCircle,
  ChevronRight,
  Clock,
  Flame
} from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Progress } from "@workspace/ui/components/progress"

export default function DashboardPage() {
  return (
    <>
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Words Learned</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
              <div className="text-3xl font-bold">1,248</div>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">+24 words this week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Words Due Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Calendar className="mr-2 h-5 w-5 text-blue-500" />
              <div className="text-3xl font-bold">42</div>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">15 new, 27 reviews</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Learning Streak</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Flame className="mr-2 h-5 w-5 text-orange-500" />
              <div className="text-3xl font-bold">16</div>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">days in a row</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Today's Goal</CardTitle>
            <CardDescription>You're making great progress!</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium">Daily progress</span>
              <span className="text-sm font-medium">18/30 words</span>
            </div>
            <Progress value={60} className="h-2" />
            <div className="mt-6 flex items-center">
              <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Estimated time remaining: 15 minutes</span>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" size="lg">
              Start Learning
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>

        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Weekly Overview</CardTitle>
            <CardDescription>Last 7 days of activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-[120px] items-end justify-between gap-2">
              {[65, 40, 85, 30, 55, 95, 75].map((height, i) => (
                <div key={i} className="relative flex w-full flex-col items-center">
                  <div className="w-full rounded-t bg-primary" style={{ height: `${height}%` }}></div>
                  <span className="mt-2 text-xs">{["M", "T", "W", "T", "F", "S", "S"][i]}</span>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <div className="text-sm text-muted-foreground">Total this week: 168 words</div>
            <Button variant="outline" size="sm">
              View Details
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your learning history</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { time: "Today, 10:30 AM", action: "Completed Business Vocabulary set", count: 15 },
                { time: "Yesterday, 4:15 PM", action: "Reviewed Office Communication words", count: 20 },
                { time: "Yesterday, 9:20 AM", action: "Learned new Marketing terms", count: 12 },
                { time: "Apr 12, 2:45 PM", action: "Practiced Interview Vocabulary", count: 25 },
              ].map((item, i) => (
                <div key={i} className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="rounded-full bg-primary/10 p-2">
                      <BookOpen className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{item.action}</p>
                      <p className="text-sm text-muted-foreground">{item.time}</p>
                    </div>
                  </div>
                  <div className="text-sm font-medium">{item.count} words</div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">
              View All Activity
            </Button>
          </CardFooter>
        </Card>
      </div>
    </>
  )
}

