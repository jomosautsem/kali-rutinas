

"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AuthCard } from "@/components/auth-card"
import { useToast } from "@/hooks/use-toast"
import type { User } from "@/lib/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { KeyRound } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [inviteCode, setInviteCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    // Clear previous session data
    if (typeof window !== 'undefined') {
      sessionStorage.clear();
    }

    const adminEmail = "kalicentrodeportivotemixco@gmail.com"
    const adminPassword = "1q2w3e12"
    
    // Check for admin credentials first
    if (email === adminEmail && password === adminPassword) {
      toast({
        title: "Inicio de Sesión Exitoso",
        description: "Redirigiendo al panel de administrador...",
      })
      sessionStorage.setItem("loggedInUser", email);
      router.push("/admin/dashboard")
      return; // Stop execution here for admin
    }

    // If not admin, proceed with client login logic
    try {
        const storedUsers = localStorage.getItem("registeredUsers");
        const users: User[] = storedUsers ? JSON.parse(storedUsers) : [];
        const user = users.find(u => u.email === email);

        if (user) {
            if (user.status === 'pendiente') {
                toast({
                    variant: "destructive",
                    title: "Cuenta Pendiente",
                    description: "Tu cuenta aún no ha sido aprobada por un administrador.",
                });
                setIsLoading(false);
                return;
            }
            
            // In a real app, you would verify the password hash here
            
            if (user.inviteCode !== inviteCode) {
                 toast({
                    variant: "destructive",
                    title: "KaliCodigo Inválido",
                    description: "Por favor, verifica tu KaliCodigo.",
                });
                setIsLoading(false);
                return;
            }
            
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
        <div className="space-y-2">
            <Label htmlFor="inviteCode">KaliCodigo</Label>
            <Input 
                id="inviteCode" 
                placeholder="Ingresa tu código único" 
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                disabled={isLoading}
            />
        </div>
        <Alert className="border-primary/30 bg-primary/10">
          <KeyRound className="h-5 w-5 text-primary" />
          <AlertTitle className="font-semibold text-primary/90">¿No tienes tu KaliCodigo?</AlertTitle>
          <AlertDescription className="text-foreground/80">
            Solicítalo en recepción o a través de nuestro WhatsApp para activar tu cuenta.
          </AlertDescription>
        </Alert>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
        </Button>
      </form>
    </AuthCard>
  )
}
