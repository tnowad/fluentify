"use client"

import type React from "react"

import { useState } from "react"
import {
  ArrowRight,
  Book,
  BookOpen,
  Copy,
  HelpCircle,
  History,
  Info,
  Lightbulb,
  Loader2,
  MessageSquare,
  Plus,
  Redo,
  Save,
} from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Label } from "@workspace/ui/components/label"
import { Textarea } from "@workspace/ui/components/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@workspace/ui/components/tooltip"
import { Badge } from "@workspace/ui/components/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs"

// Sample analysis result
const sampleAnalysis = {
  originalSentence: "我想在会议上讨论这个项目的预算",
  translation: "I would like to discuss the budget for this project at the meeting",
  context: "business",
  recipient: "colleague",
  formality: "formal",
  sentenceBreakdown: [
    { word: "我", reading: "wǒ", partOfSpeech: "pronoun", meaning: "I", notes: "Subject of the sentence" },
    {
      word: "想",
      reading: "xiǎng",
      partOfSpeech: "verb",
      meaning: "would like to",
      notes: "Expresses desire or intention",
    },
    { word: "在", reading: "zài", partOfSpeech: "preposition", meaning: "at/in", notes: "Indicates location" },
    {
      word: "会议",
      reading: "huì yì",
      partOfSpeech: "noun",
      meaning: "meeting",
      notes: "Location where the discussion will take place",
    },
    {
      word: "上",
      reading: "shàng",
      partOfSpeech: "postposition",
      meaning: "on/at",
      notes: "Used with 在 to indicate location",
    },
    { word: "讨论", reading: "tǎo lùn", partOfSpeech: "verb", meaning: "discuss", notes: "Main action verb" },
    { word: "这个", reading: "zhè gè", partOfSpeech: "determiner", meaning: "this", notes: "Demonstrative adjective" },
    { word: "项目", reading: "xiàng mù", partOfSpeech: "noun", meaning: "project", notes: "Object being discussed" },
    {
      word: "的",
      reading: "de",
      partOfSpeech: "particle",
      meaning: "of",
      notes: "Possessive particle connecting 项目 and 预算",
    },
    {
      word: "预算",
      reading: "yù suàn",
      partOfSpeech: "noun",
      meaning: "budget",
      notes: "The specific topic of discussion",
    },
  ],
  aboutSentence:
    "This is a formal business sentence commonly used in workplace settings when you want to propose discussing financial aspects of a project during a meeting. It's direct and clear, which is appropriate for professional communication.",
  grammar:
    "This sentence follows the standard Subject-Verb-Object structure with prepositional phrases. The pattern is: Subject (我) + Verb of intention (想) + Prepositional phrase (在会议上) + Main verb (讨论) + Object (这个项目的预算). The possessive particle '的' is used to show that the budget belongs to or is associated with the project.",
  keyVocabulary: [
    { word: "会议", reading: "huì yì", meaning: "meeting", usage: "Formal gathering for discussion" },
    { word: "讨论", reading: "tǎo lùn", meaning: "discuss", usage: "To talk about a topic in detail" },
    { word: "项目", reading: "xiàng mù", meaning: "project", usage: "A planned piece of work" },
    { word: "预算", reading: "yù suàn", meaning: "budget", usage: "Plan for income and expenditure" },
  ],
  alternativeExpressions: [
    {
      expression: "我们能谈谈这个项目的预算吗？",
      translation: "Can we talk about the budget for this project?",
      formality: "neutral",
      notes: "More collaborative, asking for permission",
    },
    {
      expression: "我需要和你讨论项目预算",
      translation: "I need to discuss the project budget with you",
      formality: "direct",
      notes: "More urgent, emphasizes necessity",
    },
  ],
}

// Sample history items
const historyItems = [
  {
    id: 1,
    sentence: "我想在会议上讨论这个项目的预算",
    translation: "I would like to discuss the budget for this project at the meeting",
    context: "business",
  },
  { id: 2, sentence: "请问附近有餐厅吗？", translation: "Is there a restaurant nearby?", context: "travel" },
  { id: 3, sentence: "我们可以改期吗？", translation: "Can we reschedule?", context: "general" },
]

export default function HowDoISayPage() {
  const [inputSentence, setInputSentence] = useState("")
  const [context, setContext] = useState("business")
  const [recipient, setRecipient] = useState("colleague")
  const [formality, setFormality] = useState("formal")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<typeof sampleAnalysis | null>(null)
  const [showHistory, setShowHistory] = useState(false)

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputSentence.trim()) return

    setIsAnalyzing(true)

    // Simulate API call with a timeout
    setTimeout(() => {
      setAnalysisResult(sampleAnalysis)
      setIsAnalyzing(false)
    }, 1500)
  }

  // Load a history item
  const loadHistoryItem = (item: (typeof historyItems)[0]) => {
    setInputSentence(item.sentence)
    setContext(item.context)
    setShowHistory(false)
  }

  // Reset the form
  const resetForm = () => {
    setInputSentence("")
    setContext("business")
    setRecipient("colleague")
    setFormality("formal")
    setAnalysisResult(null)
  }

  // Copy text to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    // In a real app, you would show a toast notification here
  }

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="container py-4">
          <h1 className="text-2xl font-bold">How Do I Say?</h1>
          <p className="text-sm text-muted-foreground">Translate and understand sentences in context</p>
        </div>
      </header>

      <main className="container py-6">
        <div className="grid gap-6 md:grid-cols-3">
          {/* Input section */}
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  Enter Your Sentence
                </CardTitle>
                <CardDescription>Provide a sentence you want to translate and understand</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="sentence">Sentence</Label>
                    <Textarea
                      id="sentence"
                      placeholder="Enter the sentence you want to translate..."
                      value={inputSentence}
                      onChange={(e) => setInputSentence(e.target.value)}
                      className="min-h-[100px]"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="context">Context (Optional)</Label>
                    <Select value={context} onValueChange={setContext}>
                      <SelectTrigger id="context">
                        <SelectValue placeholder="Select context" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="business">Business</SelectItem>
                        <SelectItem value="travel">Travel</SelectItem>
                        <SelectItem value="academic">Academic</SelectItem>
                        <SelectItem value="social">Social</SelectItem>
                        <SelectItem value="general">General</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">Helps provide more accurate translations</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="recipient">Recipient (Optional)</Label>
                    <Select value={recipient} onValueChange={setRecipient}>
                      <SelectTrigger id="recipient">
                        <SelectValue placeholder="Select recipient" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="colleague">Colleague</SelectItem>
                        <SelectItem value="boss">Boss/Superior</SelectItem>
                        <SelectItem value="client">Client</SelectItem>
                        <SelectItem value="friend">Friend</SelectItem>
                        <SelectItem value="stranger">Stranger</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="formality">Formality Level (Optional)</Label>
                    <Select value={formality} onValueChange={setFormality}>
                      <SelectTrigger id="formality">
                        <SelectValue placeholder="Select formality" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="formal">Formal</SelectItem>
                        <SelectItem value="neutral">Neutral</SelectItem>
                        <SelectItem value="informal">Informal</SelectItem>
                        <SelectItem value="casual">Casual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button type="submit" className="w-full" disabled={!inputSentence.trim() || isAnalyzing}>
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <ArrowRight className="mr-2 h-4 w-4" />
                        Analyze Sentence
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
              <CardFooter className="flex justify-between border-t px-6 py-4">
                <Button variant="outline" size="sm" onClick={() => setShowHistory(!showHistory)}>
                  <History className="mr-2 h-4 w-4" />
                  History
                </Button>
                <Button variant="ghost" size="sm" onClick={resetForm}>
                  <Redo className="mr-2 h-4 w-4" />
                  Reset
                </Button>
              </CardFooter>
            </Card>

            {/* History panel */}
            {showHistory && (
              <Card className="mt-4">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Recent Sentences</CardTitle>
                </CardHeader>
                <CardContent className="px-6 py-0">
                  <ul className="space-y-2">
                    {historyItems.map((item) => (
                      <li key={item.id}>
                        <Button
                          variant="ghost"
                          className="w-full justify-start px-2 py-1.5 text-left text-sm"
                          onClick={() => loadHistoryItem(item)}
                        >
                          <div className="flex w-full items-start gap-2">
                            <Badge variant="outline" className="mt-0.5 shrink-0">
                              {item.context}
                            </Badge>
                            <div className="overflow-hidden">
                              <p className="truncate font-medium">{item.sentence}</p>
                              <p className="truncate text-xs text-muted-foreground">{item.translation}</p>
                            </div>
                          </div>
                        </Button>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="border-t px-6 py-3">
                  <Button variant="ghost" size="sm" className="w-full">
                    View All History
                  </Button>
                </CardFooter>
              </Card>
            )}
          </div>

          {/* Results section */}
          <div className="md:col-span-2">
            {analysisResult ? (
              <div className="space-y-6">
                {/* Original and translation */}
                <Card>
                  <CardHeader>
                    <CardTitle>Translation Result</CardTitle>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">{analysisResult.context}</Badge>
                      <Badge variant="outline">{analysisResult.recipient}</Badge>
                      <Badge variant="outline">{analysisResult.formality}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-muted-foreground">Original Sentence</Label>
                      <div className="mt-1 flex items-start justify-between rounded-md border p-3">
                        <p className="text-lg font-medium">{analysisResult.originalSentence}</p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => copyToClipboard(analysisResult.originalSentence)}
                        >
                          <Copy className="h-4 w-4" />
                          <span className="sr-only">Copy original</span>
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">English Translation</Label>
                      <div className="mt-1 flex items-start justify-between rounded-md border p-3">
                        <p className="text-lg font-medium">{analysisResult.translation}</p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => copyToClipboard(analysisResult.translation)}
                        >
                          <Copy className="h-4 w-4" />
                          <span className="sr-only">Copy translation</span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Sentence breakdown */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Book className="h-5 w-5 text-primary" />
                      Sentence Breakdown
                    </CardTitle>
                    <CardDescription>Word-by-word analysis with parts of speech and meanings</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <div className="inline-flex flex-wrap gap-2 pb-2">
                        {analysisResult.sentenceBreakdown.map((word, index) => (
                          <TooltipProvider key={index}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="group relative cursor-help rounded-md border p-2 transition-colors hover:bg-muted">
                                  <div className="mb-1 text-center text-lg font-medium">{word.word}</div>
                                  <div className="text-center text-xs text-muted-foreground">{word.reading}</div>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent side="bottom" className="max-w-xs">
                                <div className="space-y-2 p-1">
                                  <div className="flex items-center justify-between">
                                    <span className="font-medium">{word.meaning}</span>
                                    <Badge variant="outline" className="text-xs">
                                      {word.partOfSpeech}
                                    </Badge>
                                  </div>
                                  <p className="text-xs">{word.notes}</p>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Detailed analysis tabs */}
                <Tabs defaultValue="about">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="about">About</TabsTrigger>
                    <TabsTrigger value="grammar">Grammar</TabsTrigger>
                    <TabsTrigger value="alternatives">Alternatives</TabsTrigger>
                  </TabsList>

                  <TabsContent value="about" className="mt-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Info className="h-5 w-5 text-primary" />
                          About This Sentence
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="leading-relaxed">{analysisResult.aboutSentence}</p>

                        <div className="mt-6">
                          <h4 className="mb-2 font-medium">Key Vocabulary</h4>
                          <div className="space-y-2">
                            {analysisResult.keyVocabulary.map((item, index) => (
                              <div key={index} className="flex items-start rounded-md border p-3">
                                <div className="mr-3">
                                  <div className="font-medium">{item.word}</div>
                                  <div className="text-xs text-muted-foreground">{item.reading}</div>
                                </div>
                                <div>
                                  <div className="font-medium">{item.meaning}</div>
                                  <div className="text-sm text-muted-foreground">{item.usage}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="grammar" className="mt-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BookOpen className="h-5 w-5 text-primary" />
                          Grammar Structure
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="leading-relaxed">{analysisResult.grammar}</p>

                        <div className="mt-6 rounded-md bg-muted p-4">
                          <div className="flex items-center gap-2">
                            <Lightbulb className="h-5 w-5 text-amber-500" />
                            <h4 className="font-medium">Grammar Pattern</h4>
                          </div>
                          <p className="mt-2 text-sm">
                            Subject + Verb of intention + Prepositional phrase + Main verb + Object
                          </p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <Badge variant="outline" className="bg-blue-50">
                              Subject
                            </Badge>
                            <Badge variant="outline" className="bg-green-50">
                              Verb
                            </Badge>
                            <Badge variant="outline" className="bg-purple-50">
                              Prep. Phrase
                            </Badge>
                            <Badge variant="outline" className="bg-green-50">
                              Main Verb
                            </Badge>
                            <Badge variant="outline" className="bg-orange-50">
                              Object
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="alternatives" className="mt-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <HelpCircle className="h-5 w-5 text-primary" />
                          Alternative Expressions
                        </CardTitle>
                        <CardDescription>Other ways to express the same idea</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {analysisResult.alternativeExpressions.map((alt, index) => (
                            <div key={index} className="rounded-md border p-4">
                              <div className="mb-2 flex items-center justify-between">
                                <h4 className="font-medium">{alt.expression}</h4>
                                <Badge variant="outline">{alt.formality}</Badge>
                              </div>
                              <p className="mb-2 text-muted-foreground">{alt.translation}</p>
                              <p className="text-sm text-muted-foreground">{alt.notes}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>

                {/* Action buttons */}
                <div className="flex flex-wrap gap-3">
                  <Button onClick={resetForm} className="flex-1">
                    <Plus className="mr-2 h-4 w-4" />
                    New Sentence
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Save className="mr-2 h-4 w-4" />
                    Save to Flashcards
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
                <MessageSquare className="mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="mb-2 text-lg font-medium">Enter a sentence to analyze</h3>
                <p className="mb-4 max-w-md text-sm text-muted-foreground">
                  Type a sentence in the input field and click "Analyze Sentence" to see a detailed breakdown and
                  translation.
                </p>
                <div className="flex flex-col gap-2">
                  <p className="text-sm font-medium">Try these examples:</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {historyItems.map((item) => (
                      <Button key={item.id} variant="outline" size="sm" onClick={() => loadHistoryItem(item)}>
                        {item.sentence}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

