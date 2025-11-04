import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ArrowLeft, FileText, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Link } from "wouter";

const proposalFormSchema = z.object({
  titulo: z.string().min(10, "El título debe tener al menos 10 caracteres"),
  descripcion: z.string().min(20, "La descripción debe tener al menos 20 caracteres"),
  contenidoCompleto: z.string().min(50, "El contenido debe tener al menos 50 caracteres"),
  categoria: z.string().min(1, "La categoría es obligatoria"),
  partidoRelacionado: z.string().optional(),
  estado: z.string().default("borrador"),
});

type ProposalFormValues = z.infer<typeof proposalFormSchema>;

export default function PropuestaNueva() {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const { data: user } = useQuery({
    queryKey: ["/api/users/me"],
  });

  const { data: tokensBalance } = useQuery({
    queryKey: ["/api/tokens"],
    enabled: !!user,
  });

  const form = useForm<ProposalFormValues>({
    resolver: zodResolver(proposalFormSchema),
    defaultValues: {
      titulo: "",
      descripcion: "",
      contenidoCompleto: "",
      categoria: "",
      partidoRelacionado: "",
      estado: "borrador",
    },
  });

  const createProposalMutation = useMutation({
    mutationFn: async (data: ProposalFormValues) => {
      return apiRequest("/api/proposals", "POST", data);
    },
    onSuccess: (proposal: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/proposals"] });
      toast({
        title: "¡Propuesta creada!",
        description: "Tu propuesta ha sido enviada para revisión. +20 karma",
      });
      navigate(`/propuestas/${proposal.id}`);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "No se pudo crear la propuesta",
      });
    },
  });

  const onSubmit = (data: ProposalFormValues) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Debes iniciar sesión para crear una propuesta",
      });
      navigate("/login");
      return;
    }
    createProposalMutation.mutate(data);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar user={user} tokensBalance={tokensBalance} />
        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle>Acceso Requerido</CardTitle>
              <CardDescription>
                Debes iniciar sesión para crear una propuesta
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Link href="/login">
                <Button className="w-full" data-testid="button-login">
                  Iniciar Sesión
                </Button>
              </Link>
              <Link href="/propuestas">
                <Button variant="outline" className="w-full" data-testid="button-back">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver a Propuestas
                </Button>
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
      <Navbar user={user} tokensBalance={tokensBalance} />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <Link href="/propuestas">
              <Button variant="ghost" size="sm" className="mb-4" data-testid="button-back">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver a Propuestas
              </Button>
            </Link>
            
            <div className="flex items-center gap-3 mb-2">
              <FileText className="h-8 w-8 text-primary" />
              <h1 className="text-3xl md:text-4xl font-bold font-[Poppins]" data-testid="text-title">
                Crear Nueva Propuesta
              </h1>
            </div>
            <p className="text-muted-foreground">
              Presenta tu propuesta a la comunidad. Una vez creada, recibirás 20 puntos de karma.
            </p>
          </div>

          <Card>
            <CardContent className="pt-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                            data-testid="input-title"
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
                            data-testid="input-description"
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
                            placeholder="Explica tu propuesta en detalle (mínimo 50 caracteres)"
                            rows={8}
                            data-testid="input-content"
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
                              data-testid="input-category"
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
                          <FormLabel>Partido Relacionado (Opcional)</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Ej: PSOE, PP, Podemos..."
                              data-testid="input-party"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Link href="/propuestas" className="flex-1">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        data-testid="button-cancel"
                      >
                        Cancelar
                      </Button>
                    </Link>
                    <Button
                      type="submit"
                      className="flex-1"
                      disabled={createProposalMutation.isPending}
                      data-testid="button-submit"
                    >
                      {createProposalMutation.isPending && (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      )}
                      Crear Propuesta
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
