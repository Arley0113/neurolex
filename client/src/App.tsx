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
import ComprarTokens from "@/pages/ComprarTokens";
import Admin from "@/pages/Admin";
import AdminNoticias from "@/pages/AdminNoticias";
import AdminPropuestas from "@/pages/AdminPropuestas";
import AdminSondeos from "@/pages/AdminSondeos";
import AdminDebates from "@/pages/AdminDebates";
import AdminUsuarios from "@/pages/AdminUsuarios";
import Noticias from "@/pages/Noticias";
import NoticiaDetalle from "@/pages/NoticiaDetalle";
import Propuestas from "@/pages/Propuestas";
import PropuestaDetalle from "@/pages/PropuestaDetalle";
import Sondeos from "@/pages/Sondeos";
import Foro from "@/pages/Foro";
import ForoDetalle from "@/pages/ForoDetalle";
import ForoNuevo from "@/pages/ForoNuevo";
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
      <Route path="/comprar-tokens" component={ComprarTokens} />
      
      {/* Panel de administrador */}
      <Route path="/admin" component={Admin} />
      <Route path="/admin/noticias" component={AdminNoticias} />
      <Route path="/admin/propuestas" component={AdminPropuestas} />
      <Route path="/admin/sondeos" component={AdminSondeos} />
      <Route path="/admin/debates" component={AdminDebates} />
      <Route path="/admin/usuarios" component={AdminUsuarios} />
      
      {/* Contenido principal */}
      <Route path="/noticias/:id" component={NoticiaDetalle} />
      <Route path="/noticias" component={Noticias} />
      <Route path="/propuestas/:id" component={PropuestaDetalle} />
      <Route path="/propuestas" component={Propuestas} />
      <Route path="/sondeos" component={Sondeos} />
      <Route path="/foro/nuevo" component={ForoNuevo} />
      <Route path="/foro/:id" component={ForoDetalle} />
      <Route path="/foro" component={Foro} />
      
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
