import { DashboardHeader } from "@/components/dashboard-header"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // TODO: Add real authentication check here.
  // This is a placeholder for a protected route.
  // const session = await auth();
  // if (!session?.user || session.user.role !== 'client') {
  //   redirect('/login');
  // }

  const mockUser = {
    name: "Alex Johnson",
    email: "alex.j@example.com",
    avatarUrl: "https://placehold.co/100x100.png"
  }

  return (
    <div className="min-h-screen w-full flex flex-col">
       <header className="flex h-16 items-center justify-end border-b bg-card px-4 md:px-6 sticky top-0 z-40">
        <DashboardHeader user={mockUser} />
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 bg-secondary/50">
        {children}
      </main>
    </div>
  )
}
