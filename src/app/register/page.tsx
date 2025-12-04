
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { createClient } from '@supabase/supabase-js'
import { Loader2, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { AuthCard } from "@/components/auth-card"
import { Button } from "@/components/ui/button"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import Link from "next/link"

// Schema for the simplified registration form
const simpleRegisterSchema = z.object({
  firstName: z.string().min(2, "El nombre es requerido."),
  paternalLastName: z.string().min(2, "El apellido paterno es requerido."),
  maternalLastName: z.string().min(2, "El apellido materno es requerido."),
  email: z.string().email("Por favor, ingresa un correo electrónico válido."),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres."),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
});

type RegistrationFormValues = z.infer<typeof simpleRegisterSchema>;

// Create a Supabase client for client-side operations
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function RegisterPage() {
  const router = useRouter()
  const { toast } = useToast()
  
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  
  const form = useForm<RegistrationFormValues>({
    resolver: zodResolver(simpleRegisterSchema),
    defaultValues: {
      firstName: "",
      paternalLastName: "",
      maternalLastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  async function onSubmit(values: RegistrationFormValues) {
    setIsLoading(true);
    console.log("Executing CLIENT-SIDE Supabase signUp...");

    try {
        const { firstName, paternalLastName, maternalLastName, email, password } = values;

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                // Pass user names as metadata for the trigger to use
                data: {
                    firstName,
                    paternalLastName,
                    maternalLastName,
                }
            }
        });

        if (error) {
            console.error("Supabase client-side signUp failed:", error);
            if (error.message.includes("User already registered")) {
                throw new Error("Este correo electrónico ya ha sido registrado.");
            }
            throw new Error(error.message || "No se pudo crear la cuenta.");
        }

        if (!data.user) {
           throw new Error("El registro no devolvió un usuario. Por favor, intenta de nuevo.");
        }

        console.log("Supabase signUp successful. The trigger will handle profile creation.");
        
        setIsSuccess(true);
        toast({ 
            title: "¡Registro Completo!", 
            description: "Hemos enviado un enlace de confirmación a tu correo. Por favor, verifica tu bandeja de entrada."
        });

    } catch (error: any) {
        toast({ 
            variant: "destructive", 
            title: "Error en el Registro", 
            description: error.message
        });
    } finally {
        setIsLoading(false);
    }
  }

  if (isSuccess) {
    return (
      <AuthCard 
        title="¡Revisa tu correo!"
        description="Hemos enviado un enlace para verificar tu cuenta."
        footer={<Link href="/login" className="w-full" prefetch={false}><Button variant="outline" className="w-full">Volver a Iniciar Sesión</Button></Link>}
      >
        <div className="text-center space-y-4 py-8">
            <CheckCircle className="h-16 w-16 mx-auto text-green-500" />
            <p className="text-muted-foreground">Una vez que verifiques tu correo, podrás iniciar sesión y se te asignará tu Kalicódigo de usuario.</p>
        </div>
      </AuthCard>
    )
  }

  return (
    <AuthCard
      title="Crea tu Cuenta"
      description="Regístrate para obtener acceso a la plataforma."
      footer={
        <p className="text-sm text-muted-foreground">
          ¿Ya tienes una cuenta?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline" prefetch={false}>
            Inicia Sesión
          </Link>
        </p>
      }
    >
       <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="firstName" render={({ field }) => (
                <FormItem><FormLabel>Nombre(s)</FormLabel><FormControl><Input placeholder="Juan" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField control={form.control} name="paternalLastName" render={({ field }) => (
                    <FormItem><FormLabel>Apellido Paterno</FormLabel><FormControl><Input placeholder="Pérez" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="maternalLastName" render={({ field }) => (
                    <FormItem><FormLabel>Apellido Materno</FormLabel><FormControl><Input placeholder="García" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
            </div>
            <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem><FormLabel>Correo Electrónico</FormLabel><FormControl><Input type="email" placeholder="m@example.com" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="password" render={({ field }) => (
                <FormItem><FormLabel>Contraseña</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                <FormItem><FormLabel>Confirmar Contraseña</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>
            )} />

            <Button type="submit" className="w-full !mt-6" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Crear Cuenta
            </Button>
        </form>
       </FormProvider>
    </AuthCard>
  )
}
