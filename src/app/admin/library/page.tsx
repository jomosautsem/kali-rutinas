
"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, PlusCircle, Trash2, Edit, PackageOpen } from "lucide-react";
import type { LibraryExercise } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { ExerciseEditorDialog } from "@/components/admin/exercise-editor-dialog";


const initialLibrary: LibraryExercise[] = [
    { id: "ex-1", name: "Press de Banca", muscleGroup: "Pecho", description: "Ejercicio fundamental para el desarrollo del pectoral, hombros y tríceps.", mediaUrl: "https://www.youtube.com/watch?v=g_w_Gkse6e4" },
    { id: "ex-2", name: "Sentadilla con Barra", muscleGroup: "Cuádriceps", description: "El rey de los ejercicios de pierna, trabaja cuádriceps, glúteos e isquiotibiales.", mediaUrl: "https://www.youtube.com/watch?v=C_p6-fXg2cQ" },
    { id: "ex-3", name: "Peso Muerto Convencional", muscleGroup: "Espalda", description: "Ejercicio compuesto que fortalece toda la cadena posterior, desde la espalda baja hasta los isquiotibiales.", mediaUrl: "https://www.youtube.com/watch?v=SytqA2A_p4g" },
    { id: "ex-4", name: "Dominadas", muscleGroup: "Espalda", description: "Excelente ejercicio con peso corporal para desarrollar la amplitud de la espalda.", mediaUrl: "https://www.youtube.com/watch?v=eGo4IYlbE5g" },
    { id: "ex-5", name: "Press Militar", muscleGroup: "Hombros", description: "Ejercicio clave para construir hombros fuertes y definidos.", mediaUrl: "https://www.youtube.com/watch?v=2yjwXTZQDDI" },
];

const EXERCISE_LIBRARY_KEY = "exerciseLibrary";

export default function AdminLibraryPage() {
    const [library, setLibrary] = useState<LibraryExercise[]>([]);
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedExercise, setSelectedExercise] = useState<LibraryExercise | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        if (typeof window !== 'undefined') {
            try {
                const storedLibrary = localStorage.getItem(EXERCISE_LIBRARY_KEY);
                if (storedLibrary) {
                    setLibrary(JSON.parse(storedLibrary));
                } else {
                    localStorage.setItem(EXERCISE_LIBRARY_KEY, JSON.stringify(initialLibrary));
                    setLibrary(initialLibrary);
                }
            } catch (error) {
                console.error("Failed to load exercise library:", error);
                setLibrary(initialLibrary);
            }
        }
    }, []);

    const updateAndStoreLibrary = (newLibrary: LibraryExercise[]) => {
        setLibrary(newLibrary);
        localStorage.setItem(EXERCISE_LIBRARY_KEY, JSON.stringify(newLibrary));
    };

    const handleAddClick = () => {
        setSelectedExercise(null);
        setIsEditorOpen(true);
    };

    const handleEditClick = (exercise: LibraryExercise) => {
        setSelectedExercise(exercise);
        setIsEditorOpen(true);
    };
    
    const handleDeleteClick = (exercise: LibraryExercise) => {
        setSelectedExercise(exercise);
        setIsDeleteOpen(true);
    };

    const handleSaveExercise = (exerciseData: Omit<LibraryExercise, 'id'>) => {
        let updatedLibrary;
        if (selectedExercise) { // Editing existing exercise
            updatedLibrary = library.map(ex =>
                ex.id === selectedExercise.id ? { ...selectedExercise, ...exerciseData } : ex
            );
            toast({ title: "Ejercicio Actualizado", description: `Se guardaron los cambios para "${exerciseData.name}".` });
        } else { // Adding new exercise
            const newExercise: LibraryExercise = {
                ...exerciseData,
                id: `ex-${Date.now()}`,
            };
            updatedLibrary = [...library, newExercise];
            toast({ title: "Ejercicio Añadido", description: `Se ha añadido "${newExercise.name}" a la biblioteca.` });
        }
        updateAndStoreLibrary(updatedLibrary);
        setIsEditorOpen(false);
        setSelectedExercise(null);
    };
    
    const confirmDelete = () => {
        if (!selectedExercise) return;
        const newLibrary = library.filter(ex => ex.id !== selectedExercise.id);
        updateAndStoreLibrary(newLibrary);
        toast({
            variant: "destructive",
            title: "Ejercicio Eliminado",
            description: `Se ha eliminado "${selectedExercise.name}" de la biblioteca.`
        });
        setIsDeleteOpen(false);
        setSelectedExercise(null);
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold font-headline">Biblioteca de Ejercicios</h1>
                    <p className="text-muted-foreground">Gestiona la lista central de ejercicios disponibles en la aplicación.</p>
                </div>
                <Button onClick={handleAddClick}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Añadir Nuevo Ejercicio
                </Button>
            </div>

            <div className="rounded-lg border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[40%]">Ejercicio</TableHead>
                            <TableHead>Grupo Muscular</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {library.length > 0 ? (
                            library.map((exercise) => (
                                <TableRow key={exercise.id}>
                                    <TableCell className="font-medium">{exercise.name}</TableCell>
                                    <TableCell><Badge variant="secondary">{exercise.muscleGroup}</Badge></TableCell>
                                    <TableCell className="text-right">
                                         <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <span className="sr-only">Abrir menú</span>
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleEditClick(exercise)}>
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    Editar
                                                </DropdownMenuItem>
                                                <DropdownMenuItem 
                                                    className="text-destructive focus:text-destructive" 
                                                    onClick={() => handleDeleteClick(exercise)}
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Eliminar
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={3} className="h-24 text-center">
                                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                                        <PackageOpen className="h-10 w-10 mb-2" />
                                        <p className="font-semibold">Biblioteca vacía</p>
                                        <p className="text-sm">Añade tu primer ejercicio para empezar.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            
            <ExerciseEditorDialog
                isOpen={isEditorOpen}
                onClose={() => setIsEditorOpen(false)}
                onSave={handleSaveExercise}
                exercise={selectedExercise}
            />

            <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>¿Estás seguro de que quieres eliminar este ejercicio?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta acción no se puede deshacer. Se eliminará permanentemente el ejercicio 
                        <span className="font-bold"> "{selectedExercise?.name}"</span> de la biblioteca.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/80">Eliminar</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
