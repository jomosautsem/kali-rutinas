import Image from 'next/image';
import { cn } from '@/lib/utils';
import * as React from 'react';

export function Logo({
  className,
  width = 160,
  height = 160,
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement> & {
  width?: number;
  height?: number;
}) {
  return (
    <Image
      src="/images/logo.png"
      alt="Kali Dojo Logo"
      width={width}
      height={height}
      className={cn(
        'object-contain transition-all duration-300 ease-in-out',
        '[filter:drop-shadow(0_0_8px_hsl(var(--primary)/0.7))] hover:[filter:drop-shadow(0_0_12px_hsl(var(--primary)/0.9))]',
        className
        )}
      priority
      {...props}
    />
  );
}
