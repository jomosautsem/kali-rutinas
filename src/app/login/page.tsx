
"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AuthCard } from "@/components/auth-card"
import { useToast } from "@/hooks/use-toast"
import type { User } from "@/components/admin/user-table-client"

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const adminEmail = "kalicentrodeportivotemixco@gmail.com"
    const adminPassword = "123321qw"

    if (email === adminEmail && password === adminPassword) {
      toast({
        title: "Inicio de Sesión Exitoso",
        description: "Redirigiendo al panel de administrador...",
      })
      sessionStorage.setItem("loggedInUser", email);
      router.push("/admin/dashboard")
      return;
    }

    try {
        const storedUsers = localStorage.getItem("registeredUsers");
        const users: User[] = storedUsers ? JSON.parse(storedUsers) : [];
        const user = users.find(u => u.email === email);

        if (user) {
            // In a real app, you would verify the password hash here
            toast({
                title: "Inicio de Sesión Exitoso",
                description: "Redirigiendo a tu panel...",
            });
            sessionStorage.setItem("loggedInUser", email);
            router.push("/dashboard");
        } else {
             toast({
                variant: "destructive",
                title: "Inicio de Sesión Fallido",
                description: "Correo o contraseña inválidos. Por favor, inténtalo de nuevo.",
            });
            setIsLoading(false);
        }

    } catch (error) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "Ocurrió un error al intentar iniciar sesión.",
        });
        setIsLoading(false);
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

    