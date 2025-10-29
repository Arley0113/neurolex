import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, MessageSquare, Eye, ThumbsUp, ThumbsDown, Send } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Link } from "wouter";

const categoriaColors: Record<string, string> = {
  politica: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
  economia: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300",
  social: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
  tecnologia: "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300",
  medioambiente: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  general: "bg-gray-100 text-gray-800 dark:bg-gray-950 dark:text-gray-300",
};

export default function ForoDetalle() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const userId = localStorage.getItem("userId");
  const { toast } = useToast();
  const [comentario, setComentario] = useState("");

  const { data: user } = useQuery({
    queryKey: ["/api/users/me", userId],
    enabled: !!userId,
  });

  const { data: tokensBalance } = useQuery({
    queryKey: ["/api/tokens", userId],
    enabled: !!userId,
  });

  const { data: debate, isLoading } = useQuery({
    queryKey: ["/api/debates", id],
    enabled: !!id,
  });

  const { data: comentarios = [] } = useQuery({
    queryKey: ["/api/debates", id, "comments"],
    enabled: !!id,
  });

  const addCommentMutation = useMutation({
    mutationFn: async (contenido: string) => {
      if (!userId) {
        throw new Error("Debes iniciar sesión para comentar");
      }
      return apiRequest("POST", `/api/debates/${id}/comments`, {
        contenido,
        autorId: userId,
      });
    },
    onSuccess: () => {
      toast({
        title: "Comentario publicado",
        description: "Tu comentario se ha agregado correctamente",
      });
      setComentario("");
      queryClient.invalidateQueries({ queryKey: ["/api/debates", id, "comments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/debates", id] });
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
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Cargando debate...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!debate) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar user={user} tokensBalance={tokensBalance} />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Debate no encontrado</h2>
            <p className="text-muted-foreground mb-4">
              El debate que buscas no existe o ha sido eliminado
            </p>
            <Link href="/foro">
              <Button data-testid="button-back-to-forum">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al Foro
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const tiempoRelativo = debate.createdAt
    ? formatDistanceToNow(new Date(debate.createdAt), { addSuffix: true, locale: es })
    : "";

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={user} tokensBalance={tokensBalance} />

      <main className="flex-1 bg-background">
        <div className="max-w-5xl mx-auto px-4 md:px-6 lg:px-8 py-8">
          {/* Botón volver */}
          <Link href="/foro">
            <Button variant="ghost" className="mb-6" data-testid="button-back">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Foro
            </Button>
          </Link>

          {/* Contenido del debate */}
          <Card className="mb-8">
            <CardContent className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4 gap-4">
                <Badge
                  className={categoriaColors[debate.categoria] || categoriaColors.general}
                  data-testid="badge-category"
                >
                  {debate.categoria.charAt(0).toUpperCase() + debate.categoria.slice(1)}
                </Badge>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1" data-testid="text-views">
                    <Eye className="h-4 w-4" />
                    <span className="font-mono">{debate.numVistas}</span>
                  </div>
                  <div className="flex items-center gap-1" data-testid="text-replies">
                    <MessageSquare className="h-4 w-4" />
                    <span className="font-mono">{debate.numRespuestas}</span>
                  </div>
                </div>
              </div>

              {/* Título */}
              <h1 className="text-2xl md:text-3xl font-bold mb-4" data-testid="text-title">
                {debate.titulo}
              </h1>

              {/* Autor y fecha */}
              <div className="flex items-center gap-3 mb-6">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {debate.autorNombre?.substring(0, 2).toUpperCase() || "AN"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium" data-testid="text-author">
                    {debate.autorNombre || "Anónimo"}
                  </p>
                  <p className="text-sm text-muted-foreground">{tiempoRelativo}</p>
                </div>
              </div>

              <Separator className="mb-6" />

              {/* Contenido */}
              <div className="prose dark:prose-invert max-w-none" data-testid="text-content">
                <p className="whitespace-pre-wrap">{debate.contenido}</p>
              </div>
            </CardContent>
          </Card>

          {/* Sección de comentarios */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <MessageSquare className="h-6 w-6" />
              Respuestas ({comentarios.length})
            </h2>

            {/* Formulario de nuevo comentario */}
            {user ? (
              <Card className="mb-6">
                <CardContent className="p-4">
                  <form onSubmit={handleSubmitComment}>
                    <Textarea
                      placeholder="Escribe tu respuesta..."
                      value={comentario}
                      onChange={(e) => setComentario(e.target.value)}
                      className="mb-3 min-h-24"
                      data-testid="input-comment"
                    />
                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        disabled={addCommentMutation.isPending || !comentario.trim()}
                        data-testid="button-submit-comment"
                      >
                        {addCommentMutation.isPending ? (
                          "Publicando..."
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Publicar Respuesta
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            ) : (
              <Card className="mb-6">
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground mb-4">Debes iniciar sesión para comentar</p>
                  <Link href="/login">
                    <Button data-testid="button-login">Iniciar Sesión</Button>
                  </Link>
                </CardContent>
              </Card>
            )}

            {/* Lista de comentarios */}
            <div className="space-y-4">
              {comentarios.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-muted-foreground">
                      No hay respuestas aún. ¡Sé el primero en comentar!
                    </p>
                  </CardContent>
                </Card>
              ) : (
                comentarios.map((comment: any, index: number) => {
                  const comentarioTiempo = comment.createdAt
                    ? formatDistanceToNow(new Date(comment.createdAt), {
                        addSuffix: true,
                        locale: es,
                      })
                    : "";

                  return (
                    <Card key={comment.id} data-testid={`comment-${index + 1}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-muted">
                              {comment.autorNombre?.substring(0, 2).toUpperCase() || "AN"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-medium text-sm">{comment.autorNombre}</span>
                              <span className="text-xs text-muted-foreground">
                                {comentarioTiempo}
                              </span>
                            </div>
                            <p className="text-sm whitespace-pre-wrap mb-3">{comment.contenido}</p>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm" className="h-7 px-2">
                                <ThumbsUp className="h-3 w-3 mr-1" />
                                <span className="text-xs font-mono">
                                  {comment.votosPositivos || 0}
                                </span>
                              </Button>
                              <Button variant="ghost" size="sm" className="h-7 px-2">
                                <ThumbsDown className="h-3 w-3 mr-1" />
                                <span className="text-xs font-mono">
                                  {comment.votosNegativos || 0}
                                </span>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
