
import { getAllUsers } from '@/services/user.service';
import { UsersTable } from './users-table';
import { ErrorDisplay } from '@/components/error-display';

export default async function AdminUsersPage() {
    try {
        // Fetch users using the newly created robust service function
        const users = await getAllUsers();

        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold">Gestión de Usuarios</h1>
                    <p className="text-muted-foreground">
                        Ver, gestionar y confirmar cuentas de usuario.
                    </p>
                </div>
                <UsersTable users={users} />
            </div>
        );
    } catch (error: any) {
        console.error("[AdminUsersPage] Failed to load users:", error);
        // The UsersTable component is not rendered, and an error message is shown instead.
        return (
             <div className="space-y-6">
                 <div>
                    <h1 className="text-2xl font-bold">Gestión de Usuarios</h1>
                    <p className="text-muted-foreground">
                        Ver, gestionar y confirmar cuentas de usuario.
                    </p>
                </div>
                <ErrorDisplay 
                    title="Error al Cargar Usuarios"
                    message={error.message || "Ocurrió un error inesperado al intentar obtener los datos de los usuarios."}
                    details="Esto puede deberse a un problema de conexión con la base de datos o a un error en el servicio. Por favor, revise los logs del servidor para más detalles."
                />
            </div>
        );
    }
}
