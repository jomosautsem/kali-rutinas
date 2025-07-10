"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AuthCard } from "@/components/auth-card"

export default function RegisterPage() {
  return (
    <AuthCard
      title="Create an Account"
      description="Fill in the details below to join Dojo Dynamics."
      footer={
        <p className="text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline" prefetch={false}>
            Login
          </Link>
        </p>
      }
    >
      <form className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name</Label>
          <Input id="fullName" placeholder="John Doe" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="m@example.com" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="inviteCode">Invite Code</Label>
          <Input id="inviteCode" placeholder="Enter your invite code" required />
        </div>
        <Button type="submit" className="w-full">
          Create Account
        </Button>
      </form>
    </AuthCard>
  )
}
