
"use client"

import { useState, useEffect } from "react";
import { DashboardHeader } from "@/components/dashboard-header";
import type { User } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, you'd get this from a proper session/auth context.
    // This is a placeholder for a protected route.
    if (typeof window !== 'undefined') {
      const loggedInUserEmail = sessionStorage.getItem("loggedInUser");
      const storedUsers = localStorage.getItem("registeredUsers");
      if (loggedInUserEmail && storedUsers) {
        const users: User[] = JSON.parse(storedUsers);
        const currentUser = users.find(u => u.email === loggedInUserEmail);
        if (currentUser) {
          setUser(currentUser);
        }
      }
    }
    setLoading(false);
  }, []);
  
  const mockUser = {
    name: "Alex Johnson",
    email: "alex.j@example.com",
    avatarUrl: "/images/avatars/avatar-01.png"
  }

  const displayUser = user || mockUser;

  return (
    <div className="min-h-screen w-full flex flex-col">
       <header className="flex h-16 items-center justify-end border-b bg-card/50 backdrop-blur-sm px-4 md:px-6 sticky top-0 z-40">
        {loading ? (
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
            </div>
        ) : (
          <DashboardHeader user={displayUser} />
        )}
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 bg-background">
        {children}
      </main>
    </div>
  )
}
