
"use client"

import { useState, useEffect } from "react";
import { DashboardHeader } from "@/components/dashboard-header";
import type { User } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const loggedInUserEmail = sessionStorage.getItem("loggedInUser");
      if (loggedInUserEmail) {
        const storedUsers = localStorage.getItem("registeredUsers");
        const users: User[] = storedUsers ? JSON.parse(storedUsers) : [];
        const currentUser = users.find(u => u.email === loggedInUserEmail);
        
        if (currentUser) {
          setUser(currentUser);
        } else {
          // If user in session is not in our DB, clear session and redirect
          sessionStorage.clear();
          router.push('/login');
        }
      } else {
        // No user in session, redirect to login
        router.push('/login');
      }
      setLoading(false);
    }
  }, [router]);
  
  const mockUser = {
    name: "Alex Johnson",
    email: "alex.j@example.com",
    avatarUrl: "/images/avatars/avatar-01.png"
  }

  const displayUser = user || mockUser;

  if (loading || !user) {
    return (
        <div className="min-h-screen w-full flex flex-col relative">
             <div className="aurora-bg"></div>
             <header className="flex h-16 items-center justify-end border-b border-border/50 bg-card/50 backdrop-blur-sm px-4 md:px-6 sticky top-0 z-40">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-10 w-40" />
                  <Skeleton className="h-10 w-10 rounded-full" />
                </div>
            </header>
            <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 z-10">
                 <Skeleton className="h-96 w-full" />
            </main>
        </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col relative">
      <div className="aurora-bg"></div>
       <header className="flex h-16 items-center justify-end border-b border-border/50 bg-card/50 backdrop-blur-sm px-4 md:px-6 sticky top-0 z-40">
        <DashboardHeader user={displayUser} />
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 z-10">
        {children}
      </main>
    </div>
  )
}

    