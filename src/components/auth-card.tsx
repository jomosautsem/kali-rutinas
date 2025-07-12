"use client"

import { Home } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "./ui/button"
import Link from "next/link"
import { Logo } from "./logo"

type AuthCardProps = {
  title: string
  description: string
  children: React.ReactNode
  footer: React.ReactNode
}

export function AuthCard({ title, description, children, footer }: AuthCardProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md shadow-lg border-primary/20 relative">
        <div className="absolute top-4 right-4">
            <Button variant="outline" size="icon" asChild>
                <Link href="/" aria-label="Home">
                    <Home className="h-5 w-5" />
                </Link>
            </Button>
        </div>
        <CardHeader className="text-center pt-12">
           <Logo className="mx-auto h-24 w-24 text-primary" width={96} height={96} />
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
