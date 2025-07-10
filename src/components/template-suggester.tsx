"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { generateTemplateSuggestions } from "@/ai/flows/generate-template-suggestions"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Sparkles } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Skeleton } from "./ui/skeleton"

const formSchema = z.object({
  userFeedback: z.string().min(10, "Please provide more detailed feedback."),
  commonRequests: z.string().min(10, "Please provide more detailed requests."),
})

export function TemplateSuggester() {
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userFeedback: "Some users find the beginner plans too easy after a few weeks.",
      commonRequests: "More HIIT and bodyweight-only templates are frequently requested.",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    setSuggestions([])
    try {
      const result = await generateTemplateSuggestions(values)
      setSuggestions(result.templateSuggestions)
    } catch (error) {
      console.error("Failed to generate suggestions:", error)
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: "Could not generate suggestions. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
     <div className="grid md:grid-cols-2 gap-8">
        <Card className="shadow-none border-0 md:border md:shadow-sm">
            <CardHeader>
                <CardTitle className="font-headline">Generate Template Ideas</CardTitle>
            </CardHeader>
            <CardContent>
                 <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                        control={form.control}
                        name="userFeedback"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>User Feedback</FormLabel>
                            <FormControl>
                            <Textarea placeholder="Enter user feedback..." {...field} rows={4}/>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="commonRequests"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Common Requests</FormLabel>
                            <FormControl>
                            <Textarea placeholder="Enter common requests..." {...field} rows={4}/>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <Button type="submit" disabled={isLoading}>
                        <Sparkles className="mr-2 h-4 w-4" />
                        {isLoading ? "Generating..." : "Generate Suggestions"}
                    </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
        <div className="rounded-lg border bg-card p-6">
            <h3 className="font-semibold mb-4 font-headline">AI-Generated Suggestions</h3>
             {isLoading ? (
               <div className="space-y-4">
                 <Skeleton className="h-8 w-full" />
                 <Skeleton className="h-8 w-5/6" />
                 <Skeleton className="h-8 w-full" />
               </div>
            ) : suggestions.length > 0 ? (
              <ul className="space-y-3">
                {suggestions.map((s, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Sparkles className="h-4 w-4 mt-1 text-accent flex-shrink-0" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-sm text-muted-foreground flex items-center justify-center h-full">
                Suggestions will appear here...
              </div>
            )}
        </div>
     </div>
  )
}
