import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';

export default function Home() {
  return (
    <div className="relative flex flex-col min-h-screen bg-black text-white overflow-hidden">
      <div
        className="absolute inset-0 z-0 bg-no-repeat"
        style={{
          backgroundImage: `
            radial-gradient(circle at 15% 30%, hsla(var(--primary) / 0.3), transparent 30%),
            radial-gradient(circle at 85% 65%, hsla(var(--primary) / 0.25), transparent 40%)
          `,
        }}
      ></div>

      <header className="px-4 lg:px-6 h-20 flex items-center z-10">
        <Link href="#" className="flex items-center justify-center" prefetch={false}>
          <Logo className="h-16 w-16" />
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6 items-center">
          <Link
            href="/login"
            className="text-sm font-medium hover:text-primary transition-colors"
            prefetch={false}
          >
            Iniciar Sesión
          </Link>
          <Button asChild className="rounded-full font-bold">
            <Link href="/register" prefetch={false}>
              Registrarse
            </Link>
          </Button>
        </nav>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 z-10">
        <div className="relative mb-8">
            <div className="absolute -top-12 -left-1/2 w-[200%] h-[200%] bg-primary/20 blur-3xl rounded-full"></div>
             <div className="relative flex items-center justify-center w-32 h-32 md:w-40 md:h-40">
                 <Logo className="h-full w-full" />
            </div>
        </div>


        <h1 className="text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl font-headline text-shadow"
            style={{ textShadow: '0 0 15px hsla(var(--primary) / 0.8)' }}>
          FORJA TU MEJOR VERSIÓN
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-neutral-300">
          Planes de entrenamiento y nutrición personalizados, alcanza tus metas de fitness con la guía experta de Kali Dojo Gym.
        </p>
      </main>
    </div>
  );
}
