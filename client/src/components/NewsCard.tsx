// Tarjeta de noticia para la plataforma Neurolex
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Link } from "wouter";

interface NewsCardProps {
  id: string;
  titulo: string;
  resumen?: string;
  imagenUrl?: string;
  tipo: string;
  partidoRelacionado?: string;
  etiquetas?: string[];
  fuente?: string;
  createdAt: Date;
}

const tipoColors: Record<string, string> = {
  nacional: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
  internacional: "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300",
  economia: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300",
  social: "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300",
  tecnologia: "bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300",
  otro: "bg-gray-100 text-gray-800 dark:bg-gray-950 dark:text-gray-300",
};

export function NewsCard({
  id,
  titulo,
  resumen,
  imagenUrl,
  tipo,
  partidoRelacionado,
  etiquetas,
  fuente,
  createdAt,
}: NewsCardProps) {
  const tiempoRelativo = formatDistanceToNow(new Date(createdAt), { addSuffix: true, locale: es });

  return (
    <Link href={`/noticias/${id}`}>
      <Card className="hover-elevate h-full flex flex-col overflow-hidden cursor-pointer" data-testid={`card-news-${id}`}>
        {imagenUrl && (
          <div className="aspect-video w-full overflow-hidden bg-muted">
            <img
              src={imagenUrl}
              alt={titulo}
              className="w-full h-full object-cover transition-transform duration-200 hover:scale-105"
              data-testid={`img-news-${id}`}
            />
          </div>
        )}
        
        <CardHeader className="flex-none">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <Badge className={tipoColors[tipo] || tipoColors.otro} data-testid={`badge-news-type-${id}`}>
              {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
            </Badge>
            {partidoRelacionado && (
              <Badge variant="outline" data-testid={`badge-party-${id}`}>
                {partidoRelacionado}
              </Badge>
            )}
          </div>
          
          <CardTitle className="text-lg line-clamp-2" data-testid={`text-news-title-${id}`}>
            {titulo}
          </CardTitle>
          
          <CardDescription className="text-xs">
            {fuente && <span>{fuente} • </span>}
            {tiempoRelativo}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col">
          {resumen && (
            <p className="text-sm text-muted-foreground line-clamp-3 mb-3" data-testid={`text-news-summary-${id}`}>
              {resumen}
            </p>
          )}
          
          {etiquetas && etiquetas.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-auto">
              {etiquetas.slice(0, 3).map((etiqueta, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {etiqueta}
                </Badge>
              ))}
              {etiquetas.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{etiquetas.length - 3}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
