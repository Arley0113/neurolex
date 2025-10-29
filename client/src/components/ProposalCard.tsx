// Tarjeta de propuesta ciudadana para la plataforma Neurolex
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ThumbsUp, MessageSquare, TrendingUp, Coins, Heart } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Link } from "wouter";
import { DonateModal } from "./DonateModal";

interface ProposalCardProps {
  id: string;
  titulo: string;
  descripcion: string;
  categoria: string;
  estado: string;
  apoyosTP: number;
  apoyosTA: number;
  autorNombre: string;
  createdAt: Date;
  numComentarios?: number;
}

const estadoConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  borrador: { label: "Borrador", variant: "secondary" },
  en_deliberacion: { label: "En Deliberación", variant: "default" },
  votacion: { label: "En Votación", variant: "default" },
  aprobada: { label: "Aprobada", variant: "default" },
  rechazada: { label: "Rechazada", variant: "destructive" },
  archivada: { label: "Archivada", variant: "outline" },
};

export function ProposalCard({
  id,
  titulo,
  descripcion,
  categoria,
  estado,
  apoyosTP,
  apoyosTA,
  autorNombre,
  createdAt,
  numComentarios = 0,
}: ProposalCardProps) {
  const estadoInfo = estadoConfig[estado] || estadoConfig.borrador;
  const tiempoRelativo = formatDistanceToNow(new Date(createdAt), { addSuffix: true, locale: es });
  const [isDonateModalOpen, setIsDonateModalOpen] = useState(false);

  return (
    <Card className="hover-elevate h-full flex flex-col" data-testid={`card-proposal-${id}`}>
      <CardHeader className="flex-none">
        <div className="flex items-start justify-between gap-2 mb-2">
          <Badge variant="outline" data-testid={`badge-category-${id}`}>
            {categoria}
          </Badge>
          <Badge variant={estadoInfo.variant} data-testid={`badge-status-${id}`}>
            {estadoInfo.label}
          </Badge>
        </div>
        <CardTitle className="text-xl line-clamp-2" data-testid={`text-proposal-title-${id}`}>
          {titulo}
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Por {autorNombre} • {tiempoRelativo}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1">
        <p className="text-sm text-muted-foreground line-clamp-3" data-testid={`text-proposal-description-${id}`}>
          {descripcion}
        </p>
      </CardContent>

      <CardFooter className="flex-none flex-col gap-3">
        {/* Estadísticas de apoyo */}
        <div className="flex items-center justify-between w-full text-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-muted-foreground">
              <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="font-mono font-semibold" data-testid={`text-support-tp-${id}`}>
                {apoyosTP}
              </span>
              <span className="text-xs">TP</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Coins className="h-4 w-4 text-green-600 dark:text-green-400" />
              <span className="font-mono font-semibold" data-testid={`text-support-ta-${id}`}>
                {apoyosTA}
              </span>
              <span className="text-xs">TA</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <MessageSquare className="h-4 w-4" />
              <span className="font-mono" data-testid={`text-comments-${id}`}>
                {numComentarios}
              </span>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-2 w-full">
          <Link href={`/propuestas/${id}`} className="flex-1">
            <Button variant="outline" className="w-full" data-testid={`button-view-proposal-${id}`}>
              Ver Detalles
            </Button>
          </Link>
          <Button 
            variant="default" 
            size="icon" 
            onClick={() => setIsDonateModalOpen(true)}
            data-testid={`button-donate-${id}`}
          >
            <Heart className="h-4 w-4" />
          </Button>
          <Button variant="default" size="icon" data-testid={`button-support-${id}`}>
            <ThumbsUp className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>

      {/* Modal de donación */}
      <DonateModal
        isOpen={isDonateModalOpen}
        onClose={() => setIsDonateModalOpen(false)}
        proposalId={id}
        proposalTitle={titulo}
      />
    </Card>
  );
}
