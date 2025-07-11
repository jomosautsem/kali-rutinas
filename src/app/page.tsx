import Link from 'next/link';
import { Button } from '@/components/ui/button';

const OmIcon = () => (
  <svg
    width="1em"
    height="1em"
    viewBox="0 0 256 256"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M127.81,42.12a88,88,0,0,0-82.5,60.89,4,4,0,0,0,1,3.8,4.1,4.1,0,0,0,3.83.93,88,88,0,0,1,80.59-32.88c43.6,0,79.52,32.42,85.24,73.49,2.5,18-1.5,35.13-11.83,49.2-12,16.29-31.2,26.21-52,26.21-23.41,0-43.2-13.43-52.49-33.15a4,4,0,0,0-4.48-2.67,4,4,0,0,0-2.67,4.48c10.43,21.82,33.13,37.34,59.64,37.34,23.33,0,44.83-11.45,58.29-29.62s15.46-39.3,12.72-59.21C215.1,80,175.75,42.12,127.81,42.12Zm-29.17,90.2a28,28,0,1,1,32.26-27.64A28.1,28.1,0,0,1,98.64,132.32Zm8-52.54a20,20,0,1,0,22.7,20A20,20,0,0,0,106.67,79.78ZM59.4,70.52a4,4,0,0,0-5.46,1.44C33.5,104.1,38.63,143.5,59.4,70.52Z"
    />
  </svg>
);

const Logo = () => (
  <div className="flex items-center justify-center bg-black rounded-full w-12 h-12 border-2 border-primary">
    <div className="text-center text-primary font-bold">
      <OmIcon />
    </div>
  </div>
);

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
          <Logo />
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
            <div className="relative flex items-center justify-center bg-black rounded-full w-32 h-32 border-4 border-primary shadow-lg shadow-primary/20">
              <div className="text-center text-primary">
                  <span className="text-xs font-semibold tracking-wider">KALI</span>
                  <OmIcon />
                  <span className="text-xs font-semibold tracking-wider">DOJO</span>
              </div>
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