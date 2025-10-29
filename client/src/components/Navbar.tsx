// Barra de navegación principal para la plataforma Neurolex
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Bell, Menu, User, Wallet, Shield } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import logoUrl from "@assets/Main logo_1761708286562.jpg";

interface NavbarProps {
  user?: {
    id: string;
    username: string;
    karmaTotal: number;
    isAdmin?: boolean;
  };
  tokensBalance?: {
    tokensParticipacion: number;
    tokensApoyo: number;
    tokensGobernanza: number;
  };
}

export function Navbar({ user, tokensBalance }: NavbarProps) {
  const [location] = useLocation();

  const navLinks = [
    { href: "/", label: "Inicio" },
    { href: "/noticias", label: "Noticias" },
    { href: "/propuestas", label: "Propuestas" },
    { href: "/sondeos", label: "Sondeos" },
    { href: "/informacion", label: "Información" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex h-16 md:h-20 items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 hover-elevate rounded-md px-2 py-1 -ml-2" data-testid="link-home">
            <img src={logoUrl} alt="Neurolex" className="h-10 w-10 md:h-12 md:w-12 rounded-md" />
            <span className="hidden sm:inline-block text-xl md:text-2xl font-bold font-[Poppins] bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Neurolex
            </span>
          </Link>

          {/* Navegación central - Desktop */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = location === link.href;
              return (
                <Link key={link.href} href={link.href}>
                  <Button
                    variant="ghost"
                    className={isActive ? "bg-accent" : ""}
                    data-testid={`link-${link.label.toLowerCase()}`}
                  >
                    {link.label}
                  </Button>
                </Link>
              );
            })}
          </div>

          {/* Acciones del usuario */}
          <div className="flex items-center gap-2">
            {user ? (
              <>
                {/* Tokens - Desktop */}
                {tokensBalance && (
                  <div className="hidden md:flex items-center gap-2 mr-2">
                    <Badge variant="secondary" className="font-mono text-xs" data-testid="badge-tokens-tp">
                      TP: {tokensBalance.tokensParticipacion}
                    </Badge>
                    <Badge variant="secondary" className="font-mono text-xs" data-testid="badge-tokens-ta">
                      TA: {tokensBalance.tokensApoyo}
                    </Badge>
                    <Badge variant="secondary" className="font-mono text-xs" data-testid="badge-tokens-tgr">
                      TGR: {tokensBalance.tokensGobernanza}
                    </Badge>
                  </div>
                )}

                {/* Notificaciones */}
                <Button variant="ghost" size="icon" data-testid="button-notifications">
                  <Bell className="h-5 w-5" />
                </Button>

                {/* Monedero */}
                <Link href="/monedero">
                  <Button variant="ghost" size="icon" data-testid="button-wallet">
                    <Wallet className="h-5 w-5" />
                  </Button>
                </Link>

                {/* Menú de usuario */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full" data-testid="button-user-menu">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {user.username.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col gap-1">
                        <p className="text-sm font-semibold">{user.username}</p>
                        <p className="text-xs text-muted-foreground font-mono">
                          Karma: {user.karmaTotal}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="cursor-pointer" data-testid="link-dashboard">
                        <User className="mr-2 h-4 w-4" />
                        Mi Panel
                      </Link>
                    </DropdownMenuItem>
                    {user.isAdmin && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="cursor-pointer" data-testid="link-admin-panel">
                          <Shield className="mr-2 h-4 w-4" />
                          <span className="font-semibold">Panel de Admin</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem asChild>
                      <Link href="/monedero" className="cursor-pointer" data-testid="link-wallet">
                        <Wallet className="mr-2 h-4 w-4" />
                        Monedero
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive cursor-pointer" data-testid="button-logout">
                      Cerrar Sesión
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" data-testid="button-login">
                    Iniciar Sesión
                  </Button>
                </Link>
                <Link href="/registro">
                  <Button data-testid="button-register">
                    Registrarse
                  </Button>
                </Link>
              </div>
            )}

            {/* Menú hamburguesa - Mobile */}
            <div className="lg:hidden">
              <Button variant="ghost" size="icon" data-testid="button-menu">
                <Menu className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
