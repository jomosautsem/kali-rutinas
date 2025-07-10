"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { generatePersonalizedTrainingPlan } from "@/ai/flows/generate-personalized-training-plan"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Sparkles } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "./ui/skeleton"

const formSchema = z.object({
  goals: z.string().min(10, "Please describe your goals in more detail."),
  currentFitnessLevel: z.enum(["beginner", "intermediate", "advanced"]),
  daysPerWeek: z.coerce.number().min(1).max(7),
  preferredWorkoutStyle: z.string().min(3, "Please specify a workout style."),
})

export function PlanGenerator() {
  const [isOpen, setIsOpen] = useState(false)
  const [generatedPlan, setGeneratedPlan] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      goals: "",
      currentFitnessLevel: "beginner",
      daysPerWeek: 3,
      preferredWorkoutStyle: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    setGeneratedPlan("")
    try {
      const result = await generatePersonalizedTrainingPlan(values)
      setGeneratedPlan(result.plan)
    } catch (error) {
      console.error("Failed to generate plan:", error)
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: "Could not generate a plan. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (!open) {
      form.reset()
      setGeneratedPlan("")
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Sparkles className="mr-2 h-4 w-4" />
          Generate New Plan
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle className="font-headline">Create Your Personalized Plan</DialogTitle>
          <DialogDescription>
            Provide your details and let our AI craft the perfect workout plan for you.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="goals"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fitness Goals</FormLabel>
                    <FormControl>
                      <Textarea placeholder="e.g., lose 10 pounds, build muscle" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="currentFitnessLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fitness Level</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your fitness level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="daysPerWeek"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Days per week</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" max="7" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="preferredWorkoutStyle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferred Workout Style</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Weightlifting, Cardio, HIIT" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? "Generating..." : "Generate Plan"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
          <div className="rounded-lg border bg-secondary p-4 space-y-2 overflow-auto max-h-[500px]">
            <h3 className="font-semibold font-headline">Your AI-Generated Plan</h3>
            {isLoading ? (
               <div className="space-y-3">
                 <Skeleton className="h-4 w-3/4" />
                 <Skeleton className="h-4 w-1/2" />
                 <Skeleton className="h-4 w-full" />
                 <Skeleton className="h-4 w-5/6" />
               </div>
            ) : generatedPlan ? (
              <div className="text-sm whitespace-pre-wrap">{generatedPlan}</div>
            ) : (
              <div className="text-sm text-muted-foreground flex items-center justify-center h-full">
                Your plan will appear here...
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
