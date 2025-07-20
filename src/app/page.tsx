
"use client"

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { ArrowRight, BarChart2, Sparkles, UserCheck, Instagram } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import { motion } from 'framer-motion';

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

const SpotifyIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor" {...props}>
        <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2m4.985 13.918a.5.5 0 0 1-.69.158c-2.73-1.67-6.18-2.07-10.22-1.13a.5.5 0 0 1-.55-.443.5.5 0 0 1 .444-.55c4.34-.99 8.04-.55 11.01 1.25a.5.5 0 0 1 .158.689m.35-3.21a.626.626 0 0 1-.853.2c-3.15-1.93-7.26-2.5-11.45-1.37a.625.625 0 0 1-.69-.609.625.625 0 0 1 .61-.69c4.56-1.22 8.94-.6 12.37 1.49a.62.62 0 0 1 .2 1m.03-3.37a.75.75 0 0 1-1.02.24c-3.5-2.18-9.04-2.77-13.06-1.52a.75.75 0 0 1-.82-.68.75.75 0 0 1 .68-.82c4.37-1.32 10.32-.7 14.18 1.7a.75.75 0 0 1 .24 1.02"/>
    </svg>
);


const TikTokIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="0" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M12.52.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-1.06-.63-1.9-1.47-2.46-2.51-1.86-3.31-.31-7.36 2.45-9.63 1.1-1.02 2.37-1.57 3.72-1.82 1.23-.26 2.48-.25 3.71-.25v4.03c-1.11 0-2.22-.02-3.33-.02-1.35.08-2.67.68-3.52 1.61-1.14 1.23-1.04 3.04.23 4.16.65.57 1.43.9 2.27.99 1.02.12 2.05-.15 2.93-.66.97-.6 1.6-1.47 1.9-2.52.34-1.21.34-2.45.34-3.68v-4.03H12.52z"/>
    </svg>
);


const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="0" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
);


export default function Home() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
      },
    },
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground overflow-x-hidden relative">
      <div className="aurora-bg"></div>

      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="px-4 lg:px-6 h-20 flex items-center z-10 bg-background/30 backdrop-blur-lg sticky top-0 border-b border-border/50">
        <Link href="#" className="flex items-center justify-center gap-2" prefetch={false}>
          <Logo className="h-12 w-12 text-primary" width={48} height={48} />
          <span className="font-bold text-lg font-headline">Dojo Dynamics</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6 items-center">
          <Button variant="ghost" asChild>
            <Link href="/login" prefetch={false}>
                Iniciar Sesión
            </Link>
          </Button>
          <Button asChild className="font-bold hidden sm:flex shadow-lg shadow-primary/20">
            <Link href="/register" prefetch={false}>
              Registrarse
            </Link>
          </Button>
        </nav>
      </motion.header>

      <main className="flex-1 z-10">
        {/* Hero Section */}
        <motion.section 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center justify-center text-center px-4 py-20 md:py-32">
            <motion.div variants={itemVariants} className="relative mb-8">
                <div className="relative flex items-center justify-center w-32 h-32 md:w-40 md:h-40">
                    <Logo className="h-full w-full" width={160} height={160} />
                </div>
            </motion.div>

            <motion.h1 
                variants={itemVariants}
                className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl font-headline"
                style={{ textShadow: '0 0 30px hsla(var(--primary) / 0.5)' }}>
              Forja tu Mejor Versión
            </motion.h1>
            <motion.p 
                variants={itemVariants}
                className="mt-6 max-w-3xl text-lg text-muted-foreground">
              Planes de entrenamiento inteligentes y personalizados por Kali Gym e impulsados por nuestra IA.
            </motion.p>
            <motion.div 
                variants={itemVariants}
                className="mt-10 flex flex-col sm:flex-row items-center gap-4">
                <Button asChild size="lg" className="font-bold text-base shadow-lg shadow-primary/30">
                    <Link href="/register">
                        Comienza tu Transformación <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                </Button>
            </motion.div>
        </motion.section>

        {/* Features Section */}
        <section id="features" className="py-16 md:py-24 bg-card/50 backdrop-blur-sm">
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              className="container mx-auto px-4">
                <motion.div variants={itemVariants} className="max-w-3xl mx-auto text-center">
                    <h2 className="text-3xl font-bold font-headline sm:text-4xl">Tu Gimnasio, Más Inteligente</h2>
                    <p className="mt-4 text-muted-foreground">
                        Combinamos tecnología de punta con la supervisión de expertos para darte la mejor experiencia de entrenamiento.
                    </p>
                </motion.div>
                <motion.div 
                  variants={containerVariants}
                  className="mt-12 grid gap-8 md:grid-cols-3">
                    {features.map((feature, index) => (
                        <motion.div variants={itemVariants} key={index} className="flex flex-col items-center text-center p-6">
                            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mb-6">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-semibold font-headline">{feature.title}</h3>
                            <p className="mt-2 text-muted-foreground">{feature.description}</p>
                        </motion.div>
                    ))}
                </motion.div>
            </motion.div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-16 md:py-24">
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              className="container mx-auto px-4">
                <motion.div variants={itemVariants} className="max-w-3xl mx-auto text-center">
                    <h2 className="text-3xl font-bold font-headline sm:text-4xl">Lo que dicen nuestros atletas</h2>
                     <p className="mt-4 text-muted-foreground">
                        Historias reales de personas que están alcanzando sus metas con Dojo Dynamics.
                    </p>
                </motion.div>
                <motion.div 
                  variants={containerVariants}
                  className="mt-12 grid gap-8 md:grid-cols-1 lg:grid-cols-3">
                    {testimonials.map((testimonial, index) => (
                        <motion.div variants={itemVariants} key={index}>
                            <Card className="bg-card/50 backdrop-blur-sm border-border/50 h-full">
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
                        </motion.div>
                    ))}
                </motion.div>
            </motion.div>
        </section>
      </main>

      <footer className="w-full py-8 border-t border-border/50 bg-card/30 backdrop-blur-sm z-10">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
                <Logo className="h-10 w-10 text-primary" width={40} height={40} />
                <span className="font-bold text-lg font-headline">Dojo Dynamics</span>
            </div>
             <div className="flex gap-4">
                <Link href="https://open.spotify.com/playlist/3Rj37VchWdvhhl1cPhQDs3?si=X6Ke0olDSQaT4h0SigrkEw&pi=nhfWs-OpSeiJV" target="_blank" rel="noopener noreferrer" aria-label="Spotify" className="text-muted-foreground hover:text-primary transition-colors">
                    <SpotifyIcon className="h-6 w-6" />
                </Link>
                <Link href="https://tiktok.com/@kali.centro.depor" target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="text-muted-foreground hover:text-primary transition-colors">
                    <TikTokIcon className="h-6 w-6" />
                </Link>
                <Link href="https://www.instagram.com/invites/contact/?utm_source=ig_contact_invite&utm_medium=copy_link&utm_content=v1925ys" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-muted-foreground hover:text-primary transition-colors">
                    <Instagram className="h-6 w-6" />
                </Link>
                <Link href="https://www.facebook.com/share/1C82N1B6yk/" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-muted-foreground hover:text-primary transition-colors">
                    <FacebookIcon className="h-6 w-6" />
                </Link>
            </div>
            <p className="text-sm text-muted-foreground">&copy; 2025 Copyright Desarrollado por KaliTeamDeveloper.</p>
        </div>
      </footer>
    </div>
  );
}
