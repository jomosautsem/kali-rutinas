
// src/components/error-display.tsx
'use client';

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface ErrorDisplayProps {
  title?: string;
  message: string;
  details?: string;
}

export function ErrorDisplay({ 
  title = "Ha Ocurrido un Error", 
  message, 
  details 
}: ErrorDisplayProps) {
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>
        <p>{message}</p>
        {details && (
          <pre className="mt-2 whitespace-pre-wrap rounded-md bg-muted p-2 text-xs font-mono">
            {details}
          </pre>
        )}
      </AlertDescription>
    </Alert>
  );
}
