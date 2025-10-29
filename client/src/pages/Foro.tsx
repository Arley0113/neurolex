import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { DebateCard, type DebateConAutor } from "@/components/DebateCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, TrendingUp, MessageSquare } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Link } from "wouter";

export default function Foro() {
  const userId = localStorage.getItem("userId");

  const { data: user } = useQuery({
    queryKey: ["/api/users/me", userId],
    enabled: !!userId,
  });

  const { data: tokensBalance } = useQuery({
    queryKey: ["/api/tokens", userId],
    enabled: !!userId,
  });

  const { data: debates = [], isLoading: debatesLoading } = useQuery<DebateConAutor[]>({
    queryKey: ["/api/debates"],
  });

  const debatesTrending = debates
    .sort((a, b) => (b.numRespuestas || 0) - (a.numRespuestas || 0))
    .slice(0, 3);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={user} tokensBalance={tokensBalance} />

      <main className="flex-1 bg-background">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-start justify-between mb-8 gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold font-[Poppins] mb-2" data-testid="text-page-title">
                Foro de Debates
              </h1>
              <p className="text-muted-foreground">
                Participa en discusiones sobre temas políticos y sociales
              </p>
            </div>
            <Link href="/foro/nuevo">
              <Button className="flex-shrink-0" data-testid="button-create-debate">
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Debate
              </Button>
            </Link>
          </div>

          {/* Barra de búsqueda */}
          <div className="relative mb-8">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar debates..."
              className="pl-10"
              data-testid="input-search-debates"
            />
          </div>

          {/* Layout: Feed principal + Sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Feed principal */}
            <div className="lg:col-span-2 space-y-4">
              {debatesLoading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : debates.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No hay debates disponibles</p>
                </div>
              ) : (
                debates.map((debate) => (
                  <DebateCard key={debate.id} {...debate} />
                ))
              )}

              {/* Paginación */}
              <div className="mt-8 flex justify-center gap-2">
                <Button variant="outline" disabled data-testid="button-prev-page">
                  Anterior
                </Button>
                <Button variant="default">1</Button>
                <Button variant="outline">2</Button>
                <Button variant="outline">3</Button>
                <Button variant="outline" data-testid="button-next-page">
                  Siguiente
                </Button>
              </div>
            </div>

            {/* Sidebar derecho */}
            <div className="space-y-6">
              {/* Debates Trending */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Debates Populares
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {debatesTrending.map((debate, index) => (
                    <Link key={debate.id} href={`/foro/${debate.id}`}>
                      <div
                        className="flex items-start gap-3 p-2 rounded-lg hover-elevate cursor-pointer"
                        data-testid={`trending-debate-${index + 1}`}
                      >
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-xs font-bold text-primary">{index + 1}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium line-clamp-2 mb-1">{debate.titulo}</p>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MessageSquare className="h-3 w-3" />
                            <span>{debate.numRespuestas} respuestas</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </CardContent>
              </Card>

              {/* Categorías */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Categorías</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {["política", "economía", "social", "tecnología", "medioambiente", "general"].map(
                      (cat) => (
                        <Badge
                          key={cat}
                          variant="outline"
                          className="cursor-pointer"
                          data-testid={`badge-category-${cat}`}
                        >
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </Badge>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Estadísticas */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Estadísticas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Debates totales</span>
                    <span className="font-semibold">{debates.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Participantes activos</span>
                    <span className="font-semibold">1,234</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Respuestas hoy</span>
                    <span className="font-semibold">89</span>
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
