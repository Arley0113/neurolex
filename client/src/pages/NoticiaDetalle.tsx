import { useRoute, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2, ArrowLeft, Calendar, User, MessageSquare, Send } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import type { Comment } from "@shared/schema";

interface ComentarioConAutor extends Comment {
  autorNombre?: string;
}

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

  const { toast } = useToast();
  const [comentario, setComentario] = useState("");

  const { data: user } = useQuery({
    queryKey: ["/api/users/me"],
  });

  const { data: tokensBalance } = useQuery({
    queryKey: ["/api/tokens"],
    enabled: !!user,
  });

  const { data: noticia, isLoading, error } = useQuery<any>({
    queryKey: ["/api/news", noticiaId],
    enabled: !!noticiaId,
  });

  const { data: comentarios = [] } = useQuery<ComentarioConAutor[]>({
    queryKey: ["/api/comments/news", noticiaId],
    enabled: !!noticiaId,
  });

  const addCommentMutation = useMutation({
    mutationFn: async (contenido: string) => {
      if (!user) {
        throw new Error("Debes iniciar sesión para comentar");
      }
      return apiRequest(`/api/comments`, "POST", {
        contenido,
        noticiaId: noticiaId,
      });
    },
    onSuccess: () => {
      toast({
        title: "Comentario publicado",
        description: "Tu comentario se ha agregado correctamente",
      });
      setComentario("");
      queryClient.invalidateQueries({ queryKey: ["/api/comments/news", noticiaId] });
      queryClient.invalidateQueries({ queryKey: ["/api/news", noticiaId] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comentario.trim()) {
      toast({
        title: "Error",
        description: "El comentario no puede estar vacío",
        variant: "destructive",
      });
      return;
    }
    addCommentMutation.mutate(comentario);
  };

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

          {/* Sección de comentarios */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Comentarios ({comentarios.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Formulario para nuevo comentario */}
              {user ? (
                <form onSubmit={handleSubmitComment} className="space-y-4">
                  <Textarea
                    placeholder="Escribe tu comentario..."
                    value={comentario}
                    onChange={(e) => setComentario(e.target.value)}
                    className="min-h-[100px]"
                    data-testid="textarea-comment"
                  />
                  <div className="flex justify-end">
                    <Button 
                      type="submit" 
                      disabled={addCommentMutation.isPending || !comentario.trim()}
                      data-testid="button-post-comment"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      {addCommentMutation.isPending ? "Publicando..." : "Publicar Comentario"}
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="text-center p-6 bg-muted rounded-lg">
                  <p className="text-muted-foreground mb-4">
                    Debes iniciar sesión para comentar en esta noticia
                  </p>
                  <Link href="/login">
                    <Button>Iniciar Sesión</Button>
                  </Link>
                </div>
              )}

              <Separator />

              {/* Lista de comentarios */}
              <div className="space-y-6">
                {comentarios.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No hay comentarios aún. ¡Sé el primero en comentar!
                  </p>
                ) : (
                  comentarios.map((comentario) => (
                    <div key={comentario.id} className="flex gap-4" data-testid={`comment-${comentario.id}`}>
                      <Avatar className="h-10 w-10 flex-shrink-0">
                        <AvatarFallback>
                          {comentario.autorNombre?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">
                            {comentario.autorNombre || "Usuario"}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {comentario.createdAt
                              ? formatDistanceToNow(new Date(comentario.createdAt), {
                                  addSuffix: true,
                                  locale: es,
                                })
                              : ""}
                          </span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{comentario.contenido}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

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
