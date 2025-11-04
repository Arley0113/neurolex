import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, MessageSquare, TrendingUp, Coins, Heart, ThumbsUp, Send } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Link } from "wouter";
import { DonateModal } from "@/components/DonateModal";
import type { Comment } from "@shared/schema";

interface PropuestaDetalle {
  id: string;
  titulo: string;
  descripcion: string;
  categoria: string;
  estado: string;
  apoyosTP: number;
  apoyosTA: number;
  autorNombre: string;
  createdAt: Date;
  numComentarios?: number;
}

interface ComentarioConAutor extends Comment {
  autorNombre?: string;
}

const estadoConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  borrador: { label: "Borrador", variant: "secondary" },
  en_deliberacion: { label: "En Deliberación", variant: "default" },
  votacion: { label: "En Votación", variant: "default" },
  aprobada: { label: "Aprobada", variant: "default" },
  rechazada: { label: "Rechazada", variant: "destructive" },
  archivada: { label: "Archivada", variant: "outline" },
};

export default function PropuestaDetalle() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [comentario, setComentario] = useState("");
  const [isDonateModalOpen, setIsDonateModalOpen] = useState(false);

  const { data: user } = useQuery({
    queryKey: ["/api/users/me"],
  });

  const { data: tokensBalance } = useQuery({
    queryKey: ["/api/tokens"],
    enabled: !!user,
  });

  const { data: propuesta, isLoading } = useQuery<PropuestaDetalle>({
    queryKey: ["/api/proposals", id],
    enabled: !!id,
  });

  const { data: comentarios = [] } = useQuery<ComentarioConAutor[]>({
    queryKey: ["/api/comments/proposal", id],
    enabled: !!id,
  });

  const hasEnoughTokens = tokensBalance && tokensBalance.tokensParticipacion >= 1;

  const supportMutation = useMutation({
    mutationFn: async () => {
      if (!user) {
        throw new Error("Debes iniciar sesión para apoyar una propuesta");
      }
      return apiRequest(`/api/proposals/${id}/support`, "POST", {
        tipoToken: "TP",
        cantidad: 1,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/proposals", id] });
      queryClient.invalidateQueries({ queryKey: ["/api/tokens"] });
      toast({
        title: "¡Apoyo enviado!",
        description: "Has apoyado esta propuesta con 1 Token de Participación",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "No se pudo enviar el apoyo",
      });
    },
  });

  const addCommentMutation = useMutation({
    mutationFn: async (contenido: string) => {
      if (!user) {
        throw new Error("Debes iniciar sesión para comentar");
      }
      return apiRequest(`/api/comments`, "POST", {
        contenido,
        propuestaId: id,
      });
    },
    onSuccess: () => {
      toast({
        title: "Comentario publicado",
        description: "Tu comentario se ha agregado correctamente",
      });
      setComentario("");
      queryClient.invalidateQueries({ queryKey: ["/api/comments/proposal", id] });
      queryClient.invalidateQueries({ queryKey: ["/api/proposals", id] });
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

  const handleSupport = () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Inicia sesión",
        description: "Debes iniciar sesión para apoyar propuestas",
      });
      return;
    }
    if (!hasEnoughTokens) {
      toast({
        variant: "destructive",
        title: "Tokens insuficientes",
        description: "Necesitas al menos 1 Token de Participación para apoyar una propuesta",
      });
      return;
    }
    supportMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar user={user} tokensBalance={tokensBalance} />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Cargando propuesta...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!propuesta) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar user={user} tokensBalance={tokensBalance} />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Propuesta no encontrada</h2>
            <p className="text-muted-foreground mb-4">
              La propuesta que buscas no existe o ha sido eliminada
            </p>
            <Link href="/propuestas">
              <Button data-testid="button-back-to-proposals">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver a Propuestas
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const estadoInfo = estadoConfig[propuesta.estado] || estadoConfig.borrador;
  const tiempoRelativo = propuesta.createdAt
    ? formatDistanceToNow(new Date(propuesta.createdAt), { addSuffix: true, locale: es })
    : "";

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={user} tokensBalance={tokensBalance} />

      <main className="flex-1 bg-background">
        <div className="max-w-5xl mx-auto px-4 md:px-6 lg:px-8 py-8">
          {/* Botón volver */}
          <Link href="/propuestas">
            <Button variant="ghost" className="mb-6" data-testid="button-back">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Propuestas
            </Button>
          </Link>

          {/* Contenido de la propuesta */}
          <Card className="mb-8">
            <CardContent className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4 gap-4">
                <Badge variant="outline" data-testid="badge-category">
                  {propuesta.categoria}
                </Badge>
                <Badge variant={estadoInfo.variant} data-testid="badge-status">
                  {estadoInfo.label}
                </Badge>
              </div>

              {/* Título */}
              <h1 className="text-3xl font-bold font-[Poppins] mb-4" data-testid="text-proposal-title">
                {propuesta.titulo}
              </h1>

              {/* Metadatos */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                <span>Por {propuesta.autorNombre}</span>
                <span>•</span>
                <span>{tiempoRelativo}</span>
              </div>

              <Separator className="mb-6" />

              {/* Descripción */}
              <div className="prose prose-sm dark:prose-invert max-w-none mb-6" data-testid="text-proposal-description">
                <p className="text-base whitespace-pre-wrap">{propuesta.descripcion}</p>
              </div>

              <Separator className="mb-6" />

              {/* Estadísticas de apoyo */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <span className="font-mono font-semibold text-lg" data-testid="text-support-tp">
                      {propuesta.apoyosTP}
                    </span>
                    <span className="text-sm text-muted-foreground">TP</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Coins className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <span className="font-mono font-semibold text-lg" data-testid="text-support-ta">
                      {propuesta.apoyosTA}
                    </span>
                    <span className="text-sm text-muted-foreground">TA</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    <span className="font-mono text-lg" data-testid="text-comments-count">
                      {comentarios.length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Acciones */}
              <div className="flex items-center gap-3">
                <Button
                  variant="default"
                  onClick={handleSupport}
                  disabled={supportMutation.isPending || !user || !hasEnoughTokens}
                  data-testid="button-support-proposal"
                  className="gap-2"
                >
                  <ThumbsUp className="h-4 w-4" />
                  Apoyar con 1 TP
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsDonateModalOpen(true)}
                  data-testid="button-donate-proposal"
                  className="gap-2"
                >
                  <Heart className="h-4 w-4" />
                  Donar Tokens de Apoyo
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Sección de comentarios */}
          <Card>
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
                      data-testid="button-submit-comment"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      {addCommentMutation.isPending ? "Publicando..." : "Publicar Comentario"}
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="text-center p-6 bg-muted rounded-lg">
                  <p className="text-muted-foreground mb-4">
                    Debes iniciar sesión para comentar en esta propuesta
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
        </div>
      </main>

      <Footer />

      {/* Modal de donación */}
      <DonateModal
        isOpen={isDonateModalOpen}
        onClose={() => setIsDonateModalOpen(false)}
        proposalId={id || ""}
        proposalTitle={propuesta.titulo}
      />
    </div>
  );
}
