
"use client"

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, FileText, CheckCircle, ArrowRight, UserCheck } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import type { User } from "@/lib/types";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { ChartContainer } from "@/components/ui/chart";

const AdminDashboardPage = () => {
  const [stats, setStats] = useState([
    { title: "Usuarios Totales", value: "0", icon: Users, color: "text-blue-400" },
    { title: "Planes Aprobados", value: "0", icon: FileText, color: "text-green-400" },
    { title: "Planes Pendientes", value: "0", icon: CheckCircle, color: "text-yellow-400" },
    { title: "Usuarios Pendientes", value: "0", icon: UserCheck, color: "text-orange-400" },
  ]);
  const [recentActivity, setRecentActivity] = useState<User[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUsers = localStorage.getItem("registeredUsers");
      const users: User[] = storedUsers ? JSON.parse(storedUsers) : [];

      const totalUsers = users.length;
      const approvedPlans = users.filter(u => u.planStatus === 'aprobado').length;
      const pendingPlans = users.filter(u => u.planStatus === 'pendiente').length;
      const pendingUsers = users.filter(u => u.status === 'pendiente').length;

      setStats([
        { title: "Usuarios Totales", value: totalUsers.toString(), icon: Users, color: "text-blue-400" },
        { title: "Planes Aprobados", value: approvedPlans.toString(), icon: FileText, color: "text-green-400" },
        { title: "Planes Pendientes", value: pendingPlans.toString(), icon: CheckCircle, color: "text-yellow-400" },
        { title: "Usuarios Pendientes", value: pendingUsers.toString(), icon: UserCheck, color: "text-orange-400" },
      ]);
      
      const recentPendingUsers = users
        .filter(u => u.status === 'pendiente')
        .sort((a, b) => new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime())
        .slice(0, 5);
        
      setRecentActivity(recentPendingUsers);
      
      const activeUsers = users.filter(u => u.status === 'activo').length;
      setChartData([
        { name: "Totales", value: totalUsers },
        { name: "Activos", value: activeUsers },
        { name: "Pendientes", value: pendingUsers }
      ]);
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
      <motion.div 
        variants={containerVariants}
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
      >
        {stats.map((stat) => (
          <motion.div variants={itemVariants} key={stat.title}>
            <Card className="bg-gradient-to-br from-card to-secondary/30 border-border/50 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <motion.div 
        variants={containerVariants}
        className="grid gap-8 md:grid-cols-3"
      >
        <motion.div variants={itemVariants} className="md:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Resumen de Usuarios</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px] w-full">
                    <ChartContainer config={{
                        users: {
                            label: "Usuarios",
                            color: "hsl(var(--primary))",
                        }
                    }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 20, right: 20, left: -10, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" tickLine={false} axisLine={false} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                                <YAxis tickLine={false} axisLine={false} stroke="hsl(var(--muted-foreground))" fontSize={12} allowDecimals={false} />
                                <Tooltip cursor={{fill: 'hsl(var(--card))'}} contentStyle={{
                                    backgroundColor: 'hsl(var(--background))',
                                    border: '1px solid hsl(var(--border))'
                                }}/>
                                <Bar dataKey="value" name="Usuarios" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </CardContent>
            </Card>
        </motion.div>
        <motion.div variants={itemVariants}>
            <Card className="h-full">
            <CardHeader>
                <CardTitle className="font-headline">Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <Link href="/admin/users" className="block">
                <Button variant="outline" className="w-full justify-between hover:border-primary">
                    Gestionar Usuarios <ArrowRight />
                </Button>
                </Link>
                <Link href="/admin/templates" className="block">
                <Button variant="outline" className="w-full justify-between hover:border-primary">
                    Actualizar Plantillas <ArrowRight />
                </Button>
                </Link>
                <Link href="/admin/status" className="block">
                <Button variant="outline" className="w-full justify-between hover:border-primary">
                    Verificar Estado del Sistema <ArrowRight />
                </Button>
                </Link>
            </CardContent>
            </Card>
        </motion.div>
      </motion.div>
      
       <motion.div variants={itemVariants}>
            <Card>
            <CardHeader>
                <CardTitle className="font-headline">Nuevas Aprobaciones Pendientes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentActivity.length > 0 ? (
                recentActivity.map(user => (
                   <div key={user.id} className="flex items-center p-3 rounded-md bg-secondary/30">
                    <UserCheck className="h-5 w-5 mr-4 text-orange-400" />
                    <p className="text-sm text-muted-foreground">
                      Nuevo usuario <span className="font-semibold text-foreground">{user.name}</span> necesita aprobación.
                    </p>
                    <Link href="/admin/users" className="ml-auto">
                        <Button size="sm" variant="secondary">Revisar</Button>
                    </Link>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No hay nuevos usuarios pendientes.</p>
              )}
            </CardContent>
            </Card>
        </motion.div>
    </motion.div>
  )
}

export default AdminDashboardPage;
