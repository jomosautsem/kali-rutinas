
"use client"

import { useEffect, useState } from "react"
import { UserTableClient } from "@/components/admin/user-table-client"
import type { User, UserPlan } from "@/lib/types";
import { AddUserDialog } from "@/components/admin/add-user-dialog";
import { useToast } from "@/hooks/use-toast";
import type { Template } from "@/app/admin/templates/page";

// In a real app, this data would be fetched from your database.
const initialMockUsers: User[] = [
  { id: "user-alice-1", firstName: "Alice", paternalLastName: "Johnson", maternalLastName: "Smith", name: "Alice Johnson Smith", email: "alice@example.com", role: "client", status: "activo", registeredAt: "2023-10-01", planStatus: "aprobado", inviteCode: "JOALSM23", avatarUrl: "/images/avatars/avatar-01.png" },
  { id: "user-bob-2", firstName: "Bob", paternalLastName: "Williams", maternalLastName: "Jones", name: "Bob Williams Jones", email: "bob@example.com", role: "client", status: "activo", registeredAt: "2023-09-25", planStatus: "sin-plan", inviteCode: "WIBOJO45", avatarUrl: "/images/avatars/avatar-02.png" },
  { id: "user-charlie-3", firstName: "Charlie", paternalLastName: "Brown", maternalLastName: "Davis", name: "Charlie Brown Davis", email: "charlie@example.com", role: "client", status: "pendiente", registeredAt: "2023-10-05", planStatus: "sin-plan", avatarUrl: "/images/avatars/avatar-03.png" },
  { id: "user-jorge-4", firstName: "Jorge", paternalLastName: "Morales", maternalLastName: "", name: "Jorge Morales", email: "kalicentrodeportivotemixco@gmail.com", role: "admin", status: "activo", registeredAt: "2023-01-15", planStatus: "n/a", avatarUrl: "/images/avatars/avatar-04.png" },
  { id: "user-ethan-5", firstName: "Ethan", paternalLastName: "Hunt", maternalLastName: "Carter", name: "Ethan Hunt Carter", email: "ethan@example.com", role: "client", status: "pendiente", registeredAt: "2023-08-11", planStatus: "sin-plan", avatarUrl: "/images/avatars/avatar-05.png" },
];

const TEMPLATES_STORAGE_KEY = "trainingTemplates";


export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // This is a client-side only effect to load data from localStorage
    if (typeof window !== 'undefined') {
      try {
        // Load Users
        const storedUsers = localStorage.getItem("registeredUsers");
        if (storedUsers) {
          setUsers(JSON.parse(storedUsers));
        } else {
          localStorage.setItem("registeredUsers", JSON.stringify(initialMockUsers));
          setUsers(initialMockUsers);
        }

        // Load Templates
        const storedTemplates = localStorage.getItem(TEMPLATES_STORAGE_KEY);
        if (storedTemplates) {
          setTemplates(JSON.parse(storedTemplates));
        }
      } catch (error) {
        console.error("Failed to parse data from localStorage", error);
        setUsers(initialMockUsers);
      }
    }
  }, []);

  const handleAddUser = (newUser: Omit<User, 'id' | 'role' | 'status' | 'registeredAt' | 'planStatus' | 'name'>) => {
    const userWithDefaults: User = {
        ...newUser,
        id: `user-${newUser.email}-${Date.now()}`,
        name: `${newUser.firstName} ${newUser.paternalLastName} ${newUser.maternalLastName}`.trim(),
        role: "client",
        status: "activo",
        registeredAt: new Date().toISOString().split("T")[0],
        planStatus: "sin-plan",
    };
    const updatedUsers = [...users, userWithDefaults];
    setUsers(updatedUsers);
    localStorage.setItem("registeredUsers", JSON.stringify(updatedUsers));
  }
  
  const handleEditUser = (updatedUser: User) => {
     const updatedUsers = users.map(user =>
      user.id === updatedUser.id ? { ...user, ...updatedUser, name: `${updatedUser.firstName} ${updatedUser.paternalLastName} ${updatedUser.maternalLastName}`.trim() } : user
    );
    setUsers(updatedUsers);
    localStorage.setItem("registeredUsers", JSON.stringify(updatedUsers));
  }

  const handleDeleteUser = (userId: string) => {
    const updatedUsers = users.filter(user => user.id !== userId);
    setUsers(updatedUsers);
    localStorage.setItem("registeredUsers", JSON.stringify(updatedUsers));
     // Also remove the user's plan if it exists
    const user = users.find(u => u.id === userId);
    if (user) {
        localStorage.removeItem(`userPlan_${user.email}`);
    }
  };
  
  const handleSaveAndApprovePlan = (userId: string, plan: UserPlan) => {
    const updatedUsers = users.map(user => 
      user.id === userId ? { ...user, planStatus: 'aprobado' } : user
    );
    setUsers(updatedUsers);
    localStorage.setItem("registeredUsers", JSON.stringify(updatedUsers));

    const user = users.find(u => u.id === userId);
    if (user) {
      localStorage.setItem(`userPlan_${user.email}`, JSON.stringify(plan));
       toast({
        title: "Plan Asignado y Aprobado",
        description: `El plan ha sido asignado correctamente a ${user.name}.`,
      });
    }
  };

  const handleApproveUser = (userId: string, inviteCode: string) => {
    const updatedUsers = users.map(user =>
      user.id === userId ? { ...user, status: 'activo', inviteCode } : user
    );
    setUsers(updatedUsers);
    localStorage.setItem("registeredUsers", JSON.stringify(updatedUsers));
    toast({
      title: "Usuario Aprobado",
      description: `El KaliCodigo se ha generado y guardado.`,
    });
  };

  const handleToggleUserStatus = (userId: string, currentStatus: "activo" | "inactivo") => {
      const newStatus = currentStatus === "activo" ? "inactivo" : "activo";
      const updatedUsers = users.map(user =>
          user.id === userId ? { ...user, status: newStatus } : user
      );
      setUsers(updatedUsers);
      localStorage.setItem("registeredUsers", JSON.stringify(updatedUsers));
      toast({
          title: `Usuario ${newStatus === "activo" ? "Activado" : "Desactivado"}`,
          description: `El acceso para el usuario ha sido ${newStatus === "activo" ? "restaurado" : "revocado"}.`,
      });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">Gestión de Usuarios</h1>
          <p className="text-muted-foreground">Ver, gestionar y confirmar cuentas de usuario.</p>
        </div>
        <AddUserDialog onAddUser={handleAddUser} />
      </div>
      <UserTableClient 
        users={users}
        templates={templates}
        onEditUser={handleEditUser}
        onDeleteUser={handleDeleteUser} 
        onSaveAndApprovePlan={handleSaveAndApprovePlan}
        onApproveUser={handleApproveUser}
        onToggleUserStatus={handleToggleUserStatus}
      />
    </div>
  )
}
