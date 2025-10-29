// Panel de Administración - Gestión de Propuestas
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation, Link } from "wouter";
import { FileText, Loader2, Trash2, AlertCircle, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function AdminPropuestas() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const userId = localStorage.getItem("userId");
  const [proposalToDelete, setProposalToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLocation("/login");
    }
  }, [userId, setLocation]);

  const { data: user } = useQuery<any>({
    queryKey: ["/api/users/me", userId],
    enabled: !!userId,
  });

  const { data: proposals, isLoading } = useQuery<any[]>({
    queryKey: ["/api/proposals"],
    enabled: !!userId,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, estado }: { id: string; estado: string }) => {
      return apiRequest("PUT", `/api/admin/proposals/${id}/status`, {
        adminId: userId,
        estado,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/proposals"] });
      toast({
        title: "Estado actualizado",
        description: "El estado de la propuesta ha sido actualizado",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "No se pudo actualizar el estado",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/admin/proposals/${id}?adminId=${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/proposals"] });
      toast({
        title: "Propuesta eliminada",
        description: "La propuesta ha sido eliminada correctamente",
      });
      setProposalToDelete(null);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "No se pudo eliminar la propuesta",
      });
    },
  });

  const getStatusBadgeVariant = (estado: string) => {
    switch (estado) {
      case "aprobada":
        return "default";
      case "rechazada":
        return "destructive";
      case "en_revision":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getStatusLabel = (estado: string) => {
    switch (estado) {
      case "aprobada":
        return "Aprobada";
      case "rechazada":
        return "Rechazada";
      case "en_revision":
        return "En Revisión";
      default:
        return estado;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user.isAdmin) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar user={user} />
        <main className="flex-1 flex items-center justify-center bg-background">
          <Card className="max-w-md">
            <CardHeader>
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                <CardTitle>Acceso Denegado</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                No tienes permisos para acceder al panel de administración.
              </p>
              <Link href="/dashboard">
                <Button>Volver al Dashboard</Button>
              </Link>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={user} />

      <main className="flex-1 bg-background">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <Link href="/admin">
              <Button variant="ghost" size="sm" className="mb-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al Panel
              </Button>
            </Link>
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-8 w-8 text-primary" />
              <h1 className="text-3xl md:text-4xl font-bold font-[Poppins]" data-testid="text-admin-proposals-title">
                Gestión de Propuestas
              </h1>
            </div>
            <p className="text-muted-foreground">
              Revisa, aprueba o rechaza propuestas ciudadanas
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Todas las Propuestas</CardTitle>
              <CardDescription>
                {proposals?.length || 0} propuestas en total
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : !proposals || proposals.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No hay propuestas registradas
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Título</TableHead>
                        <TableHead>Autor</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Votos</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {proposals.map((proposal: any) => (
                        <TableRow key={proposal.id}>
                          <TableCell className="font-medium max-w-xs">
                            <div className="truncate" title={proposal.titulo}>
                              {proposal.titulo}
                            </div>
                          </TableCell>
                          <TableCell>{proposal.autorId}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {format(new Date(proposal.fechaCreacion), "dd MMM yyyy", { locale: es })}
                          </TableCell>
                          <TableCell>{proposal.votos || 0}</TableCell>
                          <TableCell>
                            <Select
                              value={proposal.estado}
                              onValueChange={(value) =>
                                updateStatusMutation.mutate({ id: proposal.id, estado: value })
                              }
                              disabled={updateStatusMutation.isPending}
                            >
                              <SelectTrigger className="w-40" data-testid={`select-status-${proposal.id}`}>
                                <SelectValue>
                                  <Badge variant={getStatusBadgeVariant(proposal.estado)}>
                                    {getStatusLabel(proposal.estado)}
                                  </Badge>
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="en_revision">En Revisión</SelectItem>
                                <SelectItem value="aprobada">Aprobada</SelectItem>
                                <SelectItem value="rechazada">Rechazada</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setProposalToDelete(proposal.id)}
                              disabled={deleteMutation.isPending}
                              data-testid={`button-delete-${proposal.id}`}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />

      <AlertDialog open={!!proposalToDelete} onOpenChange={() => setProposalToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar propuesta?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La propuesta será eliminada permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => proposalToDelete && deleteMutation.mutate(proposalToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
