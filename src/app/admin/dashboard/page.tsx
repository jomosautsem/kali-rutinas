
"use client"

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, FileText, CheckCircle, ArrowRight, UserCheck } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import type { User } from "@/lib/types";

const AdminDashboardPage = () => {
  const [stats, setStats] = useState([
    { title: "Usuarios Totales", value: "0", icon: Users, color: "text-blue-500" },
    { title: "Planes Aprobados", value: "0", icon: FileText, color: "text-green-500" },
    { title: "Planes Pendientes", value: "0", icon: CheckCircle, color: "text-yellow-500" },
    { title: "Usuarios Pendientes", value: "0", icon: UserCheck, color: "text-orange-500" },
  ]);
  const [recentActivity, setRecentActivity] = useState<User[]>([]);

  useEffect(() => {
    // In a real app, this data would be fetched from an API.
    // For this prototype, we'll use localStorage.
    if (typeof window !== 'undefined') {
      const storedUsers = localStorage.getItem("registeredUsers");
      const users: User[] = storedUsers ? JSON.parse(storedUsers) : [];

      const totalUsers = users.length;
      const approvedPlans = users.filter(u => u.planStatus === 'aprobado').length;
      const pendingPlans = users.filter(u => u.planStatus === 'pendiente').length;
      const pendingUsers = users.filter(u => u.status === 'pendiente').length;

      setStats([
        { title: "Usuarios Totales", value: totalUsers.toString(), icon: Users, color: "text-blue-500" },
        { title: "Planes Aprobados", value: approvedPlans.toString(), icon: FileText, color: "text-green-500" },
        { title: "Planes Pendientes", value: pendingPlans.toString(), icon: CheckCircle, color: "text-yellow-500" },
        { title: "Usuarios Pendientes", value: pendingUsers.toString(), icon: UserCheck, color: "text-orange-500" },
      ]);
      
      // Get the 3 most recent users who are pending
      const recentPendingUsers = users
        .filter(u => u.status === 'pendiente')
        .sort((a, b) => new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime())
        .slice(0, 3);
        
      setRecentActivity(recentPendingUsers);
    }
  }, []);

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
              {recentActivity.length > 0 ? (
                recentActivity.map(user => (
                   <div key={user.id} className="flex items-center">
                    <UserCheck className="h-4 w-4 mr-3 text-orange-500" />
                    <p className="text-sm text-muted-foreground">
                      Nuevo usuario <span className="font-semibold text-foreground">{user.name}</span> necesita aprobación.
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No hay nuevos usuarios pendientes.</p>
              )}
            </CardContent>
            </Card>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

export default AdminDashboardPage;
