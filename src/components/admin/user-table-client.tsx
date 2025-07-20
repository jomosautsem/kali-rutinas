

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
import { MoreHorizontal, CheckCircle, Clock, FileEdit, UserCheck, BarChart2, Edit, FilePlus, XCircle, PowerOff, Power } from "lucide-react"
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
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";

type UserTableClientProps = {
  users: User[];
  templates: Template[];
  onEditUser: (user: User) => void;
  onDeleteUser: (userId: string) => void;
  onSaveAndApprovePlan: (userId: string, plan: UserPlan) => void;
  onApproveUser: (userId: string, inviteCode: string) => void;
  onToggleUserStatus: (userId: string, currentStatus: "activo" | "inactivo") => void;
}

const planStatusConfig = {
    aprobado: { label: "Aprobado", icon: CheckCircle, className: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400 border-green-500/30" },
    pendiente: { label: "Pendiente", icon: Clock, className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-400 border-yellow-500/30" },
    "sin-plan": { label: "Sin Plan", icon: () => null, className: "bg-gray-100 text-gray-800 dark:bg-gray-700/40 dark:text-gray-300 border-gray-500/30" },
    "n/a": { label: "N/A", icon: () => null, className: "bg-transparent text-muted-foreground" },
};

const userStatusConfig = {
    activo: { label: "Activo", icon: CheckCircle, className: "border-green-500 text-green-500" },
    pendiente: { label: "Pendiente", icon: Clock, className: "border-yellow-500 text-yellow-500" },
    inactivo: { label: "Inactivo", icon: XCircle, className: "border-red-500 text-red-500" },
};


export function UserTableClient({ users, templates, onEditUser, onDeleteUser, onSaveAndApprovePlan, onApproveUser, onToggleUserStatus }: UserTableClientProps) {
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
              <TableHead>Estado</TableHead>
              <TableHead>KaliCodigo</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead className="text-center">Acceso</TableHead>
              <TableHead>
                <span className="sr-only">Acciones</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => {
               const statusConfig = userStatusConfig[user.status] || userStatusConfig.pendiente;
               const planConfig = planStatusConfig[user.planStatus] || planStatusConfig['sin-plan'];

              return (
              <TableRow key={user.id} className={cn(user.status === 'inactivo' && 'bg-muted/30 opacity-60')}>
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
                   <Badge variant="outline" className={cn("font-semibold gap-1.5", statusConfig.className)}>
                     <statusConfig.icon className="h-3 w-3" />
                     {statusConfig.label}
                   </Badge>
                </TableCell>
                 <TableCell>
                  <span className="font-mono text-xs">{user.inviteCode || "-"}</span>
                </TableCell>
                <TableCell>
                    {(() => {
                        const Icon = planConfig.icon;
                        return (
                            <Badge variant="outline" className={cn("gap-1.5", planConfig.className)}>
                                {user.planStatus !== 'sin-plan' && user.planStatus !== 'n/a' && <Icon className="h-3 w-3" />}
                                {planConfig.label}
                            </Badge>
                        )
                    })()}
                </TableCell>
                 <TableCell className="text-center">
                    {user.role === 'client' && user.status !== 'pendiente' && (
                        <div className="flex flex-col items-center justify-center gap-1.5">
                            <Switch
                                id={`status-switch-${user.id}`}
                                checked={user.status === 'activo'}
                                onCheckedChange={() => onToggleUserStatus(user.id, user.status as "activo" | "inactivo")}
                                disabled={user.status === 'pendiente'}
                                aria-label="Activar o desactivar usuario"
                            />
                             <Label htmlFor={`status-switch-${user.id}`} className={cn("text-xs", user.status === 'activo' ? 'text-green-500' : 'text-red-500')}>
                                {user.status === 'activo' ? 'Activado' : 'Desactivado'}
                            </Label>
                        </div>
                    )}
                </TableCell>
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
                      {user.role === 'client' && user.status !== 'pendiente' && (
                        <>
                          <DropdownMenuItem onClick={() => handlePlanEditorOpen(user)} disabled={user.status === 'inactivo'}>
                              <FileEdit className="mr-2 h-4 w-4" />
                              Editar/Generar Plan
                          </DropdownMenuItem>
                           <DropdownMenuItem onClick={() => handleAssignTemplateOpen(user)} disabled={user.status === 'inactivo'}>
                              <FilePlus className="mr-2 h-4 w-4" />
                              Asignar Plantilla
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAnalyticsOpen(user)} disabled={user.status === 'inactivo'}>
                              <BarChart2 className="mr-2 h-4 w-4" />
                              Ver Progreso
                          </DropdownMenuItem>
                        </>
                      )}
                      {user.role !== 'admin' && (
                        <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => handleDeleteClick(user)}
                        >
                            Eliminar usuario
                        </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )})}
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
      
      {selectedUser && data?.progress && (
        <ProgressAnalytics
          user={selectedUser}
          data={{ progress: data.progress, plan: data.plan }}
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
