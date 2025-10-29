// Panel de Administración - Gestión de Sondeos
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
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
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation, Link } from "wouter";
import { BarChart3, Loader2, Plus, X, AlertCircle, ArrowLeft, Eye, Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const pollSchema = z.object({
  titulo: z.string().min(5, "El título debe tener al menos 5 caracteres"),
  descripcion: z.string().min(10, "La descripción debe tener al menos 10 caracteres"),
  fechaCierre: z.string().optional(),
});

type PollFormData = z.infer<typeof pollSchema>;

export default function AdminSondeos() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const userId = localStorage.getItem("userId");
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPoll, setEditingPoll] = useState<any>(null);

  useEffect(() => {
    if (!userId) {
      setLocation("/login");
    }
  }, [userId, setLocation]);

  const { data: user } = useQuery<any>({
    queryKey: ["/api/users/me", userId],
    enabled: !!userId,
  });

  const { data: polls, isLoading } = useQuery<any[]>({
    queryKey: ["/api/polls"],
    enabled: !!userId,
  });

  const form = useForm<PollFormData>({
    resolver: zodResolver(pollSchema),
    defaultValues: {
      titulo: "",
      descripcion: "",
      fechaCierre: "",
    },
  });

  const createPollMutation = useMutation({
    mutationFn: async (data: PollFormData & { opciones: string[] }) => {
      return apiRequest("POST", "/api/admin/polls", {
        adminId: userId,
        ...data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/polls"] });
      toast({
        title: "Sondeo creado",
        description: "El sondeo ha sido creado exitosamente",
      });
      form.reset();
      setOptions(["", ""]);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "No se pudo crear el sondeo",
      });
    },
  });

  const updatePollMutation = useMutation({
    mutationFn: async (data: { id: string } & Partial<PollFormData>) => {
      const { id, ...pollData } = data;
      return apiRequest("PUT", `/api/admin/polls/${id}`, {
        adminId: userId,
        ...pollData,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/polls"] });
      toast({
        title: "Sondeo actualizado",
        description: "El sondeo ha sido actualizado exitosamente",
      });
      setIsEditDialogOpen(false);
      setEditingPoll(null);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "No se pudo actualizar el sondeo",
      });
    },
  });

  const deletePollMutation = useMutation({
    mutationFn: async (pollId: string) => {
      return apiRequest("DELETE", `/api/admin/polls/${pollId}?adminId=${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/polls"] });
      toast({
        title: "Sondeo eliminado",
        description: "El sondeo ha sido eliminado exitosamente",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "No se pudo eliminar el sondeo",
      });
    },
  });

  const onSubmit = (data: PollFormData) => {
    const validOptions = options.filter((opt) => opt.trim() !== "");
    
    if (validOptions.length < 2) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Debes agregar al menos 2 opciones",
      });
      return;
    }

    createPollMutation.mutate({
      ...data,
      opciones: validOptions,
    });
  };

  const addOption = () => {
    setOptions([...options, ""]);
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleEdit = (poll: any) => {
    setEditingPoll(poll);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (pollId: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar este sondeo?")) {
      deletePollMutation.mutate(pollId);
    }
  };

  const handleUpdatePoll = (data: PollFormData) => {
    if (!editingPoll) return;
    updatePollMutation.mutate({
      id: editingPoll.id,
      ...data,
    });
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
              <BarChart3 className="h-8 w-8 text-primary" />
              <h1 className="text-3xl md:text-4xl font-bold font-[Poppins]" data-testid="text-admin-polls-title">
                Gestión de Sondeos
              </h1>
            </div>
            <p className="text-muted-foreground">
              Crea nuevos sondeos para la participación ciudadana
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Formulario para crear sondeo */}
            <Card>
              <CardHeader>
                <CardTitle>Crear Nuevo Sondeo</CardTitle>
                <CardDescription>
                  Define el título, descripción y opciones del sondeo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="titulo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Título del Sondeo</FormLabel>
                          <FormControl>
                            <Input placeholder="¿Cuál es tu opinión sobre...?" {...field} data-testid="input-poll-title" />
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
                          <FormLabel>Descripción</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe el contexto del sondeo..."
                              className="resize-none"
                              rows={3}
                              {...field}
                              data-testid="input-poll-description"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="fechaCierre"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fecha de Cierre (Opcional)</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} data-testid="input-poll-close-date" />
                          </FormControl>
                          <FormDescription>
                            Deja vacío para mantener el sondeo abierto indefinidamente
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <FormLabel>Opciones</FormLabel>
                        <Button type="button" size="sm" variant="outline" onClick={addOption} data-testid="button-add-option">
                          <Plus className="h-4 w-4 mr-1" />
                          Agregar Opción
                        </Button>
                      </div>
                      {options.map((option, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            placeholder={`Opción ${index + 1}`}
                            value={option}
                            onChange={(e) => updateOption(index, e.target.value)}
                            data-testid={`input-option-${index}`}
                          />
                          {options.length > 2 && (
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              onClick={() => removeOption(index)}
                              data-testid={`button-remove-option-${index}`}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <p className="text-xs text-muted-foreground">
                        Mínimo 2 opciones requeridas
                      </p>
                    </div>

                    <Button type="submit" className="w-full" disabled={createPollMutation.isPending} data-testid="button-create-poll">
                      {createPollMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creando...
                        </>
                      ) : (
                        "Crear Sondeo"
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* Lista de sondeos existentes */}
            <Card>
              <CardHeader>
                <CardTitle>Sondeos Existentes</CardTitle>
                <CardDescription>
                  {polls?.length || 0} sondeos en total
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : !polls || polls.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No hay sondeos registrados
                  </p>
                ) : (
                  <div className="space-y-4 max-h-[600px] overflow-y-auto">
                    {polls.map((poll: any) => (
                      <Card key={poll.id} className="hover-elevate">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between gap-2">
                            <CardTitle className="text-base line-clamp-1">{poll.titulo}</CardTitle>
                            <div className="flex gap-2 flex-shrink-0">
                              <Badge variant={poll.activo ? "default" : "secondary"}>
                                {poll.activo ? "Activo" : "Cerrado"}
                              </Badge>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {poll.descripcion}
                          </p>
                          <div className="text-xs text-muted-foreground">
                            Creado: {format(new Date(poll.fechaCreacion), "dd MMM yyyy", { locale: es })}
                          </div>
                          <div className="flex gap-2">
                            <Link href="/sondeos" className="flex-1">
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full"
                                data-testid={`button-view-poll-${poll.id}`}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Ver
                              </Button>
                            </Link>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(poll)}
                              data-testid={`button-edit-poll-${poll.id}`}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(poll.id)}
                              disabled={deletePollMutation.isPending}
                              data-testid={`button-delete-poll-${poll.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />

      {/* Dialog de edición */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Sondeo</DialogTitle>
            <DialogDescription>
              Modifica los detalles del sondeo
            </DialogDescription>
          </DialogHeader>
          {editingPoll && (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleUpdatePoll)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="titulo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título del Sondeo</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          defaultValue={editingPoll.titulo}
                          data-testid="input-edit-poll-title" 
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
                      <FormLabel>Descripción</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          defaultValue={editingPoll.descripcion}
                          className="resize-none"
                          rows={3}
                          data-testid="input-edit-poll-description"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fechaCierre"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha de Cierre (Opcional)</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          {...field}
                          defaultValue={editingPoll.fechaCierre ? editingPoll.fechaCierre.split('T')[0] : ""}
                          data-testid="input-edit-poll-close-date" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-2 justify-end">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsEditDialogOpen(false)}
                    data-testid="button-cancel-edit"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={updatePollMutation.isPending}
                    data-testid="button-submit-edit"
                  >
                    {updatePollMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      "Guardar Cambios"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
