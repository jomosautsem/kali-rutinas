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
      className={cn('object-contain', className)}
      priority
      {...props}
    />
  );
}
