// Panel de Administración - Gestión de Propuestas
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProposalSchema } from "@shared/schema";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { FileText, Loader2, Trash2, AlertCircle, ArrowLeft, Plus, Pencil, Eye } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function AdminPropuestas() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [proposalToDelete, setProposalToDelete] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProposal, setEditingProposal] = useState<any>(null);

  const { data: user, isError } = useQuery<any>({
    queryKey: ["/api/users/me"],
  });

  useEffect(() => {
    if (user === undefined && !isError) return; // Esperando carga
    if (!user || isError) {
      setLocation("/login");
    }
  }, [user, isError, setLocation]);

  const { data: proposals, isLoading } = useQuery<any[]>({
    queryKey: ["/api/proposals"],
    enabled: !!user,
  });

  const form = useForm({
    resolver: zodResolver(insertProposalSchema),
    defaultValues: {
      titulo: "",
      descripcion: "",
      contenidoCompleto: "",
      estado: "en_deliberacion" as const,
      categoria: "",
      partidoRelacionado: "",
      autorId: "",
    },
  });

  const createOrUpdateMutation = useMutation({
    mutationFn: async (data: any) => {
      if (editingProposal) {
        return apiRequest(`/api/proposals/${editingProposal.id}`, "PUT", data);
      } else {
        return apiRequest("/api/proposals", "POST", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/proposals"] });
      toast({
        title: editingProposal ? "Propuesta actualizada" : "Propuesta creada",
        description: `La propuesta ha sido ${editingProposal ? "actualizada" : "creada"} correctamente`,
      });
      setIsDialogOpen(false);
      form.reset();
      setEditingProposal(null);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "No se pudo guardar la propuesta",
      });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, estado }: { id: string; estado: string }) => {
      return apiRequest(`/api/admin/proposals/${id}/status`, "PUT", {
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
      return apiRequest(`/api/admin/proposals/${id}`, "DELETE");
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

  const handleEdit = (proposal: any) => {
    setEditingProposal(proposal);
    form.reset({
      titulo: proposal.titulo,
      descripcion: proposal.descripcion,
      contenidoCompleto: proposal.contenidoCompleto,
      estado: proposal.estado,
      categoria: proposal.categoria,
      partidoRelacionado: proposal.partidoRelacionado || "",
      autorId: proposal.autorId,
    });
    setIsDialogOpen(true);
  };

  const handleDialogChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setEditingProposal(null);
      form.reset();
    }
  };

  const onSubmit = (data: any) => {
    createOrUpdateMutation.mutate(data);
  };

  const getStatusBadgeVariant = (estado: string) => {
    switch (estado) {
      case "aprobada":
        return "default";
      case "rechazada":
        return "destructive";
      case "en_deliberacion":
      case "borrador":
        return "secondary";
      case "votacion":
        return "outline";
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
      case "en_deliberacion":
        return "En Deliberación";
      case "borrador":
        return "Borrador";
      case "votacion":
        return "En Votación";
      case "archivada":
        return "Archivada";
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
          <div className="flex items-center justify-between mb-6">
            <div>
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
                Crea, edita, revisa, aprueba o rechaza propuestas ciudadanas
              </p>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
              <DialogTrigger asChild>
                <Button data-testid="button-create-proposal">
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Propuesta
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingProposal ? "Editar Propuesta" : "Crear Nueva Propuesta"}
                  </DialogTitle>
                  <DialogDescription>
                    Completa los datos de la propuesta ciudadana
                  </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="titulo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Título *</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Título de la propuesta (mínimo 10 caracteres)"
                              data-testid="input-proposal-title"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="descripcion"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descripción *</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="Descripción breve (mínimo 20 caracteres)"
                              rows={3}
                              data-testid="input-proposal-description"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="contenidoCompleto"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contenido Completo *</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="Contenido detallado de la propuesta (mínimo 50 caracteres)"
                              rows={6}
                              data-testid="input-proposal-content"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="categoria"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Categoría *</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Ej: Educación, Salud, Economía"
                                data-testid="input-proposal-category"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="partidoRelacionado"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Partido Relacionado</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Ej: PSOE, PP, Podemos..."
                                data-testid="input-proposal-party"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Campo hidden para autorId */}
                    <FormField
                      control={form.control}
                      name="autorId"
                      render={({ field }) => (
                        <FormItem className="hidden">
                          <FormControl>
                            <Input type="hidden" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsDialogOpen(false)}
                        data-testid="button-cancel-proposal"
                      >
                        Cancelar
                      </Button>
                      <Button
                        type="submit"
                        disabled={createOrUpdateMutation.isPending}
                        data-testid="button-save-proposal"
                      >
                        {createOrUpdateMutation.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Guardando...
                          </>
                        ) : (
                          editingProposal ? "Actualizar" : "Crear"
                        )}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
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
                  No hay propuestas registradas. Crea la primera propuesta.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Título</TableHead>
                        <TableHead>Categoría</TableHead>
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
                          <TableCell>
                            <Badge variant="outline">{proposal.categoria}</Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {(() => {
                              try {
                                const date = proposal.createdAt ? new Date(proposal.createdAt) : null;
                                return date && !isNaN(date.getTime())
                                  ? format(date, "dd MMM yyyy", { locale: es })
                                  : "Fecha no disponible";
                              } catch {
                                return "Fecha no disponible";
                              }
                            })()}
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
                                <SelectItem value="borrador">Borrador</SelectItem>
                                <SelectItem value="en_deliberacion">En Deliberación</SelectItem>
                                <SelectItem value="votacion">En Votación</SelectItem>
                                <SelectItem value="aprobada">Aprobada</SelectItem>
                                <SelectItem value="rechazada">Rechazada</SelectItem>
                                <SelectItem value="archivada">Archivada</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Link href="/propuestas">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  data-testid={`button-view-${proposal.id}`}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(proposal)}
                                data-testid={`button-edit-${proposal.id}`}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setProposalToDelete(proposal.id)}
                                disabled={deleteMutation.isPending}
                                data-testid={`button-delete-${proposal.id}`}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
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
