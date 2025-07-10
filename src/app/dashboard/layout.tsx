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
      <DashboardHeader user={mockUser} />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        {children}
      </main>
    </div>
  )
}
