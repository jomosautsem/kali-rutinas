import { cn } from '@/lib/utils';
import * as React from 'react';

export function Logo({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 160 160"
      className={cn('', className)}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <defs>
        <radialGradient id="gold_gradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
          <stop offset="0%" style={{ stopColor: '#FFD700', stopOpacity: 1 }} />
          <stop offset="60%" style={{ stopColor: '#F0B90B', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#B8860B', stopOpacity: 1 }} />
        </radialGradient>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
            </feMerge>
        </filter>
      </defs>

      {/* Dragon Icon */}
      <g transform="translate(40 20) scale(0.4)">
        <path d="M119.87,97.38a3.12,3.12,0,0,0-4.42,0l-5.63,5.64a3.13,3.13,0,0,0,0,4.42l15,15.06a3.12,3.12,0,0,0,4.42,0l5.63-5.64a3.13,3.13,0,0,0,0-4.42Z" fill="url(#gold_gradient)"/>
        <path d="M127,109.28,111.9,124.34a3.13,3.13,0,0,1-4.42,0L91.44,108.3a3.12,3.12,0,0,1,0-4.42L97.07,98a3.12,3.12,0,0,1,4.42,0l15,15.06a3.13,3.13,0,0,0,4.42,0l5.63-5.64a3.13,3.13,0,0,0,0-4.42l-15-15.06a3.12,3.12,0,0,0-4.42,0L97.48,93.14a33.32,33.32,0,0,0-7.3-6.85,11.23,11.23,0,0,0-15.42-1,3.12,3.12,0,0,0-1.12,4.28L80,103.35,53.46,76.81A3.12,3.12,0,0,0,49,76.81L29.1,96.71a3.12,3.12,0,0,0,0,4.42L73,145a3.12,3.12,0,0,0,4.42,0l5.63-5.64a3.13,3.13,0,0,0,0-4.42L59.3,111.19l19.5-19.5,6,6a3.12,3.12,0,0,0,4.42,0l1.17-1.17,11.6,11.6L82.16,128a3.12,3.12,0,0,0,0,4.42l5.63,5.64a3.12,3.12,0,0,0,4.42,0l26.54-26.54L127,103.28a3.13,3.13,0,0,1,4.42,0l5.63,5.64a3.13,3.13,0,0,1,0,4.42l-15,15.06a3.12,3.12,0,0,1-4.42,0L112,122.77a3.12,3.12,0,0,0-4.42,0l-5.63,5.64a3.13,3.13,0,0,0,0,4.42l15,15.06a3.12,3.12,0,0,0,4.42,0l5.63-5.64a3.13,3.13,0,0,0,0-4.42l-3.23-3.23,12.72-12.72a3.12,3.12,0,0,0,0-4.42Z" fill="url(#gold_gradient)"/>
        <path d="M79.8,79.52a3.13,3.13,0,0,0-4.42-4.42L56,94.49l-6.19-6.19a3.12,3.12,0,0,0-4.42,0L23,110.74a3.12,3.12,0,0,0,0,4.42L42.27,134.4a3.12,3.12,0,0,0,4.42,0L66,115.12Z" fill="url(#gold_gradient)"/>
        <path d="M124.3,27.1,96.76,54.64l-2.06,2.06a3.12,3.12,0,0,0,0,4.42l5.63,5.64a3.12,3.12,0,0,0,4.42,0l22.19-22.19a3.12,3.12,0,0,0,0-4.42l-5.63-5.64A3.13,3.13,0,0,0,124.3,27.1Z" fill="url(#gold_gradient)"/>
        <path d="M83.88,58.33,70.1,72.11a3.13,3.13,0,0,0,0,4.42l5.63,5.64a3.12,3.12,0,0,0,4.42,0L102.34,60,96.71,54.33A3.12,3.12,0,0,0,83.88,58.33Z" fill="url(#gold_gradient)"/>
        <path d="M96.76,27.1a3.12,3.12,0,0,0-4.42,0L70.1,49.34l-2.06,2.06a3.12,3.12,0,0,0,0,4.42l5.63,5.64a3.12,3.12,0,0,0,4.42,0l22.2-22.2a3.12,3.12,0,0,0,0-4.42L96.76,27.1Z" fill="url(#gold_gradient)"/>
        <path d="M54.64,27.1a3.12,3.12,0,0,0-4.42,0L27.1,50.22,25,52.28a3.12,3.12,0,0,0,0,4.42l5.63,5.64a3.12,3.12,0,0,0,4.42,0L57.28,40.12,54.64,37.48V32.76A5.67,5.67,0,0,0,54.64,27.1Z" fill="url(#gold_gradient)"/>
      </g>
      
      {/* Curved Text */}
      <path id="curve" d="M 20 110 A 60 60 0 0 1 140 110" fill="transparent" />
      <text width="500" style={{ fontSize: '24px', fontWeight: 'bold', fill: 'url(#gold_gradient)'}} filter="url(#glow)">
        <textPath xlinkHref="#curve" startOffset="50%" textAnchor="middle">
          KALI DOJO
        </textPath>
      </text>

      <path id="curve2" d="M 30 135 A 50 50 0 0 1 130 135" fill="transparent" />
      <text width="500" style={{ fontSize: '18px', fontWeight: 'bold', fill: 'url(#gold_gradient)'}} filter="url(#glow)">
        <textPath xlinkHref="#curve2" startOffset="50%" textAnchor="middle">
          GIMNASIO
        </textPath>
      </text>
    </svg>
  );
}
