
import '@/ai/genkit';
import Link from "next/link";
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
} from "@/components/ui/sidebar";
import { DashboardHeader } from "@/components/dashboard-header";
import { Logo } from "@/components/logo";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // TODO: Add real authentication check here.
  // This is a placeholder for a protected route.
  // const session = await auth();
  // if (!session?.user || session.user.role !== 'admin') {
  //   redirect('/login');
  // }
  
  const mockUser = {
    name: "Admin User",
    email: "kalicentrodeportivotemixco@gmail.com",
    avatarUrl: "/images/avatars/avatar-04.png",
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background relative">
        <div className="aurora-bg"></div>
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2 p-2 justify-center group-data-[collapsible=icon]:justify-start">
              <Logo className="h-10 w-10 text-primary" width={40} height={40} />
              <span className="text-lg font-bold font-headline group-data-[collapsible=icon]:hidden">Dojo Dynamics</span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Panel">
                  <Link href="/admin/dashboard">
                    <LayoutDashboard />
                    <span>Panel</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Usuarios">
                  <Link href="/admin/users">
                    <Users />
                    <span>Usuarios</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Plantillas">
                  <Link href="/admin/templates">
                    <FileText />
                    <span>Plantillas</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Estado del Sistema">
                  <Link href="/admin/status">
                    <Activity />
                    <span>Estado del Sistema</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
        <div className="flex flex-col w-full z-10">
           <header className="flex h-16 items-center justify-between border-b border-border/50 bg-card/50 backdrop-blur-sm px-4 md:px-6 sticky top-0 z-40">
                <div className="md:hidden">
                    <SidebarTrigger />
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
