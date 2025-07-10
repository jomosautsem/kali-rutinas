"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AuthCard } from "@/components/auth-card"

export default function RegisterPage() {
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
      <form className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">Nombre Completo</Label>
          <Input id="fullName" placeholder="John Doe" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Correo Electrónico</Label>
          <Input id="email" type="email" placeholder="m@example.com" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Contraseña</Label>
          <Input id="password" type="password" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="inviteCode">Código de Invitación</Label>
          <Input id="inviteCode" placeholder="Ingresa tu código de invitación" required />
        </div>
        <Button type="submit" className="w-full">
          Crear Cuenta
        </Button>
      </form>
    </AuthCard>
  )
}
