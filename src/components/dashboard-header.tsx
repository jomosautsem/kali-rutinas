
"use client"

import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { LogOut, User, Home, ShieldCheck } from "lucide-react"
import { useRouter } from "next/navigation"

type DashboardHeaderProps = {
  user: {
    name: string
    email: string
    avatarUrl?: string
    role?: 'admin' | 'client'
  }
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const router = useRouter();

  const handleLogout = () => {
    // In a real app, you'd call an auth service here.
    // For now, just redirect to login.
    sessionStorage.clear();
    router.push('/login');
  }

  return (
    <>
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
            <Link href="/" aria-label="Home">
                <Home className="h-5 w-5" />
            </Link>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.avatarUrl} alt={user.name} />
                <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user.name}</p>
                <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard">
                <User className="mr-2 h-4 w-4" />
                <span>Panel</span>
              </Link>
            </DropdownMenuItem>
             {user.email === 'kalicentrodeportivotemixco@gmail.com' && (
               <DropdownMenuItem asChild>
                  <Link href="/admin/dashboard">
                    <ShieldCheck className="mr-2 h-4 w-4" />
                    <span>Panel de Admin</span>
                  </Link>
                </DropdownMenuItem>
             )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Cerrar Sesión</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  )
}
