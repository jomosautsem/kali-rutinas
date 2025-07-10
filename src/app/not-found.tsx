import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
      <h1 className="text-8xl font-bold text-primary font-headline">404</h1>
      <p className="mt-4 text-2xl font-medium text-foreground">Página No Encontrada</p>
      <p className="mt-2 text-muted-foreground">
        Lo sentimos, la página que buscas no existe o ha sido movida.
      </p>
      <Button asChild className="mt-8">
        <Link href="/">Volver a la Página de Inicio</Link>
      </Button>
    </div>
  )
}
