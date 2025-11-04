// Modal para donar tokens de apoyo (TA) a propuestas
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Coins, Heart, AlertCircle, Loader2 } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface DonateModalProps {
  isOpen: boolean;
  onClose: () => void;
  proposalId: string;
  proposalTitle: string;
}

export function DonateModal({ isOpen, onClose, proposalId, proposalTitle }: DonateModalProps) {
  const [amount, setAmount] = useState(10);
  const { toast } = useToast();

  // Cargar balance de tokens del usuario
  const { data: tokensBalance } = useQuery<any>({
    queryKey: ["/api/tokens"],
    enabled: isOpen,
  });

  const taBalance = tokensBalance?.tokensApoyo || 0;

  // Mutación para donar
  const donateMutation = useMutation({
    mutationFn: async (data: { proposalId: string; amount: number }) => {
      return apiRequest("/api/proposals/donate", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tokens"] });
      queryClient.invalidateQueries({ queryKey: ["/api/proposals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/proposals", proposalId] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      
      toast({
        title: "¡Donación exitosa!",
        description: `Has donado ${amount} TA a esta propuesta`,
      });
      
      onClose();
      setAmount(10);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error al donar",
        description: error.message || "No se pudo procesar la donación",
      });
    },
  });

  const handleDonate = () => {
    if (amount <= 0) {
      toast({
        variant: "destructive",
        title: "Cantidad inválida",
        description: "La cantidad debe ser mayor a 0",
      });
      return;
    }

    if (amount > taBalance) {
      toast({
        variant: "destructive",
        title: "Saldo insuficiente",
        description: "No tienes suficientes TA tokens",
      });
      return;
    }

    donateMutation.mutate({ proposalId, amount });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" data-testid="modal-donate">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-green-600 dark:text-green-400" />
            Donar a Propuesta
          </DialogTitle>
          <DialogDescription className="line-clamp-2">
            {proposalTitle}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Balance actual */}
          <div className="p-3 bg-muted rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Tu balance de TA</span>
              <div className="flex items-center gap-1">
                <Coins className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="font-mono font-semibold text-lg">{taBalance}</span>
                <span className="text-xs text-muted-foreground">TA</span>
              </div>
            </div>
          </div>

          {/* Input de cantidad */}
          <div className="space-y-2">
            <Label htmlFor="donate-amount">Cantidad a Donar</Label>
            <Input
              id="donate-amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
              min={1}
              max={taBalance}
              data-testid="input-donate-amount"
            />
            <p className="text-xs text-muted-foreground">
              Puedes donar hasta {taBalance} TA tokens
            </p>
          </div>

          {/* Cantidades sugeridas */}
          <div className="space-y-2">
            <Label>Cantidades Sugeridas</Label>
            <div className="flex gap-2">
              {[10, 50, 100, 500].map((suggested) => (
                <Button
                  key={suggested}
                  variant="outline"
                  size="sm"
                  onClick={() => setAmount(Math.min(suggested, taBalance))}
                  disabled={suggested > taBalance}
                  data-testid={`button-suggested-${suggested}`}
                >
                  {suggested} TA
                </Button>
              ))}
            </div>
          </div>

          {/* Advertencia si no tiene saldo */}
          {taBalance === 0 && (
            <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                  No tienes TA tokens
                </p>
                <p className="text-yellow-700 dark:text-yellow-300">
                  Puedes comprar TA tokens con criptomonedas en la sección de Monedero.
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} data-testid="button-cancel-donate">
            Cancelar
          </Button>
          <Button
            onClick={handleDonate}
            disabled={donateMutation.isPending || amount <= 0 || amount > taBalance}
            data-testid="button-confirm-donate"
          >
            {donateMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Donando...
              </>
            ) : (
              <>
                <Heart className="mr-2 h-4 w-4" />
                Donar {amount} TA
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
