
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { ArrowRight, BarChart2, Sparkles, UserCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';

const features = [
    {
        icon: <Sparkles className="h-8 w-8 text-primary" />,
        title: "Planes con IA",
        description: "Genera planes efectivos basados en tus metas, experiencia y datos biométricos.",
    },
    {
        icon: <UserCheck className="h-8 w-8 text-primary" />,
        title: "Revisión de Entrenador",
        description: "Cada plan generado por IA es revisado y aprobado por un entrenador experto para garantizar calidad y seguridad.",
    },
    {
        icon: <BarChart2 className="h-8 w-8 text-primary" />,
        title: "Seguimiento de Progreso",
        description: "Registra tus levantamientos y visualiza tu progreso con gráficos intuitivos y récords personales.",
    },
];

const testimonials = [
    {
        quote: "La combinación de IA y un entrenador real es increíble. ¡He progresado más en 3 meses que en el último año!",
        name: "Carlos M.",
        role: "Cliente Satisfecho",
        avatar: "https://placehold.co/100x100.png"
    },
    {
        quote: "Finalmente un plan que se adapta a mis horarios y a mis metas. Ver mi progreso en los gráficos es súper motivador.",
        name: "Ana G.",
        role: "Entusiasta del Fitness",
        avatar: "https://placehold.co/100x100.png"
    },
    {
        quote: "La app es muy fácil de usar y el plan es desafiante pero alcanzable. ¡Recomendado al 100%!",
        name: "Javier R.",
        role: "Miembro del Dojo",
        avatar: "https://placehold.co/100x100.png"
    }
];


export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground overflow-x-hidden">
      <div
        className="absolute inset-0 z-0 opacity-40"
        style={{
          backgroundImage: `
            radial-gradient(circle at 15% 30%, hsla(var(--primary) / 0.2), transparent 30%),
            radial-gradient(circle at 85% 65%, hsla(var(--accent) / 0.15), transparent 40%)
          `,
        }}
      ></div>

      <header className="px-4 lg:px-6 h-20 flex items-center z-10">
        <Link href="#" className="flex items-center justify-center" prefetch={false}>
          <Logo className="h-16 w-16" width={64} height={64} />
          <span className="sr-only">Dojo Dynamics</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6 items-center">
          <Button variant="ghost" asChild>
            <Link href="/login" prefetch={false}>
                Iniciar Sesión
            </Link>
          </Button>
          <Button asChild className="rounded-full font-bold hidden sm:flex">
            <Link href="/register" prefetch={false}>
              Registrarse
            </Link>
          </Button>
        </nav>
      </header>

      <main className="flex-1 z-10">
        {/* Hero Section */}
        <section className="flex flex-col items-center justify-center text-center px-4 py-20 md:py-32">
            <div className="relative mb-8">
                <div className="absolute -top-12 -left-1/2 w-[200%] h-[200%] bg-primary/10 blur-3xl rounded-full animate-pulse"></div>
                <div className="relative flex items-center justify-center w-32 h-32 md:w-40 md:h-40">
                    <Logo className="h-full w-full" width={160} height={160} />
                </div>
            </div>

            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl font-headline text-shadow"
                style={{ textShadow: '0 0 20px hsla(var(--primary) / 0.5)' }}>
              Forja tu Mejor Versión
            </h1>
            <p className="mt-6 max-w-3xl text-lg text-muted-foreground">
              Planes de entrenamiento inteligentes y personalizados. Deja que nuestra IA y entrenadores expertos te guíen hacia tus metas.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
                <Button asChild size="lg" className="rounded-full font-bold text-base">
                    <Link href="/register">
                        Comienza tu Transformación <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                </Button>
            </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 md:py-24 bg-secondary/30">
            <div className="container mx-auto px-4">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-3xl font-bold font-headline sm:text-4xl">Tu Gimnasio, Más Inteligente</h2>
                    <p className="mt-4 text-muted-foreground">
                        Combinamos tecnología de punta con la supervisión de expertos para darte la mejor experiencia de entrenamiento.
                    </p>
                </div>
                <div className="mt-12 grid gap-8 md:grid-cols-3">
                    {features.map((feature, index) => (
                        <div key={index} className="flex flex-col items-center text-center p-6">
                            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mb-6">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-semibold font-headline">{feature.title}</h3>
                            <p className="mt-2 text-muted-foreground">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-16 md:py-24">
            <div className="container mx-auto px-4">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-3xl font-bold font-headline sm:text-4xl">Lo que dicen nuestros atletas</h2>
                     <p className="mt-4 text-muted-foreground">
                        Historias reales de personas que están alcanzando sus metas con Dojo Dynamics.
                    </p>
                </div>
                <div className="mt-12 grid gap-8 md:grid-cols-1 lg:grid-cols-3">
                    {testimonials.map((testimonial, index) => (
                        <Card key={index} className="bg-card/50">
                            <CardContent className="p-6 flex flex-col justify-between h-full">
                                <blockquote className="text-lg italic border-l-2 border-primary pl-4">
                                    "{testimonial.quote}"
                                </blockquote>
                                <div className="mt-6 flex items-center gap-4">
                                    <Image 
                                        src={testimonial.avatar} 
                                        alt={testimonial.name}
                                        width={48}
                                        height={48}
                                        className="rounded-full"
                                        data-ai-hint="person face"
                                    />
                                    <div>
                                        <p className="font-semibold">{testimonial.name}</p>
                                        <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
      </main>

      <footer className="w-full py-8 border-t border-border/50 bg-background z-10">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
                <Logo className="h-12 w-12" width={48} height={48} />
                <span className="font-bold text-lg font-headline">Dojo Dynamics</span>
            </div>
            <nav className="flex gap-6 text-sm text-muted-foreground">
                <Link href="#features" className="hover:text-primary transition-colors">Características</Link>
                <Link href="#testimonials" className="hover:text-primary transition-colors">Testimonios</Link>
                <Link href="/login" className="hover:text-primary transition-colors">Iniciar Sesión</Link>
            </nav>
            <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} Dojo Dynamics. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
