// Panel de control personalizable para usuarios de Neurolex
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { TokenCard } from "@/components/TokenCard";
import { ProposalCard } from "@/components/ProposalCard";
import { NewsCard } from "@/components/NewsCard";
import { PollCard } from "@/components/PollCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, Award, Clock, Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useLocation } from "wouter";

export default function Dashboard() {
  const [, setLocation] = useLocation();

  // Obtener userId del localStorage
  const userId = localStorage.getItem("userId");

  // Redirigir al login si no está autenticado
  useEffect(() => {
    if (!userId) {
      setLocation("/login");
    }
  }, [userId, setLocation]);

  // Cargar datos del usuario
  const { data: user, isLoading: loadingUser } = useQuery({
    queryKey: ["/api/users/me", userId],
    enabled: !!userId,
  });

  // Cargar balance de tokens
  const { data: tokensBalance, isLoading: loadingTokens } = useQuery({
    queryKey: ["/api/tokens", userId],
    enabled: !!userId,
  });

  // Cargar propuestas
  const { data: propuestas = [], isLoading: loadingPropuestas } = useQuery({
    queryKey: ["/api/proposals"],
  });

  // Cargar noticias
  const { data: noticias = [], isLoading: loadingNoticias } = useQuery({
    queryKey: ["/api/news"],
  });

  // Cargar sondeos
  const { data: sondeos = [], isLoading: loadingSondeos } = useQuery({
    queryKey: ["/api/polls"],
  });

  if (loadingUser || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const progressToNextLevel = ((user.karmaTotal % 500) / 500) * 100;

  // Tomar las primeras 2 propuestas
  const propuestasActivas = propuestas.slice(0, 2);

  // Tomar la primera noticia
  const noticiasRecientes = noticias.slice(0, 1);

  // Tomar el primer sondeo activo
  const sondeoActivo = sondeos.length > 0 ? sondeos[0] : null;

  // Insignias (datos estáticos por ahora)
  const insignias = [
    { nombre: "Votante Fundador", obtenida: true },
    { nombre: "Legislador Ciudadano", obtenida: true },
    { nombre: "Experto en Debate", obtenida: false },
    { nombre: "Influencer Cívico", obtenida: false },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={user} tokensBalance={tokensBalance} />

      <main className="flex-1 bg-background">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8">
          {/* Header del Dashboard */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold font-[Poppins] mb-2" data-testid="text-dashboard-title">
              Bienvenido, {user.username}
            </h1>
            <p className="text-muted-foreground">
              Aquí está tu resumen de actividad y contenido personalizado
            </p>
          </div>

          {/* Grid de Widgets */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Columna izquierda - 2/3 */}
            <div className="lg:col-span-2 space-y-6">
              {/* Mi Cartera - Tokens */}
              <section>
                <h2 className="text-xl font-semibold font-[Poppins] mb-4">
                  Mi Cartera
                </h2>
                {loadingTokens ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                      <Card key={i} className="h-32 flex items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <TokenCard
                      tipo="TP"
                      cantidad={tokensBalance?.tokensParticipacion || 0}
                      descripcion="Ganados por participación"
                    />
                    <TokenCard
                      tipo="TA"
                      cantidad={tokensBalance?.tokensApoyo || 0}
                      descripcion="Disponibles para apoyo"
                    />
                    <TokenCard
                      tipo="TGR"
                      cantidad={tokensBalance?.tokensGobernanza || 0}
                      descripcion="Poder de gobernanza"
                    />
                  </div>
                )}
              </section>

              {/* Propuestas Activas */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold font-[Poppins]">
                    Propuestas que te pueden interesar
                  </h2>
                  <Button variant="ghost" size="sm" onClick={() => setLocation("/propuestas")} data-testid="button-view-all-proposals">
                    Ver todas
                  </Button>
                </div>
                {loadingPropuestas ? (
                  <div className="grid grid-cols-1 gap-4">
                    {[1, 2].map((i) => (
                      <Card key={i} className="h-48 flex items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      </Card>
                    ))}
                  </div>
                ) : propuestasActivas.length === 0 ? (
                  <Card className="p-8 text-center text-muted-foreground">
                    No hay propuestas disponibles
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {propuestasActivas.map((propuesta: any) => (
                      <ProposalCard 
                        key={propuesta.id} 
                        {...propuesta}
                        autorNombre={propuesta.autorNombre || "Usuario"}
                        numComentarios={0}
                      />
                    ))}
                  </div>
                )}
              </section>

              {/* Sondeo Activo */}
              {sondeoActivo && (
                <section>
                  <h2 className="text-xl font-semibold font-[Poppins] mb-4">
                    Sondeo Activo
                  </h2>
                  {loadingSondeos ? (
                    <Card className="h-64 flex items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </Card>
                  ) : (
                    <PollCard {...sondeoActivo} hasVoted={false} />
                  )}
                </section>
              )}
            </div>

            {/* Columna derecha - 1/3 */}
            <div className="space-y-6">
              {/* Mi Karma */}
              <Card data-testid="card-karma">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Mi Karma
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-4">
                    <p className="text-5xl font-bold font-mono text-primary mb-2" data-testid="text-karma-total">
                      {user.karmaTotal}
                    </p>
                    <p className="text-sm text-muted-foreground">Puntos totales</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Nivel {user.nivelGamificacion}</span>
                      <span className="font-semibold">Nivel {user.nivelGamificacion + 1}</span>
                    </div>
                    <Progress value={progressToNextLevel} className="h-2" />
                    <p className="text-xs text-muted-foreground text-center">
                      {500 - (user.karmaTotal % 500)} puntos para el siguiente nivel
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Insignias */}
              <Card data-testid="card-badges">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" />
                    Insignias
                  </CardTitle>
                  <CardDescription>
                    {insignias.filter(i => i.obtenida).length} de {insignias.length} desbloqueadas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {insignias.map((insignia, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-md border text-center ${
                          insignia.obtenida
                            ? "bg-primary/10 border-primary/20"
                            : "bg-muted border-border opacity-50"
                        }`}
                        data-testid={`badge-item-${index}`}
                      >
                        <Award className={`h-6 w-6 mx-auto mb-1 ${insignia.obtenida ? "text-primary" : "text-muted-foreground"}`} />
                        <p className="text-xs font-medium">{insignia.nombre}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Noticias Recientes */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold font-[Poppins]">
                    Noticias Recientes
                  </h2>
                  <Button variant="ghost" size="sm" onClick={() => setLocation("/noticias")} data-testid="button-view-all-news">
                    Ver todas
                  </Button>
                </div>
                {loadingNoticias ? (
                  <Card className="h-32 flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </Card>
                ) : noticiasRecientes.length === 0 ? (
                  <Card className="p-6 text-center text-sm text-muted-foreground">
                    No hay noticias recientes
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {noticiasRecientes.map((noticia: any) => (
                      <NewsCard key={noticia.id} {...noticia} />
                    ))}
                  </div>
                )}
              </section>

              {/* Actividad Próxima */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    Próximas Votaciones
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3 p-3 rounded-md bg-muted">
                    <div className="flex-shrink-0">
                      <Badge variant="default">3 días</Badge>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Presupuesto Municipal 2025</p>
                      <p className="text-xs text-muted-foreground">Votación vinculante</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-md bg-muted">
                    <div className="flex-shrink-0">
                      <Badge variant="secondary">7 días</Badge>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Reforma del transporte público</p>
                      <p className="text-xs text-muted-foreground">Sondeo ciudadano</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
