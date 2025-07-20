
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
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
        <div
        className="absolute inset-0 z-0 opacity-20"
        style={{
          backgroundImage: `
            radial-gradient(circle at 15% 30%, hsla(var(--primary) / 0.1), transparent 30%),
            radial-gradient(circle at 85% 65%, hsla(var(--primary) / 0.1), transparent 40%)
          `,
        }}
      ></div>
      <Card className="w-full max-w-md shadow-2xl shadow-primary/10 border-border relative flex flex-col z-10 bg-card/80 backdrop-blur-sm">
        <div className="absolute top-4 right-4">
            <Button variant="ghost" size="icon" asChild>
                <Link href="/" aria-label="Home">
                    <Home className="h-5 w-5 text-muted-foreground hover:text-foreground" />
                </Link>
            </Button>
        </div>
        <CardHeader className="text-center pt-8">
          <Link href="/" className="flex justify-center mb-4">
            <Logo className="h-20 w-20 text-primary" width={80} height={80}/>
          </Link>
          <CardTitle className="text-2xl font-bold font-headline">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-2 md:px-8 flex-grow flex flex-col">
          {children}
        </CardContent>
        <CardFooter className="flex justify-center text-sm px-6 pt-4 md:px-8">
          {footer}
        </CardFooter>
      </Card>
    </div>
  )
}
