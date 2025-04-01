"use client"

import { useState } from "react"
import { Bell, BookOpen, Check, ChevronRight, Clock, MoreHorizontal, Sparkles, X } from "lucide-react"
import Link from "next/link"

import { Button } from "@workspace/ui/components/button"
import { Card, CardContent } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { Separator } from "@workspace/ui/components/separator"

// Sample notification data
const notifications = [
  {
    id: 1,
    type: "review",
    title: "Words due for review",
    message: "You have 15 words due for review today. Don't break your streak!",
    timestamp: "10 minutes ago",
    isRead: false,
    action: {
      label: "Review Now",
      url: "/review",
    },
  },
  {
    id: 2,
    type: "ai",
    title: "Learning suggestion",
    message: "Based on your performance, we recommend focusing on Business Vocabulary this week.",
    timestamp: "2 hours ago",
    isRead: false,
    action: {
      label: "View Suggestion",
      url: "/weakness-report",
    },
  },
  {
    id: 3,
    type: "reminder",
    title: "Daily goal reminder",
    message: "You're 5 words away from reaching your daily goal of 20 words.",
    timestamp: "5 hours ago",
    isRead: true,
    action: {
      label: "Continue Learning",
      url: "/dashboard",
    },
  },
  {
    id: 4,
    type: "system",
    title: "New feature available",
    message: "We've added a new pronunciation practice feature. Try it out!",
    timestamp: "Yesterday",
    isRead: true,
    action: {
      label: "Try Now",
      url: "/pronunciation",
    },
  },
  {
    id: 5,
    type: "review",
    title: "Weekly review summary",
    message: "Last week you reviewed 85 words with an accuracy of 92%. Great job!",
    timestamp: "2 days ago",
    isRead: true,
    action: null,
  },
  {
    id: 6,
    type: "ai",
    title: "Personalized study plan",
    message: "We've created a personalized study plan based on your recent performance.",
    timestamp: "3 days ago",
    isRead: true,
    action: {
      label: "View Plan",
      url: "/study-plan",
    },
  },
  {
    id: 7,
    type: "reminder",
    title: "Streak alert",
    message: "You're on a 7-day streak! Keep it going by studying today.",
    timestamp: "4 days ago",
    isRead: true,
    action: {
      label: "Quick Review",
      url: "/quick-review",
    },
  },
]

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState("all")
  const [notificationState, setNotificationState] = useState(notifications)

  // Filter notifications based on active tab
  const filteredNotifications = notificationState.filter((notification) => {
    if (activeTab === "all") return true
    if (activeTab === "unread") return !notification.isRead
    return notification.type === activeTab
  })

  // Mark a notification as read
  const markAsRead = (id: number) => {
    setNotificationState(
      notificationState.map((notification) =>
        notification.id === id ? { ...notification, isRead: true } : notification,
      ),
    )
  }

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotificationState(notificationState.map((notification) => ({ ...notification, isRead: true })))
  }

  // Delete a notification
  const deleteNotification = (id: number) => {
    setNotificationState(notificationState.filter((notification) => notification.id !== id))
  }

  // Clear all notifications
  const clearAllNotifications = () => {
    setNotificationState([])
  }

  // Get icon based on notification type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "review":
        return <BookOpen className="h-5 w-5 text-blue-500" />
      case "ai":
        return <Sparkles className="h-5 w-5 text-purple-500" />
      case "reminder":
        return <Clock className="h-5 w-5 text-orange-500" />
      case "system":
        return <Bell className="h-5 w-5 text-gray-500" />
      default:
        return <Bell className="h-5 w-5 text-gray-500" />
    }
  }

  // Count unread notifications
  const unreadCount = notificationState.filter((notification) => !notification.isRead).length

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="container flex items-center justify-between py-4">
          <div>
            <h1 className="text-2xl font-bold">Notifications</h1>
            <p className="text-sm text-muted-foreground">
              {unreadCount > 0 ? `You have ${unreadCount} unread notifications` : "No new notifications"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">More options</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={markAllAsRead}>
                  <Check className="mr-2 h-4 w-4" />
                  Mark all as read
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={clearAllNotifications} className="text-red-600">
                  <X className="mr-2 h-4 w-4" />
                  Clear all notifications
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="container py-6">
        {/* Tabs for filtering */}
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="unread">
                Unread
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 text-xs">
                    {unreadCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="review">Reviews</TabsTrigger>
              <TabsTrigger value="ai">AI Suggestions</TabsTrigger>
              <TabsTrigger value="reminder">Reminders</TabsTrigger>
            </TabsList>
          </div>

          {/* Notification list */}
          <TabsContent value={activeTab} className="mt-4">
            {filteredNotifications.length > 0 ? (
              <div className="space-y-3">
                {filteredNotifications.map((notification) => (
                  <Card
                    key={notification.id}
                    className={`overflow-hidden transition-all ${!notification.isRead ? "border-l-4 border-l-primary" : ""}`}
                  >
                    <CardContent className="p-0">
                      <div className="flex items-start p-4">
                        <div className="mr-4 mt-0.5">{getNotificationIcon(notification.type)}</div>
                        <div className="flex-1">
                          <div className="mb-1 flex items-center justify-between">
                            <h3 className="font-medium">{notification.title}</h3>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">{notification.timestamp}</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => deleteNotification(notification.id)}
                              >
                                <X className="h-3 w-3" />
                                <span className="sr-only">Delete</span>
                              </Button>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">{notification.message}</p>
                          {!notification.isRead && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="mt-2 h-7 px-2 text-xs"
                              onClick={() => markAsRead(notification.id)}
                            >
                              <Check className="mr-1 h-3 w-3" />
                              Mark as read
                            </Button>
                          )}
                        </div>
                      </div>
                      {notification.action && (
                        <>
                          <Separator />
                          <div className="p-2">
                            <Button variant="ghost" size="sm" className="w-full justify-between" asChild>
                              <Link href={notification.action.url}>
                                {notification.action.label}
                                <ChevronRight className="h-4 w-4" />
                              </Link>
                            </Button>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                <Bell className="mb-2 h-10 w-10 text-muted-foreground" />
                <h3 className="text-lg font-medium">No notifications</h3>
                <p className="text-sm text-muted-foreground">
                  {activeTab === "all"
                    ? "You don't have any notifications yet"
                    : `You don't have any ${activeTab} notifications`}
                </p>
                {activeTab !== "all" && (
                  <Button variant="outline" className="mt-4" onClick={() => setActiveTab("all")}>
                    View all notifications
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

