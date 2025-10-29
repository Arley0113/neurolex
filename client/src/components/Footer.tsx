// Footer para la plataforma Neurolex
import { Link } from "wouter";
import { Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Footer() {
  return (
    <footer className="border-t bg-card">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Información */}
          <div>
            <h3 className="font-bold text-lg mb-4 font-[Poppins]">Neurolex</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Plataforma de democracia digital para participación cívica y gobernanza comunitaria transparente.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" className="h-8 w-8" data-testid="button-social-twitter">
                <span className="sr-only">Twitter</span>
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8" data-testid="button-social-facebook">
                <span className="sr-only">Facebook</span>
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </Button>
            </div>
          </div>

          {/* Enlaces */}
          <div>
            <h4 className="font-semibold text-sm mb-4">Enlaces Rápidos</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/noticias" className="text-muted-foreground hover:text-foreground transition-colors">
                  Noticias
                </Link>
              </li>
              <li>
                <Link href="/propuestas" className="text-muted-foreground hover:text-foreground transition-colors">
                  Propuestas
                </Link>
              </li>
              <li>
                <Link href="/sondeos" className="text-muted-foreground hover:text-foreground transition-colors">
                  Sondeos
                </Link>
              </li>
              <li>
                <Link href="/informacion" className="text-muted-foreground hover:text-foreground transition-colors">
                  Información
                </Link>
              </li>
            </ul>
          </div>

          {/* Recursos */}
          <div>
            <h4 className="font-semibold text-sm mb-4">Recursos</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/contacto" className="text-muted-foreground hover:text-foreground transition-colors">
                  Contacto
                </Link>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  Preguntas Frecuentes
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  Términos de Servicio
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  Privacidad
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-semibold text-sm mb-4">Mantente Informado</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Recibe actualizaciones sobre nuevas propuestas y votaciones.
            </p>
            <div className="flex gap-2">
              <Input 
                type="email" 
                placeholder="tu@email.com" 
                className="h-9 text-sm"
                data-testid="input-newsletter"
              />
              <Button size="sm" data-testid="button-subscribe">
                Suscribir
              </Button>
            </div>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>© 2025 Neurolex. Todos los derechos reservados.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-foreground transition-colors">
              Política de Privacidad
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Términos de Uso
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
