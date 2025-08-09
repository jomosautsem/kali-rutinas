
"use client"

import { useEffect, useState, useCallback } from "react"
import { UserTableClient } from "@/components/admin/user-table-client"
import type { User, UserPlan } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import type { Template } from "@/app/admin/templates/page";
import { getAllUsers, updateUser, deleteUser } from "@/services/user.service";
import { assignPlanToUser, getActivePlanForUser, getAllProgressForUser } from "@/services/plan.service";

const TEMPLATES_STORAGE_KEY = "trainingTemplates";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const dbUsers = await getAllUsers();
      setUsers(dbUsers);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "No se pudieron cargar los usuarios." });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchUsers();
    // Load templates from localStorage (can be migrated later)
    if (typeof window !== 'undefined') {
      const storedTemplates = localStorage.getItem(TEMPLATES_STORAGE_KEY);
      if (storedTemplates) {
        setTemplates(JSON.parse(storedTemplates));
      }
    }
  }, [fetchUsers]);

  const handleEditUser = async (updatedUser: User) => {
    const result = await updateUser(updatedUser.id, updatedUser);
    if (result) {
      await fetchUsers(); // Refresh list
    } else {
      toast({ variant: "destructive", title: "Error", description: "No se pudo actualizar el usuario." });
    }
  }

  const handleDeleteUser = async (userId: string) => {
    const success = await deleteUser(userId);
    if (success) {
      await fetchUsers();
      toast({ title: "Usuario Eliminado", description: "El usuario ha sido eliminado de la base de datos." });
    } else {
      toast({ variant: "destructive", title: "Error", description: "No se pudo eliminar el usuario." });
    }
  };
  
  const handleSaveAndApprovePlan = async (userId: string, plan: UserPlan, duration: number) => {
    const today = new Date();
    const endDate = new Date(today.getTime() + duration * 7 * 24 * 60 * 60 * 1000);
    
    await assignPlanToUser(userId, plan);
    const result = await updateUser(userId, {
        planStatus: 'aprobado',
        customPlanRequest: 'none',
        planStartDate: today.toISOString(),
        planEndDate: endDate.toISOString(),
        planDurationInWeeks: duration,
        currentWeek: 1
    });

    if (result) {
      await fetchUsers();
      toast({
          title: "Plan Asignado y Aprobado",
          description: `El plan ha sido asignado correctamente a ${result.name}.`,
      });
    } else {
       toast({ variant: "destructive", title: "Error", description: "No se pudo asignar el plan." });
    }
  };

  const handleDeletePlan = async (userId: string) => {
    // This is more complex now. It would involve deleting/archiving the plan and progress.
    // For now, let's just update the user status.
    const result = await updateUser(userId, {
        planStatus: 'sin-plan',
        customPlanRequest: 'none',
        planStartDate: undefined,
        planEndDate: undefined,
        planDurationInWeeks: undefined,
        currentWeek: undefined,
    });
    // You would also delete from `training_plans` and `workout_progress` tables here.

     if (result) {
      await fetchUsers();
      toast({
          variant: "destructive",
          title: "Plan Eliminado",
          description: `Se ha eliminado el plan de ${result.name}.`,
      });
    } else {
      toast({ variant: "destructive", title: "Error", description: "No se pudo eliminar el plan." });
    }
  };

  const handleApproveUser = async (userId: string, inviteCode: string) => {
    const result = await updateUser(userId, { status: 'activo', inviteCode });
    if (result) {
      await fetchUsers();
      toast({
        title: "Usuario Aprobado",
        description: `El KaliCodigo se ha generado y guardado.`,
      });
    } else {
       toast({ variant: "destructive", title: "Error", description: "No se pudo aprobar el usuario." });
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: "activo" | "inactivo") => {
      const newStatus = currentStatus === "activo" ? "inactivo" : "activo";
      const result = await updateUser(userId, { status: newStatus });
      if(result) {
        await fetchUsers();
        toast({
            title: `Usuario ${newStatus === "activo" ? "Activado" : "Desactivado"}`,
            description: `El acceso para el usuario ha sido ${newStatus === "activo" ? "restaurado" : "revocado"}.`,
        });
      } else {
        toast({ variant: "destructive", title: "Error", description: "No se pudo cambiar el estado del usuario." });
      }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">Gestión de Usuarios</h1>
          <p className="text-muted-foreground">Ver, gestionar y confirmar cuentas de usuario.</p>
        </div>
      </div>
      {/* Add a loading state */}
      {loading ? <p>Cargando usuarios...</p> : (
        <UserTableClient 
          users={users}
          templates={templates}
          onEditUser={handleEditUser}
          onDeleteUser={handleDeleteUser} 
          onSaveAndApprovePlan={handleSaveAndApprovePlan}
          onDeletePlan={handleDeletePlan}
          onApproveUser={handleApproveUser}
          onToggleUserStatus={handleToggleUserStatus}
        />
      )}
    </div>
  )
}

    