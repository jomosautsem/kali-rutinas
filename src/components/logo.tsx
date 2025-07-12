import { cn } from '@/lib/utils';
import * as React from 'react';

export function Logo({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      className={cn('text-primary', className)}
      {...props}
    >
      <circle cx="50" cy="50" r="48" fill="currentColor" fillOpacity="0.2" />
      <circle
        cx="50"
        cy="50"
        r="45"
        stroke="currentColor"
        strokeWidth="4"
        fill="none"
      />
      <path
        d="M35 25 L35 75 M35 50 L58 25 M35 50 L58 75"
        stroke="#FFFFFF"
        strokeWidth="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="65" cy="50" r="5" fill="#e53e3e" />
    </svg>
  );
}
