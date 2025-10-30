import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";

export default function ForoNuevo() {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    titulo: "",
    contenido: "",
    categoria: "general",
  });

  const { data: user } = useQuery({
    queryKey: ["/api/users/me"],
  });

  const { data: tokensBalance } = useQuery({
    queryKey: ["/api/tokens"],
  });

  const createDebateMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!user) {
        throw new Error("Debes iniciar sesión para crear un debate");
      }

      if (user?.isAdmin) {
        return apiRequest("POST", "/api/admin/debates", data);
      } else {
        throw new Error("Solo los administradores pueden crear debates");
      }
    },
    onSuccess: (debate: any) => {
      toast({
        title: "Debate creado",
        description: "Tu debate ha sido publicado correctamente",
      });
      navigate(`/foro/${debate.id}`);
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "No se pudo crear el debate",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Debes iniciar sesión para crear un debate",
      });
      return;
    }

    if (!formData.titulo.trim() || !formData.contenido.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "El título y contenido son obligatorios",
      });
      return;
    }

    createDebateMutation.mutate(formData);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar user={user} tokensBalance={tokensBalance} />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Inicia Sesión</h2>
            <p className="text-muted-foreground mb-4">
              Debes iniciar sesión para crear debates
            </p>
            <Link href="/login">
              <Button>Iniciar Sesión</Button>
            </Link>
          </div>
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
          {/* Header */}
          <div className="mb-8">
            <Link href="/foro">
              <Button variant="ghost" size="sm" className="mb-4" data-testid="button-back-to-forum">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al Foro
              </Button>
            </Link>
            <h1
              className="text-3xl md:text-4xl font-bold font-[Poppins]"
              data-testid="text-page-title"
            >
              Crear Nuevo Debate
            </h1>
            <p className="text-muted-foreground mt-2">
              Inicia una discusión sobre un tema que te interese
            </p>
          </div>

          {/* Formulario */}
          <Card>
            <CardHeader>
              <CardTitle>Detalles del Debate</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="titulo">Título del Debate *</Label>
                  <Input
                    id="titulo"
                    value={formData.titulo}
                    onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                    placeholder="¿Cuál es tu pregunta o tema de debate?"
                    required
                    data-testid="input-debate-title"
                    className="mt-2"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Escribe un título claro y descriptivo
                  </p>
                </div>

                <div>
                  <Label htmlFor="contenido">Contenido *</Label>
                  <Textarea
                    id="contenido"
                    value={formData.contenido}
                    onChange={(e) => setFormData({ ...formData, contenido: e.target.value })}
                    placeholder="Describe tu tema de debate, proporciona contexto y argumentos..."
                    rows={10}
                    required
                    data-testid="input-debate-content"
                    className="mt-2"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Explica tu punto de vista y proporciona contexto relevante
                  </p>
                </div>

                <div>
                  <Label htmlFor="categoria">Categoría *</Label>
                  <Select
                    value={formData.categoria}
                    onValueChange={(value) => setFormData({ ...formData, categoria: value })}
                  >
                    <SelectTrigger id="categoria" data-testid="select-debate-category" className="mt-2">
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="politica">Política</SelectItem>
                      <SelectItem value="economia">Economía</SelectItem>
                      <SelectItem value="social">Social</SelectItem>
                      <SelectItem value="tecnologia">Tecnología</SelectItem>
                      <SelectItem value="medioambiente">Medioambiente</SelectItem>
                      <SelectItem value="general">General</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground mt-1">
                    Elige la categoría que mejor represente tu debate
                  </p>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Link href="/foro">
                    <Button type="button" variant="outline" data-testid="button-cancel">
                      Cancelar
                    </Button>
                  </Link>
                  <Button
                    type="submit"
                    disabled={createDebateMutation.isPending}
                    data-testid="button-submit"
                  >
                    {createDebateMutation.isPending ? "Publicando..." : "Publicar Debate"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Nota informativa */}
          {!user?.isAdmin && (
            <Card className="mt-6 border-amber-200 bg-amber-50 dark:bg-amber-950 dark:border-amber-800">
              <CardContent className="pt-6">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  ℹ️ Actualmente, solo los administradores pueden crear debates públicos. 
                  Si deseas proponer un debate, contacta con un administrador.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
