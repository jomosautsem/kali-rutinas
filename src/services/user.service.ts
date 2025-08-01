'use server';

import { PrismaClient } from '@prisma/client';
import type { User } from "@/lib/types";

const prisma = new PrismaClient();

// --- USER SERVICE FUNCTIONS ---

export async function getAllUsers(): Promise<User[]> {
    const users = await prisma.user.findMany({
        orderBy: {
            registeredAt: 'desc'
        }
    });
    // Convert Date objects to ISO strings for serialization
    return users.map(user => ({
        ...user,
        registeredAt: user.registeredAt.toISOString(),
        planStartDate: user.planStartDate?.toISOString(),
        planEndDate: user.planEndDate?.toISOString(),
    }));
}

export async function getUserByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
        where: { email },
    });
    if (!user) return null;
    return {
        ...user,
        registeredAt: user.registeredAt.toISOString(),
        planStartDate: user.planStartDate?.toISOString(),
        planEndDate: user.planEndDate?.toISOString(),
    };
}

export async function getUserById(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
        where: { id },
    });
     if (!user) return null;
    return {
        ...user,
        registeredAt: user.registeredAt.toISOString(),
        planStartDate: user.planStartDate?.toISOString(),
        planEndDate: user.planEndDate?.toISOString(),
    };
}

export async function createUser(userData: Omit<User, 'id' | 'registeredAt' | 'role' | 'status' | 'planStatus'>): Promise<User> {
    const existingUser = await prisma.user.findUnique({
        where: { email: userData.email },
    });

    if (existingUser) {
        throw new Error("Este correo electrónico ya ha sido registrado.");
    }
    
    const fullName = `${userData.firstName} ${userData.paternalLastName} ${userData.maternalLastName}`.trim();

    const newUser = await prisma.user.create({
        data: {
            firstName: userData.firstName,
            paternalLastName: userData.paternalLastName,
            maternalLastName: userData.maternalLastName,
            name: fullName,
            email: userData.email,
            password: userData.password, // In a real app, this should be hashed
            avatarUrl: userData.avatarUrl,
        }
    });
    
    return {
        ...newUser,
        registeredAt: newUser.registeredAt.toISOString(),
        planStartDate: newUser.planStartDate?.toISOString(),
        planEndDate: newUser.planEndDate?.toISOString(),
    };
}

export async function updateUser(userId: string, updatedData: Partial<User>): Promise<User | null> {
    
    const dataToUpdate: any = { ...updatedData };
    
    if (updatedData.firstName || updatedData.paternalLastName || updatedData.maternalLastName) {
        const currentUser = await prisma.user.findUnique({ where: { id: userId } });
        if(currentUser){
            dataToUpdate.name = `${updatedData.firstName || currentUser.firstName} ${updatedData.paternalLastName || currentUser.paternalLastName} ${updatedData.maternalLastName || currentUser.maternalLastName}`.trim();
        }
    }
    
    // Remove fields that shouldn't be directly updated this way
    delete dataToUpdate.id;
    delete dataToUpdate.registeredAt;
    delete dataToUpdate.password; 

    // Convert date strings back to Date objects for Prisma
    if (dataToUpdate.planStartDate) dataToUpdate.planStartDate = new Date(dataToUpdate.planStartDate);
    if (dataToUpdate.planEndDate) dataToUpdate.planEndDate = new Date(dataToUpdate.planEndDate);


    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: dataToUpdate,
    });
    
    if (!updatedUser) return null;

    return {
        ...updatedUser,
        registeredAt: updatedUser.registeredAt.toISOString(),
        planStartDate: updatedUser.planStartDate?.toISOString(),
        planEndDate: updatedUser.planEndDate?.toISOString(),
    };
}

export async function deleteUser(userId: string): Promise<boolean> {
    try {
        await prisma.user.delete({
            where: { id: userId },
        });
        return true;
    } catch (error) {
        console.error("Failed to delete user:", error);
        return false;
    }
}
