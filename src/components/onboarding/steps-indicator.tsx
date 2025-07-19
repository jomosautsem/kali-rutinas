
"use client"

import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"
import { motion } from "framer-motion"

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
    <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4 p-2">
            {steps.map((step, index) => {
                const isActive = index === currentStep;
                const isCompleted = index < currentStep;

                return (
                <motion.div 
                    key={step.id} 
                    className="flex flex-col items-center gap-2 relative"
                    animate={{ scale: isActive ? 1.1 : 1 }}
                    transition={{ duration: 0.2 }}
                >
                    <motion.div
                    className={cn(
                        "h-10 w-10 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                        isActive ? "bg-primary border-primary/80" : "bg-secondary border-secondary",
                        isCompleted ? "bg-primary/80 border-primary" : ""
                    )}
                    >
                    <step.icon className={cn(
                        "h-5 w-5 transition-colors duration-300",
                        isActive ? "text-primary-foreground" : "text-muted-foreground",
                        isCompleted ? "text-primary-foreground" : ""
                    )} />
                    </motion.div>
                    <p className={cn(
                        "text-xs font-medium transition-colors duration-300",
                        isActive ? "text-primary" : "text-muted-foreground",
                        isCompleted ? "text-foreground" : ""
                    )}>
                    {step.title}
                    </p>
                </motion.div>
                );
            })}
        </div>
        <div className="relative h-1 w-full bg-secondary rounded-full">
            <motion.div 
                className="absolute top-0 left-0 h-1 bg-primary rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
            />
        </div>
    </div>
  );
}
