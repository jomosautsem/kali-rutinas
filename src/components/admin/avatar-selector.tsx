
"use client"

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { getAvatars } from '@/lib/actions/get-avatars';
import { Skeleton } from '../ui/skeleton';
import { cn } from '@/lib/utils';
import { CheckCircle } from 'lucide-react';

type AvatarSelectorProps = {
  value: string;
  onChange: (value: string) => void;
};

export function AvatarSelector({ value, onChange }: AvatarSelectorProps) {
  const [avatars, setAvatars] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchAvatars() {
      setIsLoading(true);
      const avatarUrls = await getAvatars();
      setAvatars(avatarUrls);
      setIsLoading(false);
    }
    fetchAvatars();
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-4 gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square rounded-full" />
        ))}
      </div>
    );
  }
  
  if (avatars.length === 0) {
      return <p className="text-sm text-muted-foreground">No se encontraron avatares en la carpeta /public/images/avatars.</p>
  }

  return (
    <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
      {avatars.map((avatarUrl) => {
        const isSelected = value === avatarUrl;
        return (
          <button
            key={avatarUrl}
            type="button"
            onClick={() => onChange(avatarUrl)}
            className={cn(
              'relative aspect-square rounded-full overflow-hidden border-2 transition-all',
              isSelected ? 'border-primary ring-2 ring-primary/50' : 'border-transparent hover:border-primary/50'
            )}
          >
            <Image
              src={avatarUrl}
              alt="Avatar"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 20vw, 10vw"
            />
             {isSelected && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-white" />
                </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
