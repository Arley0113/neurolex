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
import { Plus, Trash2, Edit, TestTube, Download, BookOpen, ChevronDown, ChevronUp, ClipboardList, FlaskConical, Download as DownloadIcon, FileEdit, AlertTriangle, Lightbulb } from "lucide-react";
import type { NewsSource } from "@shared/schema";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export default function AdminFuentes() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tutorialOpen, setTutorialOpen] = useState(false);
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
      const res = await apiRequest("/api/scrape/test", "POST", { sourceId });
      return await res.json();
    },
    onSuccess: (data: any) => {
      toast({
        title: `✅ Scraping exitoso - ${data.fuente}`,
        description: `Se encontraron ${data.articulosEncontrados || 0} artículos`,
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
      const res = await apiRequest("/api/scrape/import", "POST", { sourceId, limit: 10 });
      return await res.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/news"] });
      toast({
        title: `✅ Importación exitosa - ${data.fuente}`,
        description: `Se importaron ${data.articulosImportados || 0} noticias`,
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

      <Collapsible open={tutorialOpen} onOpenChange={setTutorialOpen}>
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CollapsibleTrigger asChild>
              <div 
                className="flex items-center justify-between cursor-pointer group"
                data-testid="button-toggle-tutorial"
              >
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">¿Cómo usar el Sistema de Scraping de Noticias?</CardTitle>
                </div>
                {tutorialOpen ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                )}
              </div>
            </CollapsibleTrigger>
          </CardHeader>
          <CollapsibleContent>
            <CardContent className="space-y-4">
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <ClipboardList className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-primary">Paso 1: Agregar una Fuente</h3>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-2">
                    <li><strong>Nombre:</strong> Ej. "El País - Política", "BBC Mundo"</li>
                    <li><strong>URL:</strong> Dirección web de la fuente (RSS feed o página HTML)</li>
                    <li><strong>Categoría:</strong> Tipo de noticias (Nacional, Internacional, etc.)</li>
                    <li><strong>Tipo:</strong> Selecciona "RSS Feed" para feeds RSS o "HTML" para páginas web</li>
                    <li><strong>Estado:</strong> Activa la fuente para permitir el scraping</li>
                  </ul>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <FlaskConical className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-primary">Paso 2: Probar el Scraping</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Antes de importar noticias, es importante verificar que el scraping funcione:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-2">
                    <li>Haz clic en el botón <strong>Probar</strong> (icono de tubo de ensayo) en la fuente</li>
                    <li>El sistema intentará extraer noticias de la URL configurada</li>
                    <li>Verás un mensaje indicando cuántos artículos se encontraron</li>
                    <li>Revisa la consola del navegador (F12) para ver detalles de los artículos</li>
                  </ul>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <DownloadIcon className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-primary">Paso 3: Importar Noticias</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Una vez verificado que el scraping funciona correctamente:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-2">
                    <li>Haz clic en el botón <strong>Importar</strong> (icono de descarga) en la fuente</li>
                    <li>Las noticias se importarán automáticamente como <strong>borradores</strong></li>
                    <li>Máximo 10 noticias por importación para evitar sobrecarga</li>
                    <li>Las noticias incluirán metadatos: fuente, URL original, categoría</li>
                  </ul>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <FileEdit className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-primary">Paso 4: Revisar y Publicar</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Las noticias importadas requieren moderación antes de publicarse:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-2">
                    <li>Ve a <strong>Gestión de Noticias</strong> para ver todas las noticias</li>
                    <li>Las noticias scrapeadas aparecen con estado "borrador"</li>
                    <li>Puedes <strong>editar</strong> el contenido antes de publicar (título, contenido, categoría)</li>
                    <li>Las noticias editadas mantienen la referencia a su fuente original</li>
                  </ul>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-800 dark:text-yellow-200" />
                    <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">Limitaciones Importantes</h3>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-sm text-yellow-700 dark:text-yellow-300 ml-2">
                    <li>Sitios web modernos pueden tener protección anti-scraping (CORS, CAPTCHA)</li>
                    <li>No todos los sitios funcionarán por restricciones de seguridad del navegador</li>
                    <li>RSS Feeds suelen ser más confiables que scraping HTML</li>
                    <li>El scraping es básico y puede requerir ajustes según el sitio</li>
                    <li>La importación es manual, no automática (sin cron jobs)</li>
                  </ul>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="h-5 w-5 text-blue-800 dark:text-blue-200" />
                    <h3 className="font-semibold text-blue-800 dark:text-blue-200">Consejos</h3>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-sm text-blue-700 dark:text-blue-300 ml-2">
                    <li>Usa URLs de feeds RSS cuando estén disponibles (más confiables)</li>
                    <li>Mantén las fuentes activas solo cuando las uses regularmente</li>
                    <li>Revisa siempre el contenido importado antes de publicar</li>
                    <li>Puedes editar las noticias scrapeadas libremente</li>
                    <li>Si una fuente falla, verifica que la URL sea correcta y esté activa</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

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
