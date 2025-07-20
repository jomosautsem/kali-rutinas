import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Server, Database, Mail } from "lucide-react"

export default function SystemStatusPage() {
  const services = [
    { name: "Servicios de API", status: "Operacional", icon: Server, color: "text-green-500" },
    { name: "Base de Datos Supabase", status: "Operacional", icon: Database, color: "text-green-500" },
    { name: "Generador de Planes AI", status: "Operacional", icon: Server, color: "text-green-500" },
    { name: "Notificaciones por Email (Resend)", status: "Operacional", icon: Mail, color: "text-green-500" },
    { name: "Servicio de Autenticación", status: "Monitoreando", icon: Server, color: "text-yellow-500" },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Estado del Sistema</h1>
        <p className="text-muted-foreground">Monitorea la salud de los servicios de tu aplicación.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Salud del Servicio</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {services.map((service) => (
              <div key={service.name} className="flex items-center justify-between p-3 rounded-lg bg-card">
                <div className="flex items-center gap-4">
                  <service.icon className="h-6 w-6 text-muted-foreground" />
                  <span className="font-medium">{service.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`h-2.5 w-2.5 rounded-full ${service.status === 'Operacional' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                  <span className={`${service.color} font-semibold text-sm`}>{service.status}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <Card>
          <CardHeader>
            <CardTitle className="font-headline">Tiempo de Respuesta de la API</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
             <img src="https://placehold.co/800x250.png" alt="Gráfico de tiempo de respuesta" data-ai-hint="server response chart" className="rounded-lg w-full" />
          </CardContent>
        </Card>
    </div>
  )
}
