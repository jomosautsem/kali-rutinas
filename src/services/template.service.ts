'use server';

import { PrismaClient } from '@prisma/client';
import type { Template, UserPlan } from '@/lib/types';

const prisma = new PrismaClient();

function toTemplate(templateFromDb: any): Template {
  return {
    ...templateFromDb,
    plan: templateFromDb.plan as UserPlan,
  };
}

export async function getTemplates(): Promise<Template[]> {
  const templates = await prisma.template.findMany({
    orderBy: { createdAt: 'desc' },
  });
  return templates.map(toTemplate);
}

export async function addTemplate(templateData: Omit<Template, 'id' | 'createdAt'>): Promise<Template> {
  const newTemplate = await prisma.template.create({
    data: {
        ...templateData,
        plan: templateData.plan as any,
    },
  });
  return toTemplate(newTemplate);
}

export async function updateTemplate(id: string, templateData: Omit<Template, 'id' | 'createdAt'>): Promise<Template> {
  const updatedTemplate = await prisma.template.update({
    where: { id },
    data: {
        ...templateData,
        plan: templateData.plan as any,
    },
  });
  return toTemplate(updatedTemplate);
}

export async function deleteTemplate(id: string): Promise<void> {
  await prisma.template.delete({
    where: { id },
  });
}
