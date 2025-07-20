
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

export default function RegisterPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [firstName, setFirstName] = useState("")
  const [paternalLastName, setPaternalLastName] = useState("")
  const [maternalLastName, setMaternalLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Las contraseñas no coinciden",
        description: "Por favor, verifica que ambas contraseñas sean iguales.",
      })
      setIsLoading(false)
      return
    }

    try {
      const storedUsers = localStorage.getItem("registeredUsers")
      const users: User[] = storedUsers ? JSON.parse(storedUsers) : []

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
        id: `user-${email}-${Date.now()}`,
        firstName,
        paternalLastName,
        maternalLastName,
        name: `${firstName} ${paternalLastName} ${maternalLastName}`.trim(),
        email: email,
        role: "client",
        status: "pendiente", // New users start as pending
        registeredAt: new Date().toISOString().split("T")[0],
        planStatus: "sin-plan",
      }

      const updatedUsers = [...users, newUser]
      localStorage.setItem("registeredUsers", JSON.stringify(updatedUsers))
      sessionStorage.setItem("onboardingUserEmail", email);

      toast({
        title: "Registro Exitoso",
        description: "Ahora, cuéntanos un poco sobre tus metas.",
      })
      router.push("/onboarding")

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
      description="Completa los detalles a continuación para unirte a Dojo Dynamics."
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
          <Label htmlFor="firstName">Nombre(s)</Label>
          <Input 
            id="firstName" 
            placeholder="Juan" 
            required 
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            disabled={isLoading}
          />
        </div>
         <div className="space-y-2">
          <Label htmlFor="paternalLastName">Apellido Paterno</Label>
          <Input 
            id="paternalLastName" 
            placeholder="Pérez" 
            required 
            value={paternalLastName}
            onChange={(e) => setPaternalLastName(e.target.value)}
            disabled={isLoading}
          />
        </div>
         <div className="space-y-2">
          <Label htmlFor="maternalLastName">Apellido Materno</Label>
          <Input 
            id="maternalLastName" 
            placeholder="García" 
            required 
            value={maternalLastName}
            onChange={(e) => setMaternalLastName(e.target.value)}
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
          <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
          <Input 
            id="confirmPassword" 
            type="password" 
            required 
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Creando cuenta..." : "Crear Cuenta y Continuar"}
        </Button>
      </form>
    </AuthCard>
  )
}
