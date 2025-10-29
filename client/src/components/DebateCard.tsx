import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Eye, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Link } from "wouter";

interface DebateCardProps {
  id: string;
  titulo: string;
  categoria: string;
  autorNombre: string;
  createdAt: Date;
  numRespuestas: number;
  numVistas: number;
  ultimaActividad?: Date;
  destacado?: boolean;
}

const categoriaColors: Record<string, string> = {
  politica: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
  economia: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300",
  social: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
  tecnologia: "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300",
  medioambiente: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  general: "bg-gray-100 text-gray-800 dark:bg-gray-950 dark:text-gray-300",
};

export function DebateCard({
  id,
  titulo,
  categoria,
  autorNombre,
  createdAt,
  numRespuestas,
  numVistas,
  ultimaActividad,
  destacado = false,
}: DebateCardProps) {
  const tiempoRelativo = formatDistanceToNow(new Date(createdAt), { addSuffix: true, locale: es });
  const ultimaActividadRelativa = ultimaActividad
    ? formatDistanceToNow(new Date(ultimaActividad), { addSuffix: true, locale: es })
    : null;

  return (
    <Link href={`/foro/${id}`}>
      <Card
        className={`hover-elevate p-4 cursor-pointer transition-all ${
          destacado ? "border-l-4 border-l-primary bg-primary/5" : ""
        }`}
        data-testid={`card-debate-${id}`}
      >
        <div className="flex items-start gap-4">
          {/* Icono de categoría */}
          <div className="flex-shrink-0">
            <Badge
              className={categoriaColors[categoria] || categoriaColors.general}
              data-testid={`badge-category-${id}`}
            >
              {categoria}
            </Badge>
          </div>

          {/* Contenido principal */}
          <div className="flex-1 min-w-0">
            <h3
              className="text-base font-semibold mb-1 line-clamp-2 hover:text-primary transition-colors"
              data-testid={`text-debate-title-${id}`}
            >
              {titulo}
            </h3>
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span data-testid={`text-author-${id}`}>
                Por <span className="font-medium">{autorNombre}</span>
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {tiempoRelativo}
              </span>
              {ultimaActividadRelativa && (
                <span className="text-primary">
                  Última actividad: {ultimaActividadRelativa}
                </span>
              )}
            </div>
          </div>

          {/* Estadísticas */}
          <div className="flex-shrink-0 flex flex-col items-end gap-2 text-sm">
            <div
              className="flex items-center gap-1 text-muted-foreground"
              data-testid={`text-replies-${id}`}
            >
              <MessageSquare className="h-4 w-4" />
              <span className="font-mono font-semibold">{numRespuestas}</span>
            </div>
            <div
              className="flex items-center gap-1 text-muted-foreground text-xs"
              data-testid={`text-views-${id}`}
            >
              <Eye className="h-3 w-3" />
              <span className="font-mono">{numVistas}</span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
