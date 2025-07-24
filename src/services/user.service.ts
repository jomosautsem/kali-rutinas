
'use server';

import type { User } from "@/lib/types";

// --- MOCK DATABASE (localStorage) ---

const initialMockUsers: User[] = [
    { id: "user-alice-1", firstName: "Alice", paternalLastName: "Johnson", maternalLastName: "Smith", name: "Alice Johnson Smith", email: "alice@example.com", role: "client", status: "activo", registeredAt: "2023-10-01", planStatus: "aprobado", inviteCode: "JOALSM23", avatarUrl: "/images/avatars/avatar-01.png" },
    { id: "user-bob-2", firstName: "Bob", paternalLastName: "Williams", maternalLastName: "Jones", name: "Bob Williams Jones", email: "bob@example.com", role: "client", status: "activo", registeredAt: "2023-09-25", planStatus: "sin-plan", inviteCode: "WIBOJO45", avatarUrl: "/images/avatars/avatar-02.png" },
    { id: "user-charlie-3", firstName: "Charlie", paternalLastName: "Brown", maternalLastName: "Davis", name: "Charlie Brown Davis", email: "charlie@example.com", role: "client", status: "pendiente", registeredAt: "2023-10-05", planStatus: "sin-plan", avatarUrl: "/images/avatars/avatar-03.png" },
    { id: "user-jorge-4", firstName: "Jorge", paternalLastName: "Morales", maternalLastName: "", name: "Jorge Morales", email: "kalicentrodeportivotemixco@gmail.com", role: "admin", status: "activo", registeredAt: "2023-01-15", planStatus: "n/a", avatarUrl: "/images/avatars/avatar-04.png" },
    { id: "user-ethan-5", firstName: "Ethan", paternalLastName: "Hunt", maternalLastName: "Carter", name: "Ethan Hunt Carter", email: "ethan@example.com", role: "client", status: "pendiente", registeredAt: "2023-08-11", planStatus: "sin-plan", avatarUrl: "/images/avatars/avatar-05.png" },
];

function getUsersFromStorage(): User[] {
    if (typeof window === 'undefined') return [];
    try {
        const storedUsers = localStorage.getItem("registeredUsers");
        if (storedUsers) {
            return JSON.parse(storedUsers);
        } else {
            localStorage.setItem("registeredUsers", JSON.stringify(initialMockUsers));
            return initialMockUsers;
        }
    } catch (error) {
        console.error("Failed to access localStorage or parse users:", error);
        return initialMockUsers;
    }
}

function saveUsersToStorage(users: User[]) {
    if (typeof window === 'undefined') return;
    localStorage.setItem("registeredUsers", JSON.stringify(users));
    // Dispatch a storage event to notify other tabs/windows
    window.dispatchEvent(new StorageEvent('storage', { key: 'registeredUsers' }));
}

// --- USER SERVICE FUNCTIONS ---

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

export async function createUser(userData: Omit<User, 'id' | 'registeredAt'>): Promise<User> {
    const users = getUsersFromStorage();
    if (users.some(user => user.email === userData.email)) {
        throw new Error("Este correo electrónico ya ha sido registrado.");
    }

    const newUser: User = {
        ...userData,
        id: `user-${userData.email}-${Date.now()}`,
        registeredAt: new Date().toISOString(),
    };

    const updatedUsers = [...users, newUser];
    saveUsersToStorage(updatedUsers);
    return newUser;
}

export async function updateUser(userId: string, updatedData: Partial<User>): Promise<User | null> {
    let users = getUsersFromStorage();
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
        return null;
    }

    const name = `${updatedData.firstName || users[userIndex].firstName} ${updatedData.paternalLastName || users[userIndex].paternalLastName} ${updatedData.maternalLastName || users[userIndex].maternalLastName}`.trim();

    users[userIndex] = { ...users[userIndex], ...updatedData, name };
    saveUsersToStorage(users);
    return users[userIndex];
}

export async function deleteUser(userId: string): Promise<boolean> {
    let users = getUsersFromStorage();
    const initialLength = users.length;
    users = users.filter(u => u.id !== userId);

    if (users.length < initialLength) {
        saveUsersToStorage(users);
        const user = users.find(u => u.id === userId);
        if (user && typeof window !== 'undefined') {
           localStorage.removeItem(`userPlan_${user.email}`);
        }
        return true;
    }
    return false;
}
