
"use client"

import type { LucideIcon } from "lucide-react";

type StepProps = {
  title: string;
  icon: LucideIcon;
  children: React.ReactNode;
};

export function Step({ title, icon: Icon, children }: StepProps) {
  return (
    <div className="space-y-4">
        <div className="flex items-center gap-3 border-b border-primary/20 pb-2">
            <Icon className="h-6 w-6 text-primary" />
            <h3 className="text-xl font-semibold text-primary/90 font-headline">{title}</h3>
        </div>
        <div className="space-y-4 pt-2">
            {children}
        </div>
    </div>
  );
}

    
