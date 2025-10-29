// Página 404 para Neurolex
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-primary/5 via-background to-background p-4">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <h1 className="text-9xl font-bold font-mono text-primary mb-4">404</h1>
          <h2 className="text-3xl font-bold font-[Poppins] mb-2">
            Página no encontrada
          </h2>
          <p className="text-muted-foreground">
            Lo sentimos, la página que buscas no existe o ha sido movida.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/">
            <Button size="lg" data-testid="button-home">
              <Home className="h-4 w-4 mr-2" />
              Volver al Inicio
            </Button>
          </Link>
          <Link href="/propuestas">
            <Button size="lg" variant="outline" data-testid="button-explore">
              <Search className="h-4 w-4 mr-2" />
              Explorar Propuestas
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
