// Página de noticias políticas para Neurolex
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { NewsCard } from "@/components/NewsCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter } from "lucide-react";

import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

export default function Noticias() {
  // Cargar noticias del backend
  const { data: noticias = [], isLoading } = useQuery({
    queryKey: ["/api/news"],
  });

  const tiposNoticia = ["Todas", "Nacional", "Internacional", "Economía", "Social", "Tecnología", "Otro"];
  const partidos = ["Todos", "Partido A", "Partido B", "Partido C", "Partido D"];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 bg-background">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold font-[Poppins] mb-2" data-testid="text-page-title">
              Noticias Políticas
            </h1>
            <p className="text-muted-foreground">
              Mantente informado sobre los últimos acontecimientos políticos y sociales
            </p>
          </div>

          {/* Filtros y Búsqueda */}
          <div className="mb-8 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Barra de búsqueda */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar noticias..."
                  className="pl-10"
                  data-testid="input-search-news"
                />
              </div>

              {/* Filtros */}
              <div className="flex gap-2">
                <Select defaultValue="todas">
                  <SelectTrigger className="w-[180px]" data-testid="select-news-type">
                    <SelectValue placeholder="Tipo de noticia" />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposNoticia.map((tipo) => (
                      <SelectItem key={tipo} value={tipo.toLowerCase()}>
                        {tipo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select defaultValue="todos">
                  <SelectTrigger className="w-[180px]" data-testid="select-party">
                    <SelectValue placeholder="Partido político" />
                  </SelectTrigger>
                  <SelectContent>
                    {partidos.map((partido) => (
                      <SelectItem key={partido} value={partido.toLowerCase()}>
                        {partido}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Tags populares */}
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-muted-foreground">Temas populares:</span>
              {["transparencia", "educación", "salud", "economía", "tecnología"].map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="cursor-pointer hover-elevate"
                  data-testid={`badge-tag-${tag}`}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Grid de Noticias */}
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : noticias.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No hay noticias disponibles</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {noticias.map((noticia: any) => (
                <NewsCard key={noticia.id} {...noticia} />
              ))}
            </div>
          )}

          {/* Paginación */}
          <div className="mt-12 flex justify-center gap-2">
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
      </main>

      <Footer />
    </div>
  );
}
