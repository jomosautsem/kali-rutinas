
"use client"

import { useState, useEffect } from "react"
import type { User, UserPlan, ProgressData } from "@/lib/types";
import type { Template } from "@/app/admin/templates/page";
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
import { MoreHorizontal, CheckCircle, Clock, FileEdit, UserCheck, BarChart2, Edit, FilePlus } from "lucide-react"
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
import { PlanEditor } from "./plan-editor"
import { GenerateInviteCodeDialog } from "./generate-invite-code-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { ProgressAnalytics } from "./progress-analytics";
import { EditUserDialog } from "./edit-user-dialog";
import { AssignTemplateDialog } from "./assign-template-dialog";

type UserTableClientProps = {
  users: User[];
  templates: Template[];
  onEditUser: (user: User) => void;
  onDeleteUser: (userId: string) => void;
  onSaveAndApprovePlan: (userId: string, plan: UserPlan) => void;
  onApproveUser: (userId: string, inviteCode: string) => void;
}

const planStatusConfig = {
    aprobado: { label: "Aprobado", icon: CheckCircle, className: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400 border-green-500/30" },
    pendiente: { label: "Pendiente", icon: Clock, className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-400 border-yellow-500/30" },
    "sin-plan": { label: "Sin Plan", icon: () => null, className: "bg-gray-100 text-gray-800 dark:bg-gray-700/40 dark:text-gray-300 border-gray-500/30" },
    "n/a": { label: "N/A", icon: () => null, className: "bg-transparent text-muted-foreground" },
};


export function UserTableClient({ users, templates, onEditUser, onDeleteUser, onSaveAndApprovePlan, onApproveUser }: UserTableClientProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isPlanEditorOpen, setIsPlanEditorOpen] = useState(false)
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false);
  const [isInviteCodeDialogOpen, setIsInviteCodeDialogOpen] = useState(false);
  const [isAssignTemplateDialogOpen, setIsAssignTemplateDialogOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [selectedUserProgress, setSelectedUserProgress] = useState<{ progress: ProgressData, plan: UserPlan } | null>(null);


  const handleDeleteClick = (user: User) => {
    setSelectedUser(user)
    setIsDeleteDialogOpen(true)
  }
  
  const handleConfirmDelete = () => {
    if (selectedUser) {
      onDeleteUser(selectedUser.id);
      setIsDeleteDialogOpen(false)
      setSelectedUser(null)
    }
  }
  
  const handleEditUserClick = (user: User) => {
    setSelectedUser(user);
    setIsEditUserDialogOpen(true);
  }

  const handlePlanEditorOpen = (user: User) => {
    setSelectedUser(user);
    setIsPlanEditorOpen(true);
  }
  
  const handleAssignTemplateOpen = (user: User) => {
    setSelectedUser(user);
    setIsAssignTemplateDialogOpen(true);
  }

  const handlePlanEditorClose = () => {
    setIsPlanEditorOpen(false);
    setSelectedUser(null);
  }

  const handleApproveClick = (user: User) => {
    setSelectedUser(user);
    setIsInviteCodeDialogOpen(true);
  };
  
  const handleAnalyticsOpen = (user: User) => {
    const progressData = localStorage.getItem(`progress_${user.email}`);
    const planData = localStorage.getItem(`userPlan_${user.email}`);
    if (progressData && planData) {
        setSelectedUserProgress({
            progress: JSON.parse(progressData),
            plan: JSON.parse(planData)
        });
    } else {
        setSelectedUserProgress(null);
    }
    setSelectedUser(user);
    setIsAnalyticsOpen(true);
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
              <TableHead>KaliCodigo</TableHead>
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
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatarUrl} alt={user.name} />
                      <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                    {user.role === "admin" ? "Admin" : "Cliente"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={user.status === "activo" ? "outline" : "destructive"} className={cn(
                      "font-semibold",
                      user.status === 'activo' && 'border-green-500 text-green-500',
                      user.status === 'pendiente' && 'border-yellow-500 text-yellow-500'
                  )}>
                    {user.status === 'activo' ? 'Activo' : 'Pendiente'}
                  </Badge>
                </TableCell>
                 <TableCell>
                  <span className="font-mono text-xs">{user.inviteCode || "-"}</span>
                </TableCell>
                <TableCell>
                    {(() => {
                        const config = planStatusConfig[user.planStatus];
                        if (!config) return null; // Defensive check
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
                      {user.role === 'client' && (
                        <DropdownMenuItem onClick={() => handleEditUserClick(user)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar Usuario
                        </DropdownMenuItem>
                      )}
                      {user.role === 'client' && user.status === 'pendiente' && (
                        <DropdownMenuItem onClick={() => handleApproveClick(user)}>
                            <UserCheck className="mr-2 h-4 w-4" />
                            Aprobar Usuario
                        </DropdownMenuItem>
                      )}
                      {user.role === 'client' && user.status === 'activo' && (
                        <>
                          <DropdownMenuItem onClick={() => handlePlanEditorOpen(user)}>
                              <FileEdit className="mr-2 h-4 w-4" />
                              Editar/Generar Plan
                          </DropdownMenuItem>
                           <DropdownMenuItem onClick={() => handleAssignTemplateOpen(user)}>
                              <FilePlus className="mr-2 h-4 w-4" />
                              Asignar Plantilla
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAnalyticsOpen(user)}>
                              <BarChart2 className="mr-2 h-4 w-4" />
                              Ver Progreso
                          </DropdownMenuItem>
                        </>
                      )}
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

      {selectedUser && (
         <PlanEditor 
            user={selectedUser} 
            isOpen={isPlanEditorOpen}
            onClose={handlePlanEditorClose}
            onSaveAndApprove={onSaveAndApprovePlan}
          />
      )}
      
      {selectedUser && (
        <EditUserDialog
          user={selectedUser}
          isOpen={isEditUserDialogOpen}
          onClose={() => {
            setIsEditUserDialogOpen(false);
            setSelectedUser(null);
          }}
          onEditUser={onEditUser}
        />
      )}

      {selectedUser && (
        <AssignTemplateDialog
          user={selectedUser}
          templates={templates}
          isOpen={isAssignTemplateDialogOpen}
          onClose={() => setIsAssignTemplateDialogOpen(false)}
          onAssign={(plan) => onSaveAndApprovePlan(selectedUser.id, plan)}
        />
      )}
      
      {selectedUser && selectedUserProgress && (
        <ProgressAnalytics
          user={selectedUser}
          data={selectedUserProgress}
          isOpen={isAnalyticsOpen}
          onClose={() => setIsAnalyticsOpen(false)}
        />
      )}

      {selectedUser && (
        <GenerateInviteCodeDialog
            user={selectedUser}
            isOpen={isInviteCodeDialogOpen}
            onClose={() => {
                setIsInviteCodeDialogOpen(false);
                setSelectedUser(null);
            }}
            onApprove={onApproveUser}
        />
      )}
    </>
  )
}

    