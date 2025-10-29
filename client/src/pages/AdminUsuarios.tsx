// Panel de Administración - Gestión de Usuarios
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation, Link } from "wouter";
import { Users, Loader2, Shield, AlertCircle, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function AdminUsuarios() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (!userId) {
      setLocation("/login");
    }
  }, [userId, setLocation]);

  const { data: currentUser } = useQuery<any>({
    queryKey: ["/api/users/me", userId],
    enabled: !!userId,
  });

  const { data: users, isLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/users"],
    queryFn: async () => {
      const res = await fetch(`/api/admin/users?adminId=${userId}`);
      if (!res.ok) throw new Error("Error al cargar usuarios");
      return res.json();
    },
    enabled: !!userId,
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return apiRequest("PUT", `/api/admin/users/${id}`, {
        adminId: userId,
        ...data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Usuario actualizado",
        description: "Los datos del usuario han sido actualizados",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "No se pudo actualizar el usuario",
      });
    },
  });

  const handleLevelChange = (id: string, nivel: string) => {
    updateUserMutation.mutate({ id, data: { nivel } });
  };

  const handleAdminToggle = (id: string, isAdmin: boolean) => {
    updateUserMutation.mutate({ id, data: { isAdmin } });
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!currentUser.isAdmin) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar user={currentUser} />
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
      <Navbar user={currentUser} />

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
              <Users className="h-8 w-8 text-primary" />
              <h1 className="text-3xl md:text-4xl font-bold font-[Poppins]" data-testid="text-admin-users-title">
                Gestión de Usuarios
              </h1>
            </div>
            <p className="text-muted-foreground">
              Administra niveles de acceso y permisos de usuarios
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Todos los Usuarios</CardTitle>
              <CardDescription>
                {users?.length || 0} usuarios registrados
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : !users || users.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No hay usuarios registrados
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Usuario</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Registro</TableHead>
                        <TableHead>Karma</TableHead>
                        <TableHead>Nivel</TableHead>
                        <TableHead>Administrador</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user: any) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              {user.username}
                              {user.isAdmin && (
                                <Shield className="h-3 w-3 text-primary" />
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {user.email}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {format(new Date(user.fechaRegistro), "dd MMM yyyy", { locale: es })}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{user.karma || 0} pts</Badge>
                          </TableCell>
                          <TableCell>
                            <Select
                              value={user.nivel}
                              onValueChange={(value) => handleLevelChange(user.id, value)}
                              disabled={updateUserMutation.isPending || user.id === userId}
                            >
                              <SelectTrigger className="w-32" data-testid={`select-level-${user.id}`}>
                                <SelectValue>
                                  <Badge variant={user.nivel === "verificado" ? "default" : "outline"}>
                                    {user.nivel === "verificado" ? "Verificado" : "Básico"}
                                  </Badge>
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="basico">Básico</SelectItem>
                                <SelectItem value="verificado">Verificado</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={user.isAdmin}
                                onCheckedChange={(checked) => handleAdminToggle(user.id, checked)}
                                disabled={updateUserMutation.isPending || user.id === userId}
                                data-testid={`switch-admin-${user.id}`}
                              />
                              <span className="text-sm text-muted-foreground">
                                {user.isAdmin ? "Sí" : "No"}
                              </span>
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
    </div>
  );
}
