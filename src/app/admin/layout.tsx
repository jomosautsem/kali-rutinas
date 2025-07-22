
"use client"

import Link from "next/link";
import { usePathname } from 'next/navigation';
import {
  Activity,
  FileText,
  LayoutDashboard,
  Users,
} from "lucide-react";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { DashboardHeader } from "@/components/dashboard-header";
import { Logo } from "@/components/logo";
import { cn } from '@/lib/utils';

const navItems = [
    { href: "/admin/dashboard", icon: LayoutDashboard, label: "Panel" },
    { href: "/admin/users", icon: Users, label: "Usuarios" },
    { href: "/admin/templates", icon: FileText, label: "Plantillas" },
    { href: "/admin/status", icon: Activity, label: "Estado del Sistema" },
]

function AdminNav() {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();

  const handleLinkClick = () => {
    setOpenMobile(false);
  }
  
  return (
    <SidebarMenu>
      {navItems.map((item) => (
        <SidebarMenuItem key={item.href}>
            <SidebarMenuButton 
              asChild 
              tooltip={item.label} 
              isActive={pathname.startsWith(item.href)} 
              className={cn(
                "relative",
                pathname.startsWith(item.href) && "before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-2/3 before:w-1 before:bg-primary before:rounded-r-full"
              )}
            >
            <Link href={item.href} onClick={handleLinkClick}>
                <item.icon />
                <span>{item.label}</span>
            </Link>
            </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}


export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const pageTitle = navItems.find(item => pathname.startsWith(item.href))?.label || 'Admin';

  const mockUser = {
    name: "Jorge Morales",
    email: "kalicentrodeportivotemixco@gmail.com",
    avatarUrl: "/images/avatars/avatar-04.png",
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background relative">
        <div className="aurora-bg"></div>
        <Sidebar className="border-r border-border/30 bg-card/50">
          <SidebarHeader>
            <div className="flex items-center gap-2 p-2 justify-center group-data-[collapsible=icon]:justify-start">
              <Logo className="h-10 w-10 text-primary" width={40} height={40} />
              <span className="text-lg font-bold font-headline group-data-[collapsible=icon]:hidden">Dojo Dynamics</span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <AdminNav />
          </SidebarContent>
        </Sidebar>
        <div className="flex flex-col w-full z-10">
           <header className="flex h-16 items-center justify-between border-b border-border/30 bg-card/50 backdrop-blur-sm px-4 md:px-6 sticky top-0 z-40">
                <div className="flex items-center gap-4">
                  <SidebarTrigger className="md:hidden" />
                  <h1 className="text-xl font-semibold font-headline">{pageTitle}</h1>
                </div>
                <div className="ml-auto flex items-center gap-4">
                  <DashboardHeader user={mockUser} />
                </div>
            </header>
          <main className="flex-1 overflow-auto p-4 md:p-8">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
