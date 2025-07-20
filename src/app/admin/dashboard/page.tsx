
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, FileText, CheckCircle, ArrowRight } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

export default function AdminDashboardPage() {
  const stats = [
    { title: "Usuarios Totales", value: "1,254", icon: Users, color: "text-blue-500" },
    { title: "Planes Activos", value: "873", icon: FileText, color: "text-green-500" },
    { title: "Nuevos Usuarios Hoy", value: "12", icon: Users, color: "text-primary" },
    { title: "Aprobaciones Pendientes", value: "3", icon: CheckCircle, color: "text-yellow-500" },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
      },
    },
  };


  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-bold font-headline">Panel de Administrador</h1>
        <p className="text-muted-foreground">Bienvenido de nuevo, Admin. Aquí tienes un resumen de tu sistema.</p>
      </motion.div>

      <motion.div 
        variants={containerVariants}
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
      >
        {stats.map((stat) => (
          <motion.div variants={itemVariants} key={stat.title}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <motion.div 
        variants={containerVariants}
        className="grid gap-6 md:grid-cols-2"
      >
        <motion.div variants={itemVariants}>
            <Card>
            <CardHeader>
                <CardTitle className="font-headline">Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <Link href="/admin/users" className="block">
                <Button variant="outline" className="w-full justify-between">
                    Gestionar Usuarios <ArrowRight className="h-4 w-4" />
                </Button>
                </Link>
                <Link href="/admin/templates" className="block">
                <Button variant="outline" className="w-full justify-between">
                    Actualizar Plantillas <ArrowRight className="h-4 w-4" />
                </Button>
                </Link>
                <Link href="/admin/status" className="block">
                <Button variant="outline" className="w-full justify-between">
                    Verificar Estado del Sistema <ArrowRight className="h-4 w-4" />
                </Button>
                </Link>
            </CardContent>
            </Card>
        </motion.div>
        <motion.div variants={itemVariants}>
            <Card>
            <CardHeader>
                <CardTitle className="font-headline">Actividad Reciente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Mock activity feed */}
                <div className="flex items-center">
                <Users className="h-4 w-4 mr-2" />
                <p className="text-sm text-muted-foreground">Nuevo usuario 'Jane Doe' registrado.</p>
                <p className="text-sm text-muted-foreground ml-auto">hace 2 min</p>
                </div>
                <div className="flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                <p className="text-sm text-muted-foreground">Plan generado para 'John Smith'.</p>
                <p className="text-sm text-muted-foreground ml-auto">hace 15 min</p>
                </div>
                <div className="flex items-center">
                <CheckCircle className="h-4 w-4 mr-2 text-yellow-500" />
                <p className="text-sm text-muted-foreground">Plan de 'Charlie Brown' necesita aprobación.</p>
                <p className="text-sm text-muted-foreground ml-auto">hace 30 min</p>
                </div>
            </CardContent>
            </Card>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
