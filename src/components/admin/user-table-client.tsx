"use client"

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, CheckCircle, Clock } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { cn } from "@/lib/utils"

export type User = {
  id: string
  name: string
  email: string
  role: "admin" | "client"
  status: "activo" | "pendiente"
  registeredAt: string
  planStatus: "aprobado" | "pendiente" | "sin-plan" | "n/a"
}

type UserTableClientProps = {
  users: User[]
}

const planStatusConfig = {
    aprobado: { label: "Aprobado", icon: CheckCircle, className: "bg-green-500/20 text-green-700" },
    pendiente: { label: "Pendiente", icon: Clock, className: "bg-yellow-500/20 text-yellow-700" },
    "sin-plan": { label: "Sin Plan", icon: () => null, className: "bg-gray-500/20 text-gray-700" },
    "n/a": { label: "N/A", icon: () => null, className: "bg-transparent text-muted-foreground" },
};


export function UserTableClient({ users }: UserTableClientProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  const handleDeleteClick = (user: User) => {
    setSelectedUser(user)
    setIsDeleteDialogOpen(true)
  }
  
  const handleConfirmDelete = () => {
    if (selectedUser) {
      console.log("Eliminando usuario:", selectedUser.id)
      // TODO: Implement actual delete logic
      setIsDeleteDialogOpen(false)
      setSelectedUser(null)
    }
  }

  return (
    <>
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuario</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Estado Usuario</TableHead>
              <TableHead>Estado del Plan</TableHead>
              <TableHead>Registrado</TableHead>
              <TableHead>
                <span className="sr-only">Acciones</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="font-medium">{user.name}</div>
                  <div className="text-sm text-muted-foreground">{user.email}</div>
                </TableCell>
                <TableCell>
                  <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                    {user.role === "admin" ? "Admin" : "Cliente"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={user.status === "activo" ? "outline" : "destructive"} className={cn(
                      user.status === 'activo' && 'border-green-500 text-green-500',
                      user.status === 'pendiente' && 'border-yellow-500 text-yellow-500'
                  )}>
                    {user.status}
                  </Badge>
                </TableCell>
                <TableCell>
                    {(() => {
                        const config = planStatusConfig[user.planStatus];
                        const Icon = config.icon;
                        return (
                            <Badge variant="outline" className={cn("gap-1.5", config.className)}>
                                <Icon className="h-3 w-3" />
                                {config.label}
                            </Badge>
                        )
                    })()}
                </TableCell>
                <TableCell>{user.registeredAt}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Abrir menú</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                      <DropdownMenuItem>Ver detalles del usuario</DropdownMenuItem>
                      <DropdownMenuItem>Ver plan de entrenamiento</DropdownMenuItem>
                      <DropdownMenuItem className="text-green-600 focus:text-green-600">Aprobar Plan</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => handleDeleteClick(user)}
                      >
                        Eliminar usuario
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente la cuenta de usuario para{" "}
              <span className="font-semibold">{selectedUser?.name}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
