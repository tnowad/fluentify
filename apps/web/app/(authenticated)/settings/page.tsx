"use client"

import type React from "react"

import { useState } from "react"
import { Bell, ChevronRight, Globe, HelpCircle, LogOut, Moon, Save, Trash2, Upload, Volume2 } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Switch } from "@workspace/ui/components/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@workspace/ui/components/alert-dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@workspace/ui/components/tooltip"
import { Slider } from "@workspace/ui/components/slider"
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar"

export default function SettingsPage() {
  // User profile state
  const [profile, setProfile] = useState({
    name: "Alex Johnson",
    email: "alex.johnson@example.com",
    avatar: "/placeholder.svg?height=100&width=100",
  })

  // Goal settings state
  const [goals, setGoals] = useState({
    wordsPerDay: 20,
    studyTime: 30,
    difficulty: "balanced",
    reviewFrequency: "daily",
  })

  // App preferences state
  const [preferences, setPreferences] = useState({
    speechMode: true,
    darkMode: false,
    notifications: true,
    autoPlay: true,
    language: "english",
  })

  // Handle profile changes
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    })
  }

  // Handle words per day slider change
  const handleWordsPerDayChange = (value: number[]) => {
    setGoals({
      ...goals,
      wordsPerDay: value[0],
    })
  }

  // Handle study time slider change
  const handleStudyTimeChange = (value: number[]) => {
    setGoals({
      ...goals,
      studyTime: value[0],
    })
  }

  // Handle preference toggle changes
  const handleToggleChange = (name: string, checked: boolean) => {
    setPreferences({
      ...preferences,
      [name]: checked,
    })
  }

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, this would save the settings to a database
    console.log("Saving settings:", { profile, goals, preferences })
    // Show success message or notification
  }

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="container py-4">
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-sm text-muted-foreground">Manage your account and preferences</p>
        </div>
      </header>

      <main className="container py-6">
        <form onSubmit={handleSubmit}>
          {/* Profile Section */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal information and profile picture</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="flex flex-col items-center justify-center gap-4">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={profile.avatar} alt={profile.name} />
                    <AvatarFallback>{profile.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <Upload className="mr-1 h-4 w-4" />
                    Change Avatar
                  </Button>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Name
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      value={profile.name}
                      onChange={handleProfileChange}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="email" className="text-right">
                      Email
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={profile.email}
                      onChange={handleProfileChange}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Account</Label>
                    <div className="col-span-3 flex items-center justify-between rounded-md border p-3">
                      <div>
                        <p className="font-medium">Premium Plan</p>
                        <p className="text-sm text-muted-foreground">Active until Dec 31, 2023</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Manage
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Learning Goals Section */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Learning Goals</CardTitle>
              <CardDescription>Set your daily targets and learning preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="words-per-day" className="text-right">
                    Words per day
                  </Label>
                  <div className="col-span-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Target: {goals.wordsPerDay} words</span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                              <HelpCircle className="h-4 w-4" />
                              <span className="sr-only">Help</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Set how many new words you want to learn each day</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <Slider
                      id="words-per-day"
                      min={5}
                      max={50}
                      step={5}
                      value={[goals.wordsPerDay]}
                      onValueChange={handleWordsPerDayChange}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>5</span>
                      <span>25</span>
                      <span>50</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="study-time" className="text-right">
                    Study time
                  </Label>
                  <div className="col-span-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Target: {goals.studyTime} minutes</span>
                    </div>
                    <Slider
                      id="study-time"
                      min={5}
                      max={60}
                      step={5}
                      value={[goals.studyTime]}
                      onValueChange={handleStudyTimeChange}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>5 min</span>
                      <span>30 min</span>
                      <span>60 min</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="difficulty" className="text-right">
                    Difficulty
                  </Label>
                  <Select value={goals.difficulty} onValueChange={(value) => setGoals({ ...goals, difficulty: value })}>
                    <SelectTrigger id="difficulty" className="col-span-3">
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy - Focus on basic vocabulary</SelectItem>
                      <SelectItem value="balanced">Balanced - Mix of difficulty levels</SelectItem>
                      <SelectItem value="challenging">Challenging - Prioritize difficult words</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="review-frequency" className="text-right">
                    Review frequency
                  </Label>
                  <Select
                    value={goals.reviewFrequency}
                    onValueChange={(value) => setGoals({ ...goals, reviewFrequency: value })}
                  >
                    <SelectTrigger id="review-frequency" className="col-span-3">
                      <SelectValue placeholder="Select review frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily - Review words every day</SelectItem>
                      <SelectItem value="spaced">Spaced - Optimal intervals for retention</SelectItem>
                      <SelectItem value="weekly">Weekly - Consolidated weekly reviews</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* App Preferences Section */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>App Preferences</CardTitle>
              <CardDescription>Customize your learning experience</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="speech-mode" className="text-right">
                    Speech mode
                  </Label>
                  <div className="col-span-3 flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center">
                        <Volume2 className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>Pronunciation audio</span>
                      </div>
                      <p className="text-sm text-muted-foreground">Automatically play word pronunciations</p>
                    </div>
                    <Switch
                      id="speech-mode"
                      checked={preferences.speechMode}
                      onCheckedChange={(checked) => handleToggleChange("speechMode", checked)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="dark-mode" className="text-right">
                    Dark mode
                  </Label>
                  <div className="col-span-3 flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center">
                        <Moon className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>Dark theme</span>
                      </div>
                      <p className="text-sm text-muted-foreground">Switch between light and dark theme</p>
                    </div>
                    <Switch
                      id="dark-mode"
                      checked={preferences.darkMode}
                      onCheckedChange={(checked) => handleToggleChange("darkMode", checked)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="notifications" className="text-right">
                    Notifications
                  </Label>
                  <div className="col-span-3 flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center">
                        <Bell className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>Study reminders</span>
                      </div>
                      <p className="text-sm text-muted-foreground">Receive daily reminders to study</p>
                    </div>
                    <Switch
                      id="notifications"
                      checked={preferences.notifications}
                      onCheckedChange={(checked) => handleToggleChange("notifications", checked)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="language" className="text-right">
                    Language
                  </Label>
                  <div className="col-span-3 flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center">
                        <Globe className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>Interface language</span>
                      </div>
                      <p className="text-sm text-muted-foreground">Change the app's display language</p>
                    </div>
                    <Select
                      value={preferences.language}
                      onValueChange={(value) => setPreferences({ ...preferences, language: value })}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="english">English</SelectItem>
                        <SelectItem value="japanese">Japanese</SelectItem>
                        <SelectItem value="korean">Korean</SelectItem>
                        <SelectItem value="chinese">Chinese</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Management Section */}
          <Card>
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
              <CardDescription>Manage your learning data and account settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label className="pt-2 text-right">Export data</Label>
                  <div className="col-span-3">
                    <Button variant="outline" className="flex items-center gap-1">
                      Download your learning data
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Download all your vocabulary and progress data as CSV
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-4 items-start gap-4">
                  <Label className="pt-2 text-right text-destructive">Reset progress</Label>
                  <div className="col-span-3">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          className="flex items-center gap-1 border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700"
                        >
                          <Trash2 className="mr-1 h-4 w-4" />
                          Reset all progress
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete all your learning progress,
                            including words learned, review history, and statistics.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction className="bg-red-600 hover:bg-red-700">
                            Yes, reset everything
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    <p className="mt-1 text-xs text-muted-foreground">
                      This will reset all your learning progress and statistics
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-4 items-start gap-4">
                  <Label className="pt-2 text-right text-destructive">Account</Label>
                  <div className="col-span-3 space-y-2">
                    <Button variant="outline" className="flex items-center gap-1">
                      <LogOut className="mr-1 h-4 w-4" />
                      Sign out
                    </Button>
                    <Button
                      variant="ghost"
                      className="flex items-center gap-1 text-red-600 hover:bg-red-100 hover:text-red-700"
                    >
                      Delete account
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end border-t p-6">
              <Button type="submit" className="flex items-center gap-1">
                <Save className="mr-1 h-4 w-4" />
                Save Settings
              </Button>
            </CardFooter>
          </Card>
        </form>
      </main>
    </div>
  )
}

