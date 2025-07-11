
"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { User, UserTableClient } from "@/components/admin/user-table-client"
import { PlusCircle } from "lucide-react"

// In a real app, this data would be fetched from your database.
const initialMockUsers: User[] = [
  { id: "1", name: "Alice Johnson", email: "alice@example.com", role: "client", status: "activo", registeredAt: "2023-10-01", planStatus: "aprobado" },
  { id: "2", name: "Bob Williams", email: "bob@example.com", role: "client", status: "activo", registeredAt: "2023-09-25", planStatus: "sin-plan" },
  { id: "3", name: "Charlie Brown", email: "charlie@example.com", role: "client", status: "activo", registeredAt: "2023-10-05", planStatus: "pendiente" },
  { id: "4", name: "Diana Prince", email: "kalicentrodeportivotemixco@gmail.com", role: "admin", status: "activo", registeredAt: "2023-01-15", planStatus: "n/a" },
  { id: "5", name: "Ethan Hunt", email: "ethan@example.com", role: "client", status: "pendiente", registeredAt: "2023-08-11", planStatus: "sin-plan" },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);

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

  const handleDeleteUser = (userId: string) => {
    const updatedUsers = users.filter(user => user.id !== userId);
    setUsers(updatedUsers);
    localStorage.setItem("registeredUsers", JSON.stringify(updatedUsers));
  };
  
  const handleApprovePlan = (userId: string) => {
    const updatedUsers = users.map(user => 
      user.id === userId ? { ...user, planStatus: 'aprobado' } : user
    );
    setUsers(updatedUsers);
    localStorage.setItem("registeredUsers", JSON.stringify(updatedUsers));
  };


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">Gestión de Usuarios</h1>
          <p className="text-muted-foreground">Ver, gestionar y confirmar cuentas de usuario.</p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Añadir Usuario
        </Button>
      </div>
      <UserTableClient users={users} onDeleteUser={handleDeleteUser} onApprovePlan={handleApprovePlan} />
    </div>
  )
}

    