"use client";
import { ArrowLeft, BookOpen, ExternalLink, HelpCircle, Play, Share2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Separator } from "@workspace/ui/components/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs"
import { Badge } from "@workspace/ui/components/badge"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { HttpStatus } from "@workspace/contracts"
import { useParams } from "next/navigation";

export default function WordDetailPage() {
  const { word } = useParams<{ word: string }>()

  const { data, error, isLoading } = useQuery(
    {
      queryFn: async () => {
        const response = await api.word.getWord({ params: { word } })
        if (response.status === HttpStatus.OK) {
          return response.body
        }
        return null;
      },
      queryKey: ["word-details", word],
      enabled: !!word,
    }
  )

  if (isLoading) return <div>Loading...</div>
  if (error instanceof Error) return <div>Error: {error.message}</div>

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="container flex h-14 items-center">
          <Link href="/words" className="mr-auto flex items-center gap-1 text-muted-foreground">
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Link>
          <Button variant="ghost" size="icon">
            <Share2 className="h-4 w-4" />
            <span className="sr-only">Share</span>
          </Button>
          <Button variant="ghost" size="icon">
            <BookOpen className="h-4 w-4" />
            <span className="sr-only">Add to study list</span>
          </Button>
        </div>
      </header>

      <main className="container py-6">
        {/* Word header section */}
        <section className="mb-8">
          <div className="flex items-center gap-2">
            {/* If partOfSpeech exists in any definition */}
            {data?.definitions[0]?.partOfSpeech && (
              <Badge variant="outline" className="text-xs font-normal text-muted-foreground">
                {data?.definitions[0]?.partOfSpeech}
              </Badge>
            )}
            <Badge variant="outline" className="text-xs font-normal text-muted-foreground">
              {data?.source}
            </Badge>
          </div>

          <div className="mt-2 flex items-center justify-between">
            <h1 className="text-4xl font-bold tracking-tight">{data?.word}</h1>
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-full">
              <Play className="h-4 w-4" />
              <span className="sr-only">Play pronunciation</span>
            </Button>
          </div>

          <div className="mt-1 text-muted-foreground">{data?.mainPhonetic}</div>
        </section>

        {/* Main content tabs */}
        <Tabs defaultValue="definitions" className="mb-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="definitions">Definitions</TabsTrigger>
            <TabsTrigger value="examples">Examples</TabsTrigger>
            <TabsTrigger value="related">Related</TabsTrigger>
          </TabsList>

          {/* Definitions tab */}
          <TabsContent value="definitions" className="mt-4 space-y-4">
            {data?.definitions.map((def, index) => (
              <div key={index} className="space-y-2">
                <h3 className="font-medium">Definition {index + 1}</h3>
                <p>{def.definition}</p>
                <div className="rounded-md bg-muted p-3">
                  <p className="italic text-muted-foreground">"{def.example}"</p>
                </div>
              </div>
            ))}

            <div className="pt-2">
              <h3 className="mb-2 font-medium">Synonyms</h3>
              <div className="flex flex-wrap gap-2">
                {data?.synonyms.map((synonym, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {synonym}
                  </Badge>
                ))}
              </div>
            </div>

            {data?.origin && (
              <div className="pt-2">
                <h3 className="mb-2 font-medium">Origin</h3>
                <p className="text-sm text-muted-foreground">{data?.origin}</p>
              </div>
            )}
          </TabsContent>

          {/* Examples tab */}
          <TabsContent value="examples" className="mt-4">
            <div className="space-y-4">
              <h3 className="font-medium">Example Sentences</h3>
              <ul className="space-y-3">
                {data?.examples.map((example, index) => (
                  <li key={index} className="rounded-md border p-3">
                    <p className="italic">"{example}"</p>
                  </li>
                ))}
              </ul>
            </div>
          </TabsContent>

          {/* Related tab */}
          <TabsContent value="related" className="mt-4">
            {data?.relatedWords && data.relatedWords.length > 0 ? (
              <div className="space-y-4">
                <h3 className="font-medium">Related Words</h3>
                <ul className="divide-y">
                  {data?.relatedWords.map((related, index) => (
                    <li key={index} className="flex items-center justify-between py-3">
                      <div>
                        <p className="font-medium">{related.word}</p>
                        <p className="text-sm text-muted-foreground">{related.partOfSpeech}</p>
                      </div>
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/words/${related.word.toLowerCase()}`}>
                          <ExternalLink className="h-4 w-4" />
                          <span className="sr-only">View {related.word}</span>
                        </Link>
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <p className="text-muted-foreground">No related words available</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* AI Feedback section */}
        {data?.aiFeedback && (
          <section className="mb-8">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">AI Learning Assistant</CardTitle>
                </div>
                <CardDescription>Tips and common mistakes for this word</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="mb-1 font-medium">Common Mistakes</h4>
                  <p className="text-sm text-muted-foreground">{data.aiFeedback.commonMistakes}</p>
                </div>
                <Separator />
                <div>
                  <h4 className="mb-1 font-medium">Grammar Tips</h4>
                  <p className="text-sm text-muted-foreground">{data.aiFeedback.grammarTips}</p>
                </div>
                <Separator />
                <div>
                  <h4 className="mb-1 font-medium">Usage Tips</h4>
                  <p className="text-sm text-muted-foreground">{data.aiFeedback.usageTips}</p>
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Practice section */}
        <section>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Practice this word</h2>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Button className="h-auto py-6">
              <div className="flex flex-col items-center gap-2">
                <BookOpen className="h-5 w-5" />
                <span>Create flashcard</span>
              </div>
            </Button>
            <Button variant="outline" className="h-auto py-6">
              <div className="flex flex-col items-center gap-2">
                <Play className="h-5 w-5" />
                <span>Practice pronunciation</span>
              </div>
            </Button>
          </div>
        </section>
      </main>
    </div>
  )
}
