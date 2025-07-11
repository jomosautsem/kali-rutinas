"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AuthCard } from "@/components/auth-card"
import { useToast } from "@/hooks/use-toast"

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    // Credenciales de administrador (hardcoded)
    const adminEmail = "kalicentrodeportivotemixco@gmail.com"
    const adminPassword = "1q2w3e"

    // Simulación de inicio de sesión
    // En una app real, aquí se llamaría a un servicio de autenticación.
    if (email === adminEmail && password === adminPassword) {
      // Es el administrador
      toast({
        title: "Inicio de Sesión Exitoso",
        description: "Redirigiendo al panel de administrador...",
      })
      router.push("/admin/dashboard")
    } else if (email && password) {
      // Se asume que es un cliente
      toast({
        title: "Inicio de Sesión Exitoso",
        description: "Redirigiendo a tu panel...",
      })
      router.push("/dashboard")
    } else {
      // Error
      toast({
        variant: "destructive",
        title: "Inicio de Sesión Fallido",
        description: "Correo o contraseña inválidos. Por favor, inténtalo de nuevo.",
      })
      setIsLoading(false)
    }
  }

  return (
    <AuthCard
      title="Bienvenido de Nuevo"
      description="Ingresa tus credenciales para acceder a tu cuenta."
      footer={
        <p className="text-muted-foreground">
          ¿No tienes una cuenta?{" "}
          <Link href="/register" className="font-medium text-primary hover:underline" prefetch={false}>
            Regístrate
          </Link>
        </p>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label htmlFor="email">Correo Electrónico</Label>
          <Input 
            id="email" 
            type="email" 
            placeholder="m@example.com" 
            required 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Contraseña</Label>
          <Input 
            id="password" 
            type="password" 
            required 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
        </Button>
      </form>
    </AuthCard>
  )
}
