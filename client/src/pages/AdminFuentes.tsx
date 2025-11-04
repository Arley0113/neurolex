import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Plus, Trash2, Edit, TestTube, Download } from "lucide-react";
import type { NewsSource } from "@shared/schema";

export default function AdminFuentes() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nombre: "",
    url: "",
    categoria: "nacional",
    tipo: "rss" as "rss" | "html",
    activo: true,
    selectorTitulo: "",
    selectorContenido: "",
    selectorImagen: "",
  });

  const { data: sources = [], isLoading, isError } = useQuery<NewsSource[]>({
    queryKey: ["/api/news-sources"],
  });

  if (isError) {
    navigate("/login");
    return null;
  }

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return await apiRequest("/api/news-sources", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/news-sources"] });
      toast({
        title: "Fuente creada",
        description: "La fuente de noticias se creó exitosamente",
      });
      resetForm();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<NewsSource> }) => {
      return await apiRequest(`/api/news-sources/${id}`, "PATCH", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/news-sources"] });
      toast({
        title: "Fuente actualizada",
        description: "La fuente se actualizó correctamente",
      });
      setEditingId(null);
      resetForm();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/news-sources/${id}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/news-sources"] });
      toast({
        title: "Fuente eliminada",
        description: "La fuente se eliminó correctamente",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const testScrapeMutation = useMutation({
    mutationFn: async (sourceId: string) => {
      return await apiRequest("/api/scrape/test", "POST", { sourceId });
    },
    onSuccess: (data: any) => {
      toast({
        title: `✅ Scraping exitoso - ${data.fuente}`,
        description: `Se encontraron ${data.articulosEncontrados} artículos`,
      });
      console.log("Artículos encontrados:", data.articulos);
    },
    onError: (error: Error) => {
      toast({
        title: "Error al scrapear",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const importMutation = useMutation({
    mutationFn: async (sourceId: string) => {
      return await apiRequest("/api/scrape/import", "POST", { sourceId, limit: 10 });
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/news"] });
      toast({
        title: `✅ Importación exitosa - ${data.fuente}`,
        description: `Se importaron ${data.articulosImportados} noticias`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error al importar",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      nombre: "",
      url: "",
      categoria: "nacional",
      tipo: "rss",
      activo: true,
      selectorTitulo: "",
      selectorContenido: "",
      selectorImagen: "",
    });
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (source: NewsSource) => {
    setFormData({
      nombre: source.nombre,
      url: source.url,
      categoria: source.categoria,
      tipo: source.tipo as "rss" | "html",
      activo: source.activo,
      selectorTitulo: source.selectorTitulo || "",
      selectorContenido: source.selectorContenido || "",
      selectorImagen: source.selectorImagen || "",
    });
    setEditingId(source.id);
  };

  if (isLoading) {
    return <div className="p-8">Cargando fuentes...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Fuentes de Noticias</h1>
          <p className="text-muted-foreground">Gestiona las fuentes de scraping de noticias</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{editingId ? "Editar Fuente" : "Agregar Nueva Fuente"}</CardTitle>
          <CardDescription>
            Configura fuentes RSS o HTML para scrapear noticias automáticamente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre de la fuente</Label>
                <Input
                  id="nombre"
                  data-testid="input-nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="El País, BBC, etc."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="url">URL</Label>
                <Input
                  id="url"
                  data-testid="input-url"
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://example.com/rss"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoria">Categoría</Label>
                <Select
                  value={formData.categoria}
                  onValueChange={(value) => setFormData({ ...formData, categoria: value })}
                >
                  <SelectTrigger data-testid="select-categoria">
                    <SelectValue />
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

              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo de fuente</Label>
                <Select
                  value={formData.tipo}
                  onValueChange={(value) => setFormData({ ...formData, tipo: value as "rss" | "html" })}
                >
                  <SelectTrigger data-testid="select-tipo">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rss">RSS Feed</SelectItem>
                    <SelectItem value="html">HTML (con selectores)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formData.tipo === "html" && (
              <div className="space-y-4 pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  Selectores CSS para scraping HTML (opcional, se usarán defaults si se dejan vacíos)
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="selectorTitulo">Selector de título</Label>
                    <Input
                      id="selectorTitulo"
                      data-testid="input-selector-titulo"
                      value={formData.selectorTitulo}
                      onChange={(e) => setFormData({ ...formData, selectorTitulo: e.target.value })}
                      placeholder=".article-title"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="selectorContenido">Selector de contenido</Label>
                    <Input
                      id="selectorContenido"
                      data-testid="input-selector-contenido"
                      value={formData.selectorContenido}
                      onChange={(e) => setFormData({ ...formData, selectorContenido: e.target.value })}
                      placeholder=".article-content"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="selectorImagen">Selector de imagen</Label>
                    <Input
                      id="selectorImagen"
                      data-testid="input-selector-imagen"
                      value={formData.selectorImagen}
                      onChange={(e) => setFormData({ ...formData, selectorImagen: e.target.value })}
                      placeholder=".article-image"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Switch
                id="activo"
                data-testid="switch-activo"
                checked={formData.activo}
                onCheckedChange={(checked) => setFormData({ ...formData, activo: checked })}
              />
              <Label htmlFor="activo">Fuente activa</Label>
            </div>

            <div className="flex gap-2">
              <Button
                type="submit"
                data-testid="button-submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                <Plus className="w-4 h-4 mr-2" />
                {editingId ? "Actualizar" : "Agregar"} Fuente
              </Button>
              {editingId && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                  data-testid="button-cancel"
                >
                  Cancelar
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Fuentes Configuradas ({sources.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sources.map((source) => (
              <div
                key={source.id}
                className="flex items-center justify-between p-4 border rounded-lg hover-elevate"
                data-testid={`source-${source.id}`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{source.nombre}</h3>
                    <span className={`text-xs px-2 py-1 rounded ${source.activo ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"}`}>
                      {source.activo ? "Activa" : "Inactiva"}
                    </span>
                    <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      {source.tipo.toUpperCase()}
                    </span>
                    <span className="text-xs px-2 py-1 rounded bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                      {source.categoria}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 truncate">{source.url}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => testScrapeMutation.mutate(source.id)}
                    disabled={testScrapeMutation.isPending || !source.activo}
                    data-testid={`button-test-${source.id}`}
                  >
                    <TestTube className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => importMutation.mutate(source.id)}
                    disabled={importMutation.isPending || !source.activo}
                    data-testid={`button-import-${source.id}`}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(source)}
                    data-testid={`button-edit-${source.id}`}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteMutation.mutate(source.id)}
                    disabled={deleteMutation.isPending}
                    data-testid={`button-delete-${source.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}

            {sources.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No hay fuentes configuradas. Agrega una fuente para comenzar.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
