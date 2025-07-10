"use client"

import { Dumbbell } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

type AuthCardProps = {
  title: string
  description: string
  children: React.ReactNode
  footer: React.ReactNode
}

export function AuthCard({ title, description, children, footer }: AuthCardProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <Dumbbell className="mx-auto h-10 w-10 text-primary" />
          <CardTitle className="mt-4 text-2xl font-bold font-headline">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          {children}
        </CardContent>
        <CardFooter className="flex justify-center text-sm">
          {footer}
        </CardFooter>
      </Card>
    </div>
  )
}
