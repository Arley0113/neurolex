// Tarjeta de visualización de tokens para la plataforma Neurolex
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Coins, TrendingUp, Award } from "lucide-react";
import { cn } from "@/lib/utils";

interface TokenCardProps {
  tipo: "TP" | "TA" | "TGR";
  cantidad: number;
  descripcion: string;
  className?: string;
}

const tokenConfig = {
  TP: {
    nombre: "Tokens de Participación",
    icon: TrendingUp,
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-100 dark:bg-blue-950",
  },
  TA: {
    nombre: "Tokens de Apoyo",
    icon: Coins,
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-100 dark:bg-green-950",
  },
  TGR: {
    nombre: "Tokens de Gobernanza",
    icon: Award,
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-100 dark:bg-purple-950",
  },
};

export function TokenCard({ tipo, cantidad, descripcion, className }: TokenCardProps) {
  const config = tokenConfig[tipo];
  const Icon = config.icon;

  return (
    <Card className={cn("hover-elevate", className)} data-testid={`card-token-${tipo}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {config.nombre}
          </CardTitle>
          <div className={cn("p-2 rounded-md", config.bgColor)}>
            <Icon className={cn("h-4 w-4", config.color)} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-1">
          <p className={cn("text-4xl font-bold font-mono", config.color)} data-testid={`text-token-amount-${tipo}`}>
            {cantidad.toLocaleString()}
          </p>
          <CardDescription className="text-xs">
            {descripcion}
          </CardDescription>
        </div>
      </CardContent>
    </Card>
  );
}
