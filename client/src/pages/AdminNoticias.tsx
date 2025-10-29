// Panel de Administración - Gestión de Noticias
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Newspaper, Plus, Pencil, Trash2, Loader2, ArrowLeft, Eye } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function AdminNoticias() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const userId = localStorage.getItem("userId");
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<any>(null);
  const [formData, setFormData] = useState({
    titulo: "",
    contenido: "",
    tipo: "nacional" as "nacional" | "internacional" | "economia" | "social" | "tecnologia" | "otro",
    partidoAsociado: "",
    imagenUrl: "",
  });

  // Redirigir al login si no está autenticado
  useEffect(() => {
    if (!userId) {
      setLocation("/login");
    }
  }, [userId, setLocation]);

  // Cargar usuario
  const { data: user } = useQuery<any>({
    queryKey: ["/api/users/me", userId],
    enabled: !!userId,
  });

  // Cargar noticias
  const { data: news = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/news"],
    enabled: !!user?.isAdmin,
  });

  // Crear/editar noticia
  const createOrUpdateMutation = useMutation({
    mutationFn: async (data: any) => {
      if (editingNews) {
        return apiRequest("PUT", `/api/admin/news/${editingNews.id}`, {
          ...data,
          adminId: userId,
        });
      } else {
        return apiRequest("POST", "/api/admin/news", {
          ...data,
          adminId: userId,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/news"] });
      toast({
        title: editingNews ? "Noticia actualizada" : "Noticia creada",
        description: `La noticia ha sido ${editingNews ? "actualizada" : "creada"} correctamente`,
      });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "No se pudo guardar la noticia",
      });
    },
  });

  // Eliminar noticia
  const deleteMutation = useMutation({
    mutationFn: async (newsId: string) => {
      return apiRequest("DELETE", `/api/admin/news/${newsId}?adminId=${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/news"] });
      toast({
        title: "Noticia eliminada",
        description: "La noticia ha sido eliminada correctamente",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "No se pudo eliminar la noticia",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createOrUpdateMutation.mutate(formData);
  };

  const handleEdit = (newsItem: any) => {
    setEditingNews(newsItem);
    setFormData({
      titulo: newsItem.titulo,
      contenido: newsItem.contenido,
      tipo: newsItem.tipo,
      partidoAsociado: newsItem.partidoAsociado || "",
      imagenUrl: newsItem.imagenUrl || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (newsId: string) => {
    if (confirm("¿Estás seguro de eliminar esta noticia?")) {
      deleteMutation.mutate(newsId);
    }
  };

  const resetForm = () => {
    setEditingNews(null);
    setFormData({
      titulo: "",
      contenido: "",
      tipo: "nacional",
      partidoAsociado: "",
      imagenUrl: "",
    });
  };

  const handleDialogChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      resetForm();
    }
  };

  // Verificar que el usuario sea admin
  if (!user?.isAdmin) {
    return null;
  }

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
                <Newspaper className="h-8 w-8 text-primary" />
                <h1 className="text-3xl md:text-4xl font-bold font-[Poppins]" data-testid="text-admin-news-title">
                  Gestión de Noticias
                </h1>
              </div>
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
              <DialogTrigger asChild>
                <Button data-testid="button-create-news">
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Noticia
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingNews ? "Editar Noticia" : "Crear Nueva Noticia"}
                  </DialogTitle>
                  <DialogDescription>
                    Completa los datos de la noticia política
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="titulo">Título *</Label>
                    <Input
                      id="titulo"
                      value={formData.titulo}
                      onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                      placeholder="Título de la noticia"
                      required
                      data-testid="input-news-title"
                    />
                  </div>

                  <div>
                    <Label htmlFor="contenido">Contenido *</Label>
                    <Textarea
                      id="contenido"
                      value={formData.contenido}
                      onChange={(e) => setFormData({ ...formData, contenido: e.target.value })}
                      placeholder="Contenido completo de la noticia"
                      rows={6}
                      required
                      data-testid="input-news-content"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="tipo">Tipo de Noticia *</Label>
                      <Select
                        value={formData.tipo}
                        onValueChange={(value: any) => setFormData({ ...formData, tipo: value })}
                      >
                        <SelectTrigger id="tipo" data-testid="select-news-type">
                          <SelectValue placeholder="Selecciona tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="nacional">Nacional</SelectItem>
                          <SelectItem value="internacional">Internacional</SelectItem>
                          <SelectItem value="economia">Economía</SelectItem>
                          <SelectItem value="social">Social</SelectItem>
                          <SelectItem value="tecnologia">Tecnología</SelectItem>
                          <SelectItem value="otro">Otro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="partidoAsociado">Partido Asociado</Label>
                      <Input
                        id="partidoAsociado"
                        value={formData.partidoAsociado}
                        onChange={(e) => setFormData({ ...formData, partidoAsociado: e.target.value })}
                        placeholder="Ej: PSOE, PP, Podemos..."
                        data-testid="input-news-party"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="imagenUrl">URL de Imagen</Label>
                    <Input
                      id="imagenUrl"
                      value={formData.imagenUrl}
                      onChange={(e) => setFormData({ ...formData, imagenUrl: e.target.value })}
                      placeholder="https://ejemplo.com/imagen.jpg"
                      type="url"
                      data-testid="input-news-image"
                    />
                  </div>

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                      data-testid="button-cancel-news"
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={createOrUpdateMutation.isPending}
                      data-testid="button-save-news"
                    >
                      {createOrUpdateMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Guardando...
                        </>
                      ) : (
                        editingNews ? "Actualizar" : "Crear"
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Lista de Noticias */}
          <div className="space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : news.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  No hay noticias creadas. Crea la primera noticia.
                </CardContent>
              </Card>
            ) : (
              news.map((newsItem: any) => (
                <Card key={newsItem.id} className="hover-elevate" data-testid={`card-news-${newsItem.id}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">
                          {newsItem.titulo}
                        </CardTitle>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                          <span className="px-2 py-1 rounded-md bg-primary/10 text-primary font-medium">
                            {newsItem.tipo}
                          </span>
                          {newsItem.partidoAsociado && (
                            <span className="px-2 py-1 rounded-md bg-secondary">
                              {newsItem.partidoAsociado}
                            </span>
                          )}
                          <span>
                            {format(new Date(newsItem.createdAt), "d 'de' MMMM, yyyy", { locale: es })}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Link href="/noticias">
                          <Button
                            variant="ghost"
                            size="sm"
                            data-testid={`button-view-news-${newsItem.id}`}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(newsItem)}
                          data-testid={`button-edit-news-${newsItem.id}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(newsItem.id)}
                          disabled={deleteMutation.isPending}
                          data-testid={`button-delete-news-${newsItem.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground line-clamp-3">
                      {newsItem.contenido}
                    </p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
