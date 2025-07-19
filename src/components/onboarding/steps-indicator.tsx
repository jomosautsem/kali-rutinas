"use client"

import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

type Step = {
  id: string;
  title: string;
  icon: LucideIcon;
};

type StepsIndicatorProps = {
  steps: Step[];
  currentStep: number;
};

export function StepsIndicator({ steps, currentStep }: StepsIndicatorProps) {
  return (
    <div className="flex items-center justify-between gap-4 p-2 rounded-lg bg-card/50">
      {steps.map((step, index) => {
        const isActive = index === currentStep;
        const isCompleted = index < currentStep;

        return (
          <div key={step.id} className="flex flex-col items-center gap-2">
            <div
              className={cn(
                "h-10 w-10 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                isActive ? "bg-primary border-primary scale-110" : "bg-secondary border-secondary",
                isCompleted ? "bg-primary/80 border-primary" : ""
              )}
            >
              <step.icon className={cn(
                  "h-5 w-5 transition-colors duration-300",
                   isActive ? "text-primary-foreground" : "text-muted-foreground",
                   isCompleted ? "text-primary-foreground" : ""
              )} />
            </div>
            <p className={cn(
                "text-xs font-medium transition-colors duration-300",
                 isActive ? "text-primary" : "text-muted-foreground",
                 isCompleted ? "text-foreground" : ""
            )}>
              {step.title}
            </p>
          </div>
        );
      })}
    </div>
  );
}
