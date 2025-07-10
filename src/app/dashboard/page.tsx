import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PlanGenerator } from "@/components/plan-generator"
import { CheckCircle, Dumbbell } from "lucide-react"

export default function DashboardPage() {
  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold font-headline">Your Dashboard</h1>
        <PlanGenerator />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className="font-headline">Your Weekly Plan</CardTitle>
            <CardDescription>This is your personalized training schedule for the week.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="space-y-6">
              {/* This is mock data. In a real app, you'd fetch this. */}
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center gap-1">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Dumbbell className="h-5 w-5" />
                  </div>
                  <div className="h-full w-px bg-border" />
                </div>
                <div>
                  <h3 className="font-semibold">Day 1: Upper Body Strength</h3>
                  <p className="text-sm text-muted-foreground">Focus on chest, shoulders, and triceps.</p>
                  <ul className="mt-2 list-disc pl-5 text-sm space-y-1">
                    <li>Bench Press: 4 sets of 8-12 reps</li>
                    <li>Overhead Press: 3 sets of 10-15 reps</li>
                    <li>Tricep Dips: 3 sets to failure</li>
                  </ul>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center gap-1">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/80 text-primary-foreground">
                    <Dumbbell className="h-5 w-5" />
                  </div>
                   <div className="h-full w-px bg-border" />
                </div>
                <div>
                  <h3 className="font-semibold">Day 2: Lower Body & Core</h3>
                  <p className="text-sm text-muted-foreground">Build power in your legs and stabilize your core.</p>
                   <ul className="mt-2 list-disc pl-5 text-sm space-y-1">
                    <li>Squats: 4 sets of 8-12 reps</li>
                    <li>Deadlifts: 3 sets of 6-8 reps</li>
                    <li>Plank: 3 sets, 60 seconds hold</li>
                  </ul>
                </div>
              </div>
               <div className="flex items-start gap-4">
                 <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                    <CheckCircle className="h-5 w-5" />
                  </div>
                <div>
                  <h3 className="font-semibold">Day 3: Rest & Recovery</h3>
                  <p className="text-sm text-muted-foreground">Active recovery and stretching.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="font-headline">Progress Overview</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-5/6">
             <img src="https://placehold.co/400x300.png" alt="Progress chart" data-ai-hint="fitness chart" className="rounded-lg" />
          </CardContent>
        </Card>
      </div>
    </>
  )
}
