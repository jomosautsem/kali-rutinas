
"use client"

import { useEffect, useState } from "react"
import { UserTableClient } from "@/components/admin/user-table-client"
import type { User, UserPlan } from "@/lib/types";
import { AddUserDialog } from "@/components/admin/add-user-dialog";
import { useToast } from "@/hooks/use-toast";

// In a real app, this data would be fetched from your database.
const initialMockUsers: User[] = [
  { id: "user_2klj3h5g", name: "Alice Johnson", email: "alice@example.com", role: "client", status: "activo", registeredAt: "2023-10-01", planStatus: "aprobado", inviteCode: "AJ23" },
  { id: "user_9fj4kew8", name: "Bob Williams", email: "bob@example.com", role: "client", status: "activo", registeredAt: "2023-09-25", planStatus: "sin-plan", inviteCode: "BW45" },
  { id: "user_1mnb2vcs", name: "Charlie Brown", email: "charlie@example.com", role: "client", status: "pendiente", registeredAt: "2023-10-05", planStatus: "sin-plan" },
  { id: "user_admin_01", name: "Diana Prince", email: "kalicentrodeportivotemixco@gmail.com", role: "admin", status: "activo", registeredAt: "2023-01-15", planStatus: "n/a" },
  { id: "user_p0o9i8uy", name: "Ethan Hunt", email: "ethan@example.com", role: "client", status: "pendiente", registeredAt: "2023-08-11", planStatus: "sin-plan" },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // This is a client-side only effect to load users from localStorage
    if (typeof window !== 'undefined') {
      try {
        const storedUsers = localStorage.getItem("registeredUsers");
        if (storedUsers) {
          setUsers(JSON.parse(storedUsers));
        } else {
          // If no users in localStorage, set the initial mock users
          localStorage.setItem("registeredUsers", JSON.stringify(initialMockUsers));
          setUsers(initialMockUsers);
        }
      } catch (error) {
        console.error("Failed to parse users from localStorage", error);
        setUsers(initialMockUsers);
      }
    }
  }, []);

  const handleAddUser = (newUser: Omit<User, 'id' | 'role' | 'status' | 'registeredAt' | 'planStatus'>) => {
    const userWithDefaults: User = {
        ...newUser,
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        role: "client",
        status: "activo",
        registeredAt: new Date().toISOString().split("T")[0],
        planStatus: "sin-plan",
    };
    const updatedUsers = [...users, userWithDefaults];
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
      description: `El código de invitación se ha generado y guardado.`,
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
        onDeleteUser={handleDeleteUser} 
        onSaveAndApprovePlan={handleSaveAndApprovePlan}
        onApproveUser={handleApproveUser}
      />
    </div>
  )
}
