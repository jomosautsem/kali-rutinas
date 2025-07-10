import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, FileText, CheckCircle, ArrowRight } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function AdminDashboardPage() {
  const stats = [
    { title: "Total Users", value: "1,254", icon: Users, color: "text-blue-500" },
    { title: "Active Plans", value: "873", icon: FileText, color: "text-green-500" },
    { title: "New Users Today", value: "12", icon: Users, color: "text-purple-500" },
    { title: "Pending Approvals", value: "3", icon: CheckCircle, color: "text-yellow-500" },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Admin Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, Admin. Here&apos;s a snapshot of your system.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             <Link href="/admin/users" className="block">
              <Button variant="outline" className="w-full justify-between">
                Manage Users <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
             <Link href="/admin/templates" className="block">
              <Button variant="outline" className="w-full justify-between">
                Update Templates <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
             <Link href="/admin/status" className="block">
              <Button variant="outline" className="w-full justify-between">
                Check System Status <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Mock activity feed */}
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-2" />
              <p className="text-sm text-muted-foreground">New user 'Jane Doe' registered.</p>
              <p className="text-sm text-muted-foreground ml-auto">2 min ago</p>
            </div>
            <div className="flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              <p className="text-sm text-muted-foreground">Plan generated for 'John Smith'.</p>
              <p className="text-sm text-muted-foreground ml-auto">15 min ago</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
