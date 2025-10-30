import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MessageSquare, Plus, Pencil, Trash2, Eye, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

export default function AdminDebates() {
  const { toast} = useToast();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDebate, setEditingDebate] = useState<any>(null);
  const [formData, setFormData] = useState({
    titulo: "",
    contenido: "",
    categoria: "general",
    destacado: false,
  });

  // Cargar usuario actual
  const { data: user } = useQuery<any>({
    queryKey: ["/api/users/me"],
  });

  // Cargar debates
  const { data: debates = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/debates"],
    queryFn: async () => {
      const response = await fetch("/api/admin/debates");
      if (!response.ok) {
        throw new Error("Error al cargar debates");
      }
      return response.json();
    },
    enabled: !!user?.isAdmin,
  });

  // Crear/editar debate
  const createOrUpdateMutation = useMutation({
    mutationFn: async (data: any) => {
      if (editingDebate) {
        return apiRequest("PUT", `/api/admin/debates/${editingDebate.id}`, data);
      } else {
        return apiRequest("POST", "/api/admin/debates", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/debates"] });
      toast({
        title: editingDebate ? "Debate actualizado" : "Debate creado",
        description: `El debate ha sido ${editingDebate ? "actualizado" : "creado"} correctamente`,
      });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "No se pudo guardar el debate",
      });
    },
  });

  // Eliminar debate
  const deleteMutation = useMutation({
    mutationFn: async (debateId: string) => {
      return apiRequest("DELETE", `/api/admin/debates/${debateId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/debates"] });
      toast({
        title: "Debate eliminado",
        description: "El debate ha sido eliminado correctamente",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "No se pudo eliminar el debate",
      });
    },
  });

  // Toggle destacado
  const toggleDestacadoMutation = useMutation({
    mutationFn: async ({ id, destacado }: { id: string; destacado: boolean }) => {
      return apiRequest("PUT", `/api/admin/debates/${id}`, {
        destacado: !destacado,
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/admin/debates"] });
      await queryClient.refetchQueries({ queryKey: ["/api/admin/debates"] });
      toast({
        title: "Debate actualizado",
        description: "El estado destacado ha sido cambiado",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "No se pudo actualizar el debate",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      titulo: "",
      contenido: "",
      categoria: "general",
      destacado: false,
    });
    setEditingDebate(null);
  };

  const handleDialogChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      resetForm();
    }
  };

  const handleEdit = (debate: any) => {
    setEditingDebate(debate);
    setFormData({
      titulo: debate.titulo,
      contenido: debate.contenido,
      categoria: debate.categoria,
      destacado: debate.destacado,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    createOrUpdateMutation.mutate(formData);
  };

  const handleDelete = async (debateId: string) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este debate?")) {
      deleteMutation.mutate(debateId);
    }
  };

  const handleToggleDestacado = async (id: string, destacado: boolean) => {
    toggleDestacadoMutation.mutate({ id, destacado });
  };

  // Verificar si es admin
  if (!user?.isAdmin) {
    return null;
  }

  const categoriaColors: Record<string, string> = {
    politica: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
    economia: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300",
    social: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
    tecnologia: "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300",
    medioambiente: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
    general: "bg-gray-100 text-gray-800 dark:bg-gray-950 dark:text-gray-300",
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={user} />

      <main className="flex-1 bg-background">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <Link href="/admin">
                <Button variant="ghost" size="sm" className="mb-2" data-testid="button-back-admin">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver al Panel
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <MessageSquare className="h-8 w-8 text-primary" />
                <h1
                  className="text-3xl md:text-4xl font-bold font-[Poppins]"
                  data-testid="text-admin-debates-title"
                >
                  Gestión de Debates
                </h1>
              </div>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
              <DialogTrigger asChild>
                <Button data-testid="button-create-debate">
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Debate
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingDebate ? "Editar Debate" : "Crear Nuevo Debate"}
                  </DialogTitle>
                  <DialogDescription>
                    Completa los datos del debate del foro
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="titulo">Título *</Label>
                    <Input
                      id="titulo"
                      value={formData.titulo}
                      onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                      placeholder="Título del debate"
                      required
                      data-testid="input-debate-title"
                    />
                  </div>

                  <div>
                    <Label htmlFor="contenido">Contenido *</Label>
                    <Textarea
                      id="contenido"
                      value={formData.contenido}
                      onChange={(e) => setFormData({ ...formData, contenido: e.target.value })}
                      placeholder="Contenido completo del debate"
                      rows={8}
                      required
                      data-testid="input-debate-content"
                    />
                  </div>

                  <div>
                    <Label htmlFor="categoria">Categoría *</Label>
                    <Select
                      value={formData.categoria}
                      onValueChange={(value) => setFormData({ ...formData, categoria: value })}
                    >
                      <SelectTrigger id="categoria" data-testid="select-debate-category">
                        <SelectValue placeholder="Selecciona categoría" />
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
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="destacado"
                      checked={formData.destacado}
                      onChange={(e) => setFormData({ ...formData, destacado: e.target.checked })}
                      className="h-4 w-4"
                      data-testid="input-debate-featured"
                    />
                    <Label htmlFor="destacado">Marcar como destacado</Label>
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                      data-testid="button-cancel"
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={createOrUpdateMutation.isPending}
                      data-testid="button-save-debate"
                    >
                      {createOrUpdateMutation.isPending
                        ? "Guardando..."
                        : editingDebate
                        ? "Actualizar"
                        : "Crear"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Debates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{debates.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Debates Destacados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {debates.filter((d: any) => d.destacado).length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Respuestas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {debates.reduce((sum: number, d: any) => sum + (d.numRespuestas || 0), 0)}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Lista de debates */}
          <div className="space-y-4">
            {isLoading ? (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  Cargando debates...
                </CardContent>
              </Card>
            ) : debates.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  No hay debates creados. Crea el primer debate.
                </CardContent>
              </Card>
            ) : (
              debates.map((debate: any) => {
                const tiempoRelativo = debate.createdAt
                  ? formatDistanceToNow(new Date(debate.createdAt), {
                      addSuffix: true,
                      locale: es,
                    })
                  : "";

                return (
                  <Card
                    key={debate.id}
                    className="hover-elevate"
                    data-testid={`card-debate-${debate.id}`}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge
                              className={
                                categoriaColors[debate.categoria] || categoriaColors.general
                              }
                            >
                              {debate.categoria.charAt(0).toUpperCase() +
                                debate.categoria.slice(1)}
                            </Badge>
                            {debate.destacado && (
                              <Badge variant="default" className="flex items-center gap-1">
                                <Star className="h-3 w-3 fill-current" />
                                Destacado
                              </Badge>
                            )}
                          </div>
                          <CardTitle className="text-xl mb-2">{debate.titulo}</CardTitle>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                            <span>Por {debate.autorNombre || "Admin"}</span>
                            <span>{tiempoRelativo}</span>
                            <span className="flex items-center gap-1">
                              <MessageSquare className="h-4 w-4" />
                              {debate.numRespuestas} respuestas
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye className="h-4 w-4" />
                              {debate.numVistas} vistas
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleDestacado(debate.id, debate.destacado)}
                            title={debate.destacado ? "Quitar destacado" : "Marcar como destacado"}
                            data-testid={`button-toggle-featured-${debate.id}`}
                          >
                            <Star
                              className={`h-4 w-4 ${
                                debate.destacado ? "fill-yellow-400 text-yellow-400" : ""
                              }`}
                            />
                          </Button>
                          <Link href={`/foro/${debate.id}`}>
                            <Button
                              variant="ghost"
                              size="sm"
                              data-testid={`button-view-debate-${debate.id}`}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(debate)}
                            data-testid={`button-edit-debate-${debate.id}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(debate.id)}
                            disabled={deleteMutation.isPending}
                            data-testid={`button-delete-debate-${debate.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground line-clamp-3">{debate.contenido}</p>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
