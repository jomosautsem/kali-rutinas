import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Server, Database, Mail } from "lucide-react"

export default function SystemStatusPage() {
  const services = [
    { name: "API Services", status: "Operational", icon: Server, color: "text-green-500" },
    { name: "Supabase Database", status: "Operational", icon: Database, color: "text-green-500" },
    { name: "AI Plan Generator", status: "Operational", icon: Server, color: "text-green-500" },
    { name: "Email Notifications (Resend)", status: "Operational", icon: Mail, color: "text-green-500" },
    { name: "Authentication Service", status: "Monitoring", icon: Server, color: "text-yellow-500" },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">System Status</h1>
        <p className="text-muted-foreground">Monitor the health of your application's services.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Service Health</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {services.map((service, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-secondary">
                <div className="flex items-center gap-4">
                  <service.icon className="h-6 w-6 text-muted-foreground" />
                  <span className="font-medium">{service.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`h-2.5 w-2.5 rounded-full ${service.status === 'Operational' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                  <span className={`${service.color} font-semibold text-sm`}>{service.status}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <Card>
          <CardHeader>
            <CardTitle className="font-headline">Response Time</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
             <img src="https://placehold.co/800x250.png" alt="Response time chart" data-ai-hint="server response chart" className="rounded-lg w-full" />
          </CardContent>
        </Card>
    </div>
  )
}
