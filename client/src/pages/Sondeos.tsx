// Página de sondeos y encuestas para Neurolex
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PollCard } from "@/components/PollCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Clock, TrendingUp } from "lucide-react";

import { useQuery, useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Sondeos() {
  const { toast } = useToast();
  
  // Obtener userId del localStorage
  const userId = localStorage.getItem("userId");

  // Cargar datos del usuario si está autenticado
  const { data: user } = useQuery({
    queryKey: ["/api/users/me", userId],
    enabled: !!userId,
  });

  // Cargar balance de tokens si está autenticado
  const { data: tokensBalance } = useQuery({
    queryKey: ["/api/tokens", userId],
    enabled: !!userId,
  });

  // Cargar sondeos del backend
  const { data: allPolls = [], isLoading } = useQuery({
    queryKey: ["/api/polls"],
  });

  // Cargar sondeos en los que el usuario ya votó
  const { data: votedPollIds = [] } = useQuery({
    queryKey: ["/api/polls/user", userId, "voted"],
    enabled: !!userId,
  });

  // Mutación para votar
  const voteMutation = useMutation({
    mutationFn: async ({ pollId, optionId }: { pollId: string; optionId: string }) => {
      if (!userId) {
        throw new Error("Debes iniciar sesión para votar");
      }
      return apiRequest("POST", `/api/polls/${pollId}/vote`, { userId, optionId });
    },
    onSuccess: () => {
      // Invalidar queries para actualizar los datos
      queryClient.invalidateQueries({ queryKey: ["/api/polls"] });
      queryClient.invalidateQueries({ queryKey: ["/api/polls/user", userId, "voted"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tokens", userId] });
      queryClient.invalidateQueries({ queryKey: ["/api/users/me", userId] });
      
      toast({
        title: "¡Voto registrado!",
        description: "Has ganado 10 TP y 5 puntos de karma",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error al votar",
        description: error.message || "No se pudo registrar tu voto",
        variant: "destructive",
      });
    },
  });

  // Función para manejar el voto
  const handleVote = (pollId: string, optionId: string) => {
    if (!userId) {
      toast({
        title: "Inicia sesión",
        description: "Debes iniciar sesión para votar en sondeos",
        variant: "destructive",
      });
      return;
    }
    voteMutation.mutate({ pollId, optionId });
  };

  // Filtrar sondeos activos y cerrados basándose en la fecha de finalización
  const now = new Date();
  const sondeosActivos = allPolls.filter((poll: any) => {
    // Si no tiene fechaFin, está siempre activo
    if (!poll.fechaFin) return true;
    // Si tiene fechaFin, verificar que sea mayor a ahora
    return new Date(poll.fechaFin) > now;
  });
  const sondeosCerrados = allPolls.filter((poll: any) => {
    // Si no tiene fechaFin, nunca está cerrado
    if (!poll.fechaFin) return false;
    // Si tiene fechaFin, está cerrado si es menor o igual a ahora
    return new Date(poll.fechaFin) <= now;
  });

  const estadisticasGenerales = [
    { label: "Sondeos Activos", valor: String(sondeosActivos.length), icon: BarChart3, color: "text-blue-600" },
    { label: "Sondeos Cerrados", valor: String(sondeosCerrados.length), icon: Clock, color: "text-gray-600" },
    { label: "Total de Sondeos", valor: String(allPolls.length), icon: TrendingUp, color: "text-purple-600" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={user} tokensBalance={tokensBalance} />

      <main className="flex-1 bg-background">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold font-[Poppins] mb-2" data-testid="text-page-title">
              Sondeos y Encuestas
            </h1>
            <p className="text-muted-foreground">
              Participa en encuestas ciudadanas y ayuda a tomar decisiones informadas
            </p>
          </div>

          {/* Estadísticas generales */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {estadisticasGenerales.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {stat.label}
                    </CardTitle>
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </CardHeader>
                  <CardContent>
                    <div className={`text-3xl font-bold font-mono ${stat.color}`}>
                      {stat.valor}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Sondeos Activos */}
          <section className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <h2 className="text-2xl font-semibold font-[Poppins]">
                Sondeos Activos
              </h2>
              <Badge variant="default" className="font-mono">
                {sondeosActivos.length}
              </Badge>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : sondeosActivos.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No hay sondeos activos en este momento</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {sondeosActivos.map((sondeo: any) => (
                  <PollCard 
                    key={sondeo.id} 
                    {...sondeo} 
                    hasVoted={votedPollIds.includes(sondeo.id)}
                    onVote={handleVote}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Sondeos Cerrados */}
          <section>
            <div className="flex items-center gap-2 mb-6">
              <h2 className="text-2xl font-semibold font-[Poppins]">
                Resultados de Sondeos Anteriores
              </h2>
              <Badge variant="secondary" className="font-mono">
                {sondeosCerrados.length}
              </Badge>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : sondeosCerrados.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No hay sondeos cerrados disponibles</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {sondeosCerrados.map((sondeo: any) => (
                  <PollCard 
                    key={sondeo.id} 
                    {...sondeo} 
                    hasVoted={true}
                    onVote={handleVote}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Información sobre participación */}
          <Card className="mt-12">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                ¿Por qué participar en sondeos?
              </CardTitle>
              <CardDescription>
                Tu opinión ayuda a tomar mejores decisiones
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-md bg-muted">
                  <h3 className="font-semibold mb-2">Gana Tokens TP</h3>
                  <p className="text-sm text-muted-foreground">
                    Obtén 10 TP por cada sondeo en el que participes
                  </p>
                </div>
                <div className="p-4 rounded-md bg-muted">
                  <h3 className="font-semibold mb-2">Influye en Decisiones</h3>
                  <p className="text-sm text-muted-foreground">
                    Los resultados se usan para guiar políticas públicas
                  </p>
                </div>
                <div className="p-4 rounded-md bg-muted">
                  <h3 className="font-semibold mb-2">Transparencia Total</h3>
                  <p className="text-sm text-muted-foreground">
                    Todos los resultados son públicos y verificables
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
