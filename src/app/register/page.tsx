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

export default function RegisterPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [inviteCode, setInviteCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate saving the new user to our mock database (localStorage)
    try {
      const storedUsers = localStorage.getItem("registeredUsers")
      const users: User[] = storedUsers ? JSON.parse(storedUsers) : []

      // Check if user already exists
      if (users.some(user => user.email === email)) {
        toast({
          variant: "destructive",
          title: "Error de Registro",
          description: "Este correo electrónico ya ha sido registrado.",
        })
        setIsLoading(false)
        return
      }

      const newUser: User = {
        id: (users.length + 1).toString(),
        name: fullName,
        email: email,
        // password should be hashed and not stored, but this is a prototype
        role: "client",
        status: "activo",
        registeredAt: new Date().toISOString().split("T")[0],
        planStatus: "sin-plan",
      }

      const updatedUsers = [...users, newUser]
      localStorage.setItem("registeredUsers", JSON.stringify(updatedUsers))

      toast({
        title: "Cuenta Creada Exitosamente",
        description: "Ahora puedes iniciar sesión con tus credenciales.",
      })
      router.push("/login")

    } catch (error) {
      console.error("Registration failed:", error)
      toast({
        variant: "destructive",
        title: "Error de Registro",
        description: "No se pudo crear la cuenta. Por favor, inténtalo de nuevo.",
      })
      setIsLoading(false)
    }
  }

  return (
    <AuthCard
      title="Crear una Cuenta"
      description="Completa los detalles a continuación para unirte a Rutinas Kali."
      footer={
        <p className="text-muted-foreground">
          ¿Ya tienes una cuenta?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline" prefetch={false}>
            Iniciar Sesión
          </Link>
        </p>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label htmlFor="fullName">Nombre Completo</Label>
          <Input 
            id="fullName" 
            placeholder="John Doe" 
            required 
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            disabled={isLoading}
          />
        </div>
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
          <Label htmlFor="inviteCode">Código de Invitación</Label>
          <Input 
            id="inviteCode" 
            placeholder="Ingresa tu código de invitación" 
            required 
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Creando cuenta..." : "Crear Cuenta"}
        </Button>
      </form>
    </AuthCard>
  )
}
