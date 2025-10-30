// Tarjeta de sondeo/encuesta para la plataforma Neurolex
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Clock, Users } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface PollOption {
  id: string;
  texto: string;
  votos: number;
}

interface PollCardProps {
  id: string;
  pregunta: string;
  descripcion?: string;
  opciones: PollOption[];
  totalVotos: number;
  fechaFin?: Date;
  hasVoted?: boolean;
  onVote?: (pollId: string, optionId: string) => void;
}

export function PollCard({
  id,
  pregunta,
  descripcion,
  opciones = [],
  totalVotos,
  fechaFin,
  hasVoted = false,
  onVote,
}: PollCardProps) {
  const tiempoRestante = fechaFin ? formatDistanceToNow(new Date(fechaFin), { addSuffix: false, locale: es }) : null;
  const isActive = fechaFin ? new Date(fechaFin) > new Date() : true;

  return (
    <Card className="hover-elevate" data-testid={`card-poll-${id}`}>
      <CardHeader>
        <div className="flex items-start justify-between gap-2 mb-2">
          <Badge variant={isActive ? "default" : "secondary"} data-testid={`badge-poll-status-${id}`}>
            <BarChart3 className="h-3 w-3 mr-1" />
            {isActive ? "Activo" : "Cerrado"}
          </Badge>
          {tiempoRestante && isActive && (
            <Badge variant="outline" className="text-xs">
              <Clock className="h-3 w-3 mr-1" />
              {tiempoRestante}
            </Badge>
          )}
        </div>
        
        <CardTitle className="text-xl" data-testid={`text-poll-question-${id}`}>
          {pregunta}
        </CardTitle>
        
        {descripcion && (
          <CardDescription data-testid={`text-poll-description-${id}`}>
            {descripcion}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {opciones.map((opcion) => {
          const porcentaje = totalVotos > 0 ? (opcion.votos / totalVotos) * 100 : 0;

          return (
            <div key={opcion.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => !hasVoted && isActive && onVote?.(id, opcion.id)}
                  disabled={hasVoted || !isActive}
                  className={`text-sm font-medium text-left hover:text-primary transition-colors ${
                    hasVoted || !isActive ? "cursor-not-allowed" : "cursor-pointer"
                  }`}
                  data-testid={`button-poll-option-${opcion.id}`}
                >
                  {opcion.texto}
                </button>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono font-semibold" data-testid={`text-poll-votes-${opcion.id}`}>
                    {opcion.votos}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ({porcentaje.toFixed(1)}%)
                  </span>
                </div>
              </div>
              <Progress value={porcentaje} className="h-2" />
            </div>
          );
        })}
      </CardContent>

      <CardFooter className="flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <Users className="h-4 w-4" />
          <span className="font-mono" data-testid={`text-poll-total-votes-${id}`}>
            {totalVotos}
          </span>
          <span>votos</span>
        </div>
        {hasVoted && (
          <Badge variant="secondary" className="text-xs">
            Ya has votado
          </Badge>
        )}
      </CardFooter>
    </Card>
  );
}
