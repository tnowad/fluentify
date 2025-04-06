"use client";

import { useState, useEffect } from "react";
import { CheckCircle, Clock, Home, Share2, XCircle } from "lucide-react";
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
import { Badge } from "@workspace/ui/components/badge";

// Sample quiz data
const quizData = [
  {
    id: 1,
    word: "Facilitate",
    correctAnswer: "To make an action or process easier",
    options: [
      "To make an action or process easier",
      "To complicate a situation",
      "To delegate responsibility",
      "To finalize a contract",
    ],
  },
  {
    id: 2,
    word: "Implement",
    correctAnswer: "To put a decision or plan into effect",
    options: [
      "To create a new tool",
      "To put a decision or plan into effect",
      "To improve a design",
      "To request additional resources",
    ],
  },
  {
    id: 3,
    word: "Negotiate",
    correctAnswer: "To discuss terms to reach an agreement",
    options: [
      "To decline an offer",
      "To discuss terms to reach an agreement",
      "To finalize a sale",
      "To present a proposal",
    ],
  },
  {
    id: 4,
    word: "Procurement",
    correctAnswer: "The action of obtaining goods or services",
    options: [
      "The process of hiring employees",
      "The action of obtaining goods or services",
      "The method of producing goods",
      "The strategy of marketing products",
    ],
  },
  {
    id: 5,
    word: "Delegate",
    correctAnswer: "To entrust a task to another person",
    options: [
      "To entrust a task to another person",
      "To postpone a meeting",
      "To reject a proposal",
      "To analyze data",
    ],
  },
];

// Quiz states
type QuizState = "intro" | "question" | "feedback" | "summary";

export default function DailyQuizPage() {
  // Quiz state management
  const [quizState, setQuizState] = useState<QuizState>("intro");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<
    { correct: boolean; selectedAnswer: string }[]
  >([]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [timerActive, setTimerActive] = useState(false);

  const currentQuestion = quizData[currentQuestionIndex];
  const totalQuestions = quizData.length;

  // Start timer when question is shown
  useEffect(() => {
    if (quizState === "question" && timerActive) {
      const timer = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timer);
            setTimerActive(false);
            handleTimeout();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [quizState, timerActive]);

  // Start the quiz
  const startQuiz = () => {
    setQuizState("question");
    setTimeLeft(30);
    setTimerActive(true);
  };

  // Handle answer selection
  const handleAnswerSelect = (answer: string) => {
    if (timerActive) {
      setTimerActive(false);
      setSelectedAnswer(answer);

      const isCorrect = answer === currentQuestion.correctAnswer;
      if (isCorrect) {
        setScore(score + 1);
      }

      setAnswers([
        ...answers,
        {
          correct: isCorrect,
          selectedAnswer: answer,
        },
      ]);

      setQuizState("feedback");
    }
  };

  // Handle timeout (no answer selected)
  const handleTimeout = () => {
    setSelectedAnswer(null);
    setAnswers([
      ...answers,
      {
        correct: false,
        selectedAnswer: "",
      },
    ]);
    setQuizState("feedback");
  };

  // Move to next question
  const handleNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setQuizState("question");
      setTimeLeft(30);
      setTimerActive(true);
    } else {
      setQuizState("summary");
    }
  };

  // Restart the quiz
  const restartQuiz = () => {
    setQuizState("intro");
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setScore(0);
    setAnswers([]);
    setTimeLeft(30);
    setTimerActive(false);
  };

  // Format time display
  const formatTime = (seconds: number) => {
    return `${seconds}s`;
  };

  // Calculate percentage for progress bar
  const progressPercentage = (currentQuestionIndex / totalQuestions) * 100;

  // Render quiz intro screen
  const renderIntro = () => (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Daily TOEIC Quiz</CardTitle>
        <CardDescription>
          Test your vocabulary knowledge with today's quiz
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg bg-muted p-4 text-center">
          <h3 className="font-medium">Today's Challenge</h3>
          <p className="text-sm text-muted-foreground">
            5 business vocabulary words • Multiple choice
          </p>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span>Time per question:</span>
            <span className="font-medium">30 seconds</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Total questions:</span>
            <span className="font-medium">{totalQuestions}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Difficulty:</span>
            <span className="font-medium">Intermediate</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={startQuiz}>
          Start Quiz
        </Button>
      </CardFooter>
    </Card>
  );

  // Render question screen
  const renderQuestion = () => (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-2 text-center">
        <div className="flex items-center justify-between">
          <Badge variant="outline">
            Question {currentQuestionIndex + 1}/{totalQuestions}
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatTime(timeLeft)}
          </Badge>
        </div>
        <Progress value={progressPercentage} className="mt-2 h-1" />
      </CardHeader>
      <CardContent className="space-y-6 pt-4">
        <div className="text-center">
          <h2 className="text-3xl font-bold">{currentQuestion.word}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Select the correct definition
          </p>
        </div>
        <div className="space-y-3">
          {currentQuestion.options.map((option, index) => (
            <Button
              key={index}
              variant="outline"
              className="w-full justify-start p-4 text-left font-normal"
              onClick={() => handleAnswerSelect(option)}
            >
              <span className="mr-2 flex h-6 w-6 items-center justify-center rounded-full border text-xs">
                {String.fromCharCode(65 + index)}
              </span>
              {option}
            </Button>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between text-xs text-muted-foreground">
        <div>
          Score: {score}/{currentQuestionIndex}
        </div>
        <div>Time remaining: {formatTime(timeLeft)}</div>
      </CardFooter>
    </Card>
  );

  // Render feedback screen
  const renderFeedback = () => {
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

    return (
      <Card className="w-full max-w-md">
        <CardHeader
          className={`pb-2 text-center ${isCorrect ? "bg-green-50" : "bg-red-50"}`}
        >
          <div className="flex items-center justify-center gap-2">
            {isCorrect ? (
              <>
                <CheckCircle className="h-6 w-6 text-green-600" />
                <CardTitle className="text-green-800">Correct!</CardTitle>
              </>
            ) : (
              <>
                <XCircle className="h-6 w-6 text-red-600" />
                <CardTitle className="text-red-800">Incorrect</CardTitle>
              </>
            )}
          </div>
          <Progress value={progressPercentage} className="mt-2 h-1" />
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold">{currentQuestion.word}</h2>
          </div>

          <div className="rounded-lg bg-green-50 p-3">
            <p className="text-sm font-medium text-green-800">
              Correct definition:
            </p>
            <p className="text-sm text-green-700">
              {currentQuestion.correctAnswer}
            </p>
          </div>

          {!isCorrect && selectedAnswer && (
            <div className="rounded-lg bg-red-50 p-3">
              <p className="text-sm font-medium text-red-800">Your answer:</p>
              <p className="text-sm text-red-700">{selectedAnswer}</p>
            </div>
          )}

          {!selectedAnswer && (
            <div className="rounded-lg bg-amber-50 p-3">
              <p className="text-sm font-medium text-amber-800">Time's up!</p>
              <p className="text-sm text-amber-700">
                You didn't select an answer in time.
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={handleNextQuestion}>
            {currentQuestionIndex < totalQuestions - 1
              ? "Next Question"
              : "See Results"}
          </Button>
        </CardFooter>
      </Card>
    );
  };

  // Render summary screen
  const renderSummary = () => {
    const percentage = (score / totalQuestions) * 100;
    let message = "";

    if (percentage >= 80) {
      message = "Excellent! You have a strong vocabulary.";
    } else if (percentage >= 60) {
      message = "Good job! Keep practicing to improve.";
    } else {
      message = "Keep learning! Review the words you missed.";
    }

    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Quiz Complete!</CardTitle>
          <CardDescription>
            Here's how you performed on today's quiz
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center justify-center">
            <div className="text-5xl font-bold">
              {score}/{totalQuestions}
            </div>
            <p className="mt-2 text-muted-foreground">
              {percentage.toFixed(0)}% Correct
            </p>
          </div>

          <div className="rounded-lg bg-muted p-4 text-center">
            <p className="font-medium">{message}</p>
          </div>

          <div className="space-y-3">
            <h3 className="font-medium">Question Summary</h3>
            {quizData.map((question, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="flex-1">
                  <p className="font-medium">{question.word}</p>
                </div>
                {answers[index]?.correct ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <div className="flex w-full gap-2">
            <Button className="flex-1" onClick={restartQuiz}>
              Try Again
            </Button>
            <Button variant="outline" className="flex-1" asChild>
              <Link href="/dashboard">
                <Home className="mr-2 h-4 w-4" />
                Dashboard
              </Link>
            </Button>
          </div>
          <Button variant="ghost" className="w-full">
            <Share2 className="mr-2 h-4 w-4" />
            Share Results
          </Button>
        </CardFooter>
      </Card>
    );
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
      {quizState === "intro" && renderIntro()}
      {quizState === "question" && renderQuestion()}
      {quizState === "feedback" && renderFeedback()}
      {quizState === "summary" && renderSummary()}
    </div>
  );
}
