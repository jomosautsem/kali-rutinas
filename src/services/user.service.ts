
'use client'; // Important: services using localStorage must be client-side

import type { User, GeneratePersonalizedTrainingPlanInput } from "@/lib/types";

const USERS_STORAGE_KEY = "registeredUsers";

// --- USER SERVICE FUNCTIONS ---

const initialMockUsers: User[] = [
  { id: "user-alice-1", firstName: "Alice", paternalLastName: "Johnson", maternalLastName: "Smith", name: "Alice Johnson Smith", email: "alice@example.com", role: "client", status: "activo", registeredAt: "2023-10-01", planStatus: "aprobado", inviteCode: "JOALSM23", avatarUrl: "/images/avatars/avatar-01.png" },
  { id: "user-bob-2", firstName: "Bob", paternalLastName: "Williams", maternalLastName: "Jones", name: "Bob Williams Jones", email: "bob@example.com", role: "client", status: "activo", registeredAt: "2023-09-25", planStatus: "sin-plan", inviteCode: "WIBOJO45", avatarUrl: "/images/avatars/avatar-02.png" },
  { id: "user-charlie-3", firstName: "Charlie", paternalLastName: "Brown", maternalLastName: "Davis", name: "Charlie Brown Davis", email: "charlie@example.com", role: "client", status: "pendiente", registeredAt: "2023-10-05", planStatus: "sin-plan", avatarUrl: "/images/avatars/avatar-03.png" },
  { id: "user-jorge-4", firstName: "Jorge", paternalLastName: "Morales", maternalLastName: "", name: "Jorge Morales", email: "kalicentrodeportivotemixco@gmail.com", role: "admin", status: "activo", registeredAt: "2023-01-15", planStatus: "n/a", avatarUrl: "/images/avatars/avatar-04.png" },
  { id: "user-ethan-5", firstName: "Ethan", paternalLastName: "Hunt", maternalLastName: "Carter", name: "Ethan Hunt Carter", email: "ethan@example.com", role: "client", status: "pendiente", registeredAt: "2023-08-11", planStatus: "sin-plan", avatarUrl: "/images/avatars/avatar-05.png" },
];


function getUsersFromStorage(): User[] {
    if (typeof window === 'undefined') return [];
    const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
    if (storedUsers) {
        return JSON.parse(storedUsers);
    } else {
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(initialMockUsers));
        return initialMockUsers;
    }
}

function saveUsersToStorage(users: User[]) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

export async function getAllUsers(): Promise<User[]> {
    return getUsersFromStorage();
}

export async function getUserByEmail(email: string): Promise<User | null> {
    const users = getUsersFromStorage();
    return users.find(u => u.email === email) || null;
}

export async function getUserById(id: string): Promise<User | null> {
    const users = getUsersFromStorage();
    return users.find(u => u.id === id) || null;
}

export async function createUser(userData: Omit<User, 'id' | 'registeredAt' | 'role' | 'status' | 'planStatus' | 'name'>): Promise<User> {
    const users = getUsersFromStorage();
    if (users.some(user => user.email === userData.email)) {
        throw new Error("Este correo electrónico ya ha sido registrado.");
    }

    const newUser: User = {
        ...userData,
        id: `user-${Date.now()}`,
        name: `${userData.firstName} ${userData.paternalLastName} ${userData.maternalLastName}`.trim(),
        role: "client",
        status: "pendiente",
        registeredAt: new Date().toISOString(),
        planStatus: "sin-plan",
    };

    const updatedUsers = [...users, newUser];
    saveUsersToStorage(updatedUsers);
    return newUser;
}

export async function updateUser(userId: string, updatedData: Partial<User>): Promise<User | null> {
    const users = getUsersFromStorage();
    let userToUpdate: User | undefined;
    
    const updatedUsers = users.map(user => {
        if (user.id === userId) {
            userToUpdate = { ...user, ...updatedData };
            // Ensure name is updated if partial names are provided
            if (updatedData.firstName || updatedData.paternalLastName || updatedData.maternalLastName) {
                userToUpdate.name = `${userToUpdate.firstName} ${userToUpdate.paternalLastName} ${userToUpdate.maternalLastName}`.trim();
            }
            return userToUpdate;
        }
        return user;
    });

    if (userToUpdate) {
        saveUsersToStorage(updatedUsers);
        return userToUpdate;
    }
    
    return null;
}

export async function deleteUser(userId: string): Promise<boolean> {
    let users = getUsersFromStorage();
    const initialLength = users.length;
    users = users.filter(user => user.id !== userId);

    if (users.length < initialLength) {
        saveUsersToStorage(users);
        return true;
    }
    return false;
}

export async function saveOnboardingData(userId: string, data: Omit<GeneratePersonalizedTrainingPlanInput, 'history'>): Promise<void> {
    const user = await getUserById(userId);
    if (!user) throw new Error("User not found");
    localStorage.setItem(`onboardingData_${user.email}`, JSON.stringify(data));
}

    
