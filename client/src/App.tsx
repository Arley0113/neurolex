// Aplicación principal de Neurolex - Plataforma de Gobernanza y Participación Cívica
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

// Importar todas las páginas
import Home from "@/pages/Home";
import Register from "@/pages/Register";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Monedero from "@/pages/Monedero";
import Noticias from "@/pages/Noticias";
import Propuestas from "@/pages/Propuestas";
import Sondeos from "@/pages/Sondeos";
import Informacion from "@/pages/Informacion";
import Contacto from "@/pages/Contacto";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      {/* Página de inicio */}
      <Route path="/" component={Home} />
      
      {/* Autenticación */}
      <Route path="/registro" component={Register} />
      <Route path="/login" component={Login} />
      
      {/* Dashboard de usuario */}
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/monedero" component={Monedero} />
      
      {/* Contenido principal */}
      <Route path="/noticias" component={Noticias} />
      <Route path="/propuestas" component={Propuestas} />
      <Route path="/sondeos" component={Sondeos} />
      
      {/* Información y contacto */}
      <Route path="/informacion" component={Informacion} />
      <Route path="/contacto" component={Contacto} />
      
      {/* 404 - Página no encontrada */}
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
