import { useRoute, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, ArrowLeft, Calendar, User } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const tipoColors: Record<string, string> = {
  nacional: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
  internacional: "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300",
  economia: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300",
  social: "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300",
  tecnologia: "bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300",
  otro: "bg-gray-100 text-gray-800 dark:bg-gray-950 dark:text-gray-300",
};

export default function NoticiaDetalle() {
  const [, params] = useRoute("/noticias/:id");
  const noticiaId = params?.id;

  const userId = localStorage.getItem("userId");

  const { data: user } = useQuery({
    queryKey: ["/api/users/me", userId],
    enabled: !!userId,
  });

  const { data: tokensBalance } = useQuery({
    queryKey: ["/api/tokens", userId],
    enabled: !!userId,
  });

  const { data: noticia, isLoading, error } = useQuery<any>({
    queryKey: ["/api/news", noticiaId],
    enabled: !!noticiaId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar user={user} tokensBalance={tokensBalance} />
        <main className="flex-1 flex items-center justify-center bg-background">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !noticia) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar user={user} tokensBalance={tokensBalance} />
        <main className="flex-1 flex items-center justify-center bg-background">
          <Card className="max-w-md">
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground mb-4">
                No se pudo cargar la noticia
              </p>
              <Link href="/noticias">
                <Button className="w-full">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver a Noticias
                </Button>
              </Link>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={user} tokensBalance={tokensBalance} />

      <main className="flex-1 bg-background">
        <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8 py-8">
          <Link href="/noticias">
            <Button variant="ghost" size="sm" className="mb-6" data-testid="button-back">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Noticias
            </Button>
          </Link>

          <article>
            {/* Imagen destacada */}
            {noticia.imagenUrl && (
              <div className="aspect-video w-full overflow-hidden rounded-lg mb-6 bg-muted">
                <img
                  src={noticia.imagenUrl}
                  alt={noticia.titulo}
                  className="w-full h-full object-cover"
                  data-testid="img-news-featured"
                />
              </div>
            )}

            {/* Metadata */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <Badge
                className={tipoColors[noticia.tipo] || tipoColors.otro}
                data-testid="badge-news-type"
              >
                {noticia.tipo.charAt(0).toUpperCase() + noticia.tipo.slice(1)}
              </Badge>
              {noticia.partidoAsociado && (
                <Badge variant="outline" data-testid="badge-party">
                  {noticia.partidoAsociado}
                </Badge>
              )}
            </div>

            {/* Título */}
            <h1 className="text-3xl md:text-4xl font-bold font-[Poppins] mb-4" data-testid="text-news-title">
              {noticia.titulo}
            </h1>

            {/* Información adicional */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-8">
              {noticia.createdAt && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span data-testid="text-news-date">
                    {format(new Date(noticia.createdAt), "dd 'de' MMMM 'de' yyyy", { locale: es })}
                  </span>
                </div>
              )}
              {noticia.publicadoPorNombre && (
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <span data-testid="text-news-author">{noticia.publicadoPorNombre}</span>
                </div>
              )}
            </div>

            {/* Contenido */}
            <div
              className="prose prose-lg dark:prose-invert max-w-none"
              data-testid="text-news-content"
            >
              <p className="text-lg leading-relaxed whitespace-pre-wrap">
                {noticia.contenido}
              </p>
            </div>
          </article>

          {/* Noticias relacionadas */}
          <div className="mt-12 pt-8 border-t">
            <h2 className="text-2xl font-bold font-[Poppins] mb-6">
              Más Noticias
            </h2>
            <Link href="/noticias">
              <Button variant="outline" className="w-full md:w-auto">
                Ver todas las noticias
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
