"use client"

import { useState } from "react"
import { ArrowLeft, Play, ThumbsDown, ThumbsUp, X } from "lucide-react"
import Link from "next/link"

import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardFooter } from "@workspace/ui/components/card"
import { Progress } from "@workspace/ui/components/progress"

export default function FlashcardReview() {
  // State for tracking what's revealed
  const [showDefinition, setShowDefinition] = useState(false)
  const [showExample, setShowExample] = useState(false)
  const [answered, setAnswered] = useState(false)

  // Sample flashcard data
  const flashcard = {
    word: "Expedite",
    definition: "To make something happen more quickly",
    example: "We need to expedite the delivery of these documents before the deadline.",
    partOfSpeech: "verb",
    progress: 65,
  }

  // Reset the card state for the next card
  const handleNextCard = () => {
    setShowDefinition(false)
    setShowExample(false)
    setAnswered(false)
    // In a real app, you would load the next card here
  }

  // Handle rating selection
  const handleRating = (rating: string) => {
    setAnswered(true)
    // In a real app, you would save the rating here
    console.log(`User rated card as: ${rating}`)
  }

  // Handle pronunciation
  const handlePronunciation = () => {
    // In a real app, you would play the pronunciation audio here
    console.log("Playing pronunciation")
  }

  return (
    <div className="flex min-h-screen flex-col bg-muted/40">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between border-b bg-background px-4 py-3">
        <Link href="/dashboard" className="flex items-center gap-1 text-muted-foreground">
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </Link>
        <div className="text-sm font-medium">Card 13 of 20</div>
      </header>

      {/* Progress bar */}
      <div className="px-4 py-2">
        <Progress value={flashcard.progress} className="h-1.5" />
      </div>

      {/* Main content */}
      <main className="flex flex-1 flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="mb-6 flex items-center justify-between">
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                {flashcard.partOfSpeech}
              </span>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={handlePronunciation}>
                <Play className="h-4 w-4" />
                <span className="sr-only">Play pronunciation</span>
              </Button>
            </div>

            {/* Word */}
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{flashcard.word}</h1>
            </div>

            {/* Definition */}
            {!showDefinition ? (
              <Button className="mb-4 w-full" onClick={() => setShowDefinition(true)}>
                Show Definition
              </Button>
            ) : (
              <div className="mb-4 rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
                <p className="text-center">{flashcard.definition}</p>
              </div>
            )}

            {/* Example sentence */}
            {showDefinition && !showExample ? (
              <Button className="w-full" onClick={() => setShowExample(true)}>
                Show Example
              </Button>
            ) : showDefinition && showExample ? (
              <div className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
                <p className="text-center italic">"{flashcard.example}"</p>
              </div>
            ) : null}
          </CardContent>

          {/* Rating buttons */}
          {showDefinition && showExample && !answered ? (
            <CardFooter className="flex justify-between gap-2 p-6 pt-0">
              <Button
                variant="outline"
                className="flex-1 border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700"
                onClick={() => handleRating("forgot")}
              >
                <X className="mr-1 h-4 w-4" />
                Forgot
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-orange-200 bg-orange-50 text-orange-600 hover:bg-orange-100 hover:text-orange-700"
                onClick={() => handleRating("hard")}
              >
                <ThumbsDown className="mr-1 h-4 w-4" />
                Hard
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-green-200 bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700"
                onClick={() => handleRating("easy")}
              >
                <ThumbsUp className="mr-1 h-4 w-4" />
                Easy
              </Button>
            </CardFooter>
          ) : answered ? (
            <CardFooter className="p-6 pt-0">
              <Button className="w-full" onClick={handleNextCard}>
                Next Card
              </Button>
            </CardFooter>
          ) : null}
        </Card>
      </main>
    </div>
  )
}

