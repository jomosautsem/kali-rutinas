import Image from 'next/image';
import { cn } from '@/lib/utils';
import * as React from 'react';

// This component now uses the actual logo image provided by the user.
// The image is stored in the /public/images directory.
export function Logo({ className, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) {
  return (
    <div className={cn('relative', className)} {...props}>
        <Image
          src="/images/logo.png"
          alt="Kali Dojo Gimnasio Logo"
          layout="fill"
          objectFit="contain"
          priority
        />
    </div>
  );
}
