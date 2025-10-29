// Página de propuestas ciudadanas para Neurolex
import { Link } from "wouter";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ProposalCard } from "@/components/ProposalCard";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus } from "lucide-react";

import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

export default function Propuestas() {
  // Cargar propuestas del backend
  const { data: propuestas = [], isLoading } = useQuery({
    queryKey: ["/api/proposals"],
  });

  const categorias = ["Todas", "Medio Ambiente", "Transporte", "Educación", "Salud", "Seguridad", "Tecnología", "Economía"];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 bg-background">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-start justify-between mb-8 gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold font-[Poppins] mb-2" data-testid="text-page-title">
                Propuestas Ciudadanas
              </h1>
              <p className="text-muted-foreground">
                Explora, apoya y crea propuestas para mejorar tu comunidad
              </p>
            </div>
            <Link href="/propuestas/nueva">
              <Button className="flex-shrink-0" data-testid="button-create-proposal">
                <Plus className="h-4 w-4 mr-2" />
                Nueva Propuesta
              </Button>
            </Link>
          </div>

          {/* Pestañas de estado */}
          <Tabs defaultValue="todas" className="mb-8">
            <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6" data-testid="tabs-proposal-status">
              <TabsTrigger value="todas">Todas</TabsTrigger>
              <TabsTrigger value="en_deliberacion">En Deliberación</TabsTrigger>
              <TabsTrigger value="votacion">En Votación</TabsTrigger>
              <TabsTrigger value="aprobada">Aprobadas</TabsTrigger>
              <TabsTrigger value="rechazada">Rechazadas</TabsTrigger>
              <TabsTrigger value="archivada">Archivadas</TabsTrigger>
            </TabsList>

            <TabsContent value="todas" className="space-y-6 mt-6">
              {/* Filtros y Búsqueda */}
              <div className="flex flex-col md:flex-row gap-4">
                {/* Barra de búsqueda */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar propuestas..."
                    className="pl-10"
                    data-testid="input-search-proposals"
                  />
                </div>

                {/* Filtros */}
                <div className="flex gap-2">
                  <Select defaultValue="todas">
                    <SelectTrigger className="w-[180px]" data-testid="select-category">
                      <SelectValue placeholder="Categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categorias.map((categoria) => (
                        <SelectItem key={categoria} value={categoria.toLowerCase()}>
                          {categoria}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select defaultValue="recientes">
                    <SelectTrigger className="w-[180px]" data-testid="select-sort">
                      <SelectValue placeholder="Ordenar por" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recientes">Más recientes</SelectItem>
                      <SelectItem value="populares">Más populares</SelectItem>
                      <SelectItem value="apoyos">Más apoyadas</SelectItem>
                      <SelectItem value="comentarios">Más comentadas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Categorías populares */}
              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-muted-foreground">Categorías:</span>
                {["Medio Ambiente", "Transporte", "Educación", "Salud", "Tecnología"].map((cat) => (
                  <Badge
                    key={cat}
                    variant="outline"
                    className="cursor-pointer hover-elevate"
                    data-testid={`badge-category-${cat}`}
                  >
                    {cat}
                  </Badge>
                ))}
              </div>

              {/* Grid de Propuestas */}
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : propuestas.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No hay propuestas disponibles</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {propuestas.map((propuesta: any) => (
                    <ProposalCard 
                      key={propuesta.id} 
                      {...propuesta}
                      autorNombre={propuesta.autorNombre || "Usuario"}
                      numComentarios={0}
                    />
                  ))}
                </div>
              )}

              {/* Paginación */}
              <div className="mt-8 flex justify-center gap-2">
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
            </TabsContent>

            {/* Los otros tabs tendrían contenido filtrado similar */}
            <TabsContent value="en_deliberacion">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {propuestas
                  .filter((p) => p.estado === "en_deliberacion")
                  .map((propuesta) => (
                    <ProposalCard key={propuesta.id} {...propuesta} />
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="votacion">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {propuestas
                  .filter((p) => p.estado === "votacion")
                  .map((propuesta) => (
                    <ProposalCard key={propuesta.id} {...propuesta} />
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="aprobada">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {propuestas
                  .filter((p) => p.estado === "aprobada")
                  .map((propuesta) => (
                    <ProposalCard key={propuesta.id} {...propuesta} />
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="rechazada">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {propuestas
                  .filter((p) => p.estado === "rechazada")
                  .map((propuesta) => (
                    <ProposalCard key={propuesta.id} {...propuesta} />
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="archivada">
              <div className="text-center py-12">
                <p className="text-muted-foreground">No hay propuestas archivadas</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
}
