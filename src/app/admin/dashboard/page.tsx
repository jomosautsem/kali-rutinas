
"use client"

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, FileText, CheckCircle, ArrowRight, UserCheck, Sparkles, AlertCircle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import type { User } from "@/lib/types";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { ChartContainer } from "@/components/ui/chart";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type PendingTask = {
    id: string;
    type: 'approveUser' | 'customPlan' | 'reviewPlan';
    title: string;
    description: string;
    icon: React.ElementType;
    color: string;
    user: User;
}

const AdminDashboardPage = () => {
  const [stats, setStats] = useState([
    { title: "Usuarios Totales", value: "0", icon: Users, color: "text-blue-400" },
    { title: "Planes Aprobados", value: "0", icon: FileText, color: "text-green-400" },
    { title: "Planes Pendientes", value: "0", icon: CheckCircle, color: "text-yellow-400" },
    { title: "Usuarios Pendientes", value: "0", icon: UserCheck, color: "text-orange-400" },
  ]);
  const [pendingTasks, setPendingTasks] = useState<PendingTask[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const { toast } = useToast();

  const loadDashboardData = () => {
    if (typeof window !== 'undefined') {
      const storedUsers = localStorage.getItem("registeredUsers");
      const users: User[] = storedUsers ? JSON.parse(storedUsers) : [];

      const totalUsers = users.length;
      const approvedPlans = users.filter(u => u.planStatus === 'aprobado').length;
      const pendingPlans = users.filter(u => u.planStatus === 'pendiente').length;
      const pendingUsersCount = users.filter(u => u.status === 'pendiente').length;

      setStats([
        { title: "Usuarios Totales", value: totalUsers.toString(), icon: Users, color: "text-blue-400" },
        { title: "Planes Aprobados", value: approvedPlans.toString(), icon: FileText, color: "text-green-400" },
        { title: "Planes Pendientes", value: pendingPlans.toString(), icon: CheckCircle, color: "text-yellow-400" },
        { title: "Usuarios Pendientes", value: pendingUsersCount.toString(), icon: UserCheck, color: "text-orange-400" },
      ]);
      
      const activeUsers = users.filter(u => u.status === 'activo').length;
      setChartData([
        { name: "Totales", value: totalUsers },
        { name: "Activos", value: activeUsers },
        { name: "Pendientes", value: pendingUsersCount }
      ]);
      
      const tasks: PendingTask[] = [];
      users.forEach(user => {
          if (user.status === 'pendiente') {
              tasks.push({
                  id: `approve-${user.id}`,
                  type: 'approveUser',
                  title: 'Aprobar nuevo usuario',
                  description: `El usuario ${user.name} se ha registrado y necesita aprobación.`,
                  icon: UserCheck,
                  color: "text-orange-400",
                  user: user,
              });
          }
          if (user.customPlanRequest === 'requested') {
              tasks.push({
                  id: `custom-${user.id}`,
                  type: 'customPlan',
                  title: 'Rutina personalizada solicitada',
                  description: `${user.name} ha solicitado una rutina totalmente personalizada.`,
                  icon: Sparkles,
                  color: "text-blue-400",
                  user: user,
              });
          }
          if (user.planStatus === 'pendiente') {
              tasks.push({
                  id: `review-${user.id}`,
                  type: 'reviewPlan',
                  title: 'Revisar plan generado',
                  description: `Se ha generado un plan con IA para ${user.name} que requiere tu revisión.`,
                  icon: FileText,
                  color: "text-yellow-400",
                  user: user,
              });
          }
      });
      setPendingTasks(tasks);
    }
  };

  useEffect(() => {
    loadDashboardData();

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'registeredUsers') {
        loadDashboardData();
        toast({
            title: "Datos Actualizados",
            description: "La lista de usuarios ha cambiado."
        });
      }
    };
    
    window.addEventListener('storage', handleStorageChange);

    return () => {
        window.removeEventListener('storage', handleStorageChange);
    };

  }, [toast]);

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

       <motion.div variants={itemVariants}>
            <Card>
            <CardHeader>
                <CardTitle className="font-headline">Lista de Tareas Pendientes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {pendingTasks.length > 0 ? (
                pendingTasks.map(task => (
                   <div key={task.id} className="flex items-center p-3 rounded-md bg-secondary/30">
                    <task.icon className={cn("h-6 w-6 mr-4", task.color)} />
                    <div className="flex-grow">
                        <p className="font-semibold">{task.title}</p>
                        <p className="text-sm text-muted-foreground">{task.description}</p>
                    </div>
                    <Link href="/admin/users" className="ml-auto">
                        <Button size="sm" variant="secondary">Revisar</Button>
                    </Link>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center text-center py-8 text-muted-foreground">
                    <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                    <p className="font-semibold">¡Todo al día!</p>
                    <p className="text-sm">No tienes tareas pendientes por el momento.</p>
                </div>
              )}
            </CardContent>
            </Card>
        </motion.div>

      <motion.div 
        variants={containerVariants}
        className="grid gap-8 grid-cols-1 xl:grid-cols-3"
      >
        <motion.div variants={itemVariants} className="xl:col-span-2">
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
                    Gestionar Plantillas <ArrowRight />
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
      
    </motion.div>
  )
}

export default AdminDashboardPage;
