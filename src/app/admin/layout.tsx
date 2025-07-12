import Link from "next/link";
import {
  Activity,
  Dumbbell,
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
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
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
    name: "Usuario Administrador",
    email: "admin@rutinaskali.com",
    avatarUrl: "https://placehold.co/100x100.png"
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2 p-2">
              <Logo className="w-12 h-12 text-primary" />
              <span className="text-lg font-bold font-headline">Rutinas Kali</span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/admin/dashboard">
                    <LayoutDashboard />
                    <span>Panel</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/admin/users">
                    <Users />
                    <span>Usuarios</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/admin/templates">
                    <FileText />
                    <span>Plantillas</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/admin/status">
                    <Activity />
                    <span>Estado del Sistema</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
             {/* Can add footer items here if needed */}
          </SidebarFooter>
        </Sidebar>
        <div className="flex flex-col w-full">
           <header className="flex h-16 items-center justify-between border-b bg-card px-4 md:px-6 sticky top-0 z-40">
                <div className="md:hidden">
                    <SidebarTrigger />
                </div>
                <div className="ml-auto flex items-center gap-4">
                  <DashboardHeader user={mockUser} />
                </div>
            </header>
          <main className="flex-1 overflow-auto p-4 md:p-8 bg-secondary/50">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
