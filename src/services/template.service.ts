
'use client'; // This service interacts with localStorage

import type { Template } from '@/lib/types';

const TEMPLATES_STORAGE_KEY = "trainingTemplates";

const initialTemplates: Template[] = [
    {
        id: "template-1",
        title: "HIIT de Cuerpo Completo",
        description: "Entrenamiento de intervalos de alta intensidad para todos los grupos musculares.",
        level: "Avanzado",
        days: 5,
        plan: {
            warmup: "Comienza con 5 minutos de cardio ligero (saltar la cuerda o trotar). Sigue con círculos de brazos, rotaciones de torso y sentadillas sin peso para activar las articulaciones principales.",
            recommendations: "Asegúrate de calentar bien antes de cada sesión y mantenerte hidratado. Realiza estiramientos suaves al finalizar.",
            weeklyPlan: [
                { day: "Día 1: HIIT Total", focus: "Cardio y Resistencia", exercises: [{ name: "Burpees", series: "5", reps: "20", rest: "30s", mediaUrl: "https://www.youtube.com/results?search_query=Burpees+ejercicio+tutorial" }] },
                { day: "Día 2: Piernas y Glúteos", focus: "Fuerza y Potencia", exercises: [{ name: "Sentadillas con Salto", series: "4", reps: "15", rest: "45s", mediaUrl: "https://www.youtube.com/results?search_query=Sentadillas+con+Salto+ejercicio+tutorial" }] },
                { day: "Día 3: Core y Abdomen", focus: "Estabilidad y Fuerza", exercises: [{ name: "Plancha", series: "4", reps: "60s", rest: "30s", mediaUrl: "https://www.youtube.com/results?search_query=Plancha+ejercicio+tutorial" }] },
                { day: "Día 4: Tren Superior", focus: "Fuerza y Resistencia", exercises: [{ name: "Flexiones", series: "4", reps: "15", rest: "45s", mediaUrl: "https://www.youtube.com/results?search_query=Flexiones+ejercicio+tutorial" }] },
                { day: "Día 5: Cardio Intenso", focus: "Resistencia Cardiovascular", exercises: [{ name: "Sprints", series: "8", reps: "30s", rest: "60s", mediaUrl: "https://www.youtube.com/results?search_query=Sprints+ejercicio+tutorial" }] },
            ]
        },
        createdAt: new Date(),
    },
    {
        id: "template-2",
        title: "Fuerza para Principiantes",
        description: "Una rutina de 3 días para quienes se inician en el levantamiento de pesas.",
        level: "Principiante",
        days: 3,
        plan: {
            warmup: "5-10 minutos en la caminadora o bicicleta estática. Realiza 2 series de 15 repeticiones de bisagras de cadera, band pull-aparts y rotaciones de hombros con poco peso.",
            recommendations: "Concéntrate en la técnica correcta antes de aumentar el peso. El descanso es clave para la recuperación y el crecimiento.",
            weeklyPlan: [
                { day: "Día 1: Empuje", focus: "Pecho, Hombros, Tríceps", exercises: [{ name: "Press de Banca", series: "3", reps: "8-10", rest: "90s", mediaUrl: "https://www.youtube.com/results?search_query=Press+de+Banca+ejercicio+tutorial" }] },
                { day: "Día 2: Tirón", focus: "Espalda, Bíceps", exercises: [{ name: "Remo con Barra", series: "3", reps: "8-10", rest: "90s", mediaUrl: "https://www.youtube.com/results?search_query=Remo+con+Barra+ejercicio+tutorial" }] },
                { day: "Día 3: Pierna", focus: "Cuádriceps, Isquios, Glúteos", exercises: [{ name: "Sentadilla", series: "3", reps: "8-10", rest: "90s", mediaUrl: "https://www.youtube.com/results?search_query=Sentadilla+ejercicio+tutorial" }] },
            ]
        },
        createdAt: new Date(),
    },
];

function getTemplatesFromStorage(): Template[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(TEMPLATES_STORAGE_KEY);
    if (stored) {
        return JSON.parse(stored).map((t: Template) => ({...t, createdAt: new Date(t.createdAt)}));
    } else {
        localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(initialTemplates));
        return initialTemplates;
    }
}

function saveTemplatesToStorage(templates: Template[]) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(templates));
}

export async function getTemplates(): Promise<Template[]> {
  return getTemplatesFromStorage();
}

export async function addTemplate(templateData: Omit<Template, 'id' | 'createdAt'>): Promise<Template> {
  const templates = getTemplatesFromStorage();
  const newTemplate: Template = {
      ...templateData,
      id: `template-${Date.now()}`,
      createdAt: new Date(),
  };
  const updatedTemplates = [...templates, newTemplate];
  saveTemplatesToStorage(updatedTemplates);
  return newTemplate;
}

export async function updateTemplate(id: string, templateData: Omit<Template, 'id' | 'createdAt'>): Promise<Template> {
  const templates = getTemplatesFromStorage();
  let updatedTemplate: Template | null = null;
  const updatedTemplates = templates.map(t => {
      if (t.id === id) {
          updatedTemplate = { ...t, ...templateData };
          return updatedTemplate;
      }
      return t;
  });
  if (!updatedTemplate) throw new Error("Template not found");

  saveTemplatesToStorage(updatedTemplates);
  return updatedTemplate;
}

export async function deleteTemplate(id: string): Promise<void> {
  let templates = getTemplatesFromStorage();
  templates = templates.filter(t => t.id !== id);
  saveTemplatesToStorage(templates);
}
