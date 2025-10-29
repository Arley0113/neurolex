// Panel de Administración - Dashboard principal
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Newspaper, 
  FileText, 
  BarChart3, 
  Shield, 
  AlertCircle,
  Loader2 
} from "lucide-react";
import { useEffect } from "react";
import { useLocation, Link } from "wouter";

export default function Admin() {
  const [, setLocation] = useLocation();
  const userId = localStorage.getItem("userId");

  // Redirigir al login si no está autenticado
  useEffect(() => {
    if (!userId) {
      setLocation("/login");
    }
  }, [userId, setLocation]);

  // Cargar datos del usuario
  const { data: user, isLoading: loadingUser } = useQuery({
    queryKey: ["/api/users/me", userId],
    enabled: !!userId,
  });

  // Cargar estadísticas (requiere ser admin)
  const { data: stats, isLoading: loadingStats, isError } = useQuery({
    queryKey: ["/api/admin/stats"],
    queryFn: async () => {
      const res = await fetch(`/api/admin/stats?adminId=${userId}`);
      if (!res.ok) throw new Error("No tienes permisos de administrador");
      return res.json();
    },
    enabled: !!userId,
  });

  // Verificar que el usuario sea admin
  if (loadingUser || !user) {
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
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-8 w-8 text-primary" />
              <h1 className="text-3xl md:text-4xl font-bold font-[Poppins]" data-testid="text-admin-title">
                Panel de Administración
              </h1>
            </div>
            <p className="text-muted-foreground">
              Gestiona el contenido y usuarios de Neurolex
            </p>
          </div>

          {/* Estadísticas */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold font-[Poppins] mb-4">Estadísticas Generales</h2>
            {loadingStats ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="h-32 flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </Card>
                ))}
              </div>
            ) : isError ? (
              <Card className="border-destructive">
                <CardContent className="pt-6">
                  <p className="text-destructive">Error al cargar estadísticas</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="hover-elevate">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Total de Usuarios
                      </CardTitle>
                      <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                      {stats?.totalUsers || 0}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stats?.verifiedUsers || 0} verificados
                    </p>
                  </CardContent>
                </Card>

                <Card className="hover-elevate">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Noticias Publicadas
                      </CardTitle>
                      <Newspaper className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-4xl font-bold text-green-600 dark:text-green-400">
                      {stats?.totalNews || 0}
                    </p>
                  </CardContent>
                </Card>

                <Card className="hover-elevate">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Propuestas Activas
                      </CardTitle>
                      <FileText className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-4xl font-bold text-purple-600 dark:text-purple-400">
                      {stats?.totalProposals || 0}
                    </p>
                  </CardContent>
                </Card>

                <Card className="hover-elevate">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Sondeos Totales
                      </CardTitle>
                      <BarChart3 className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-4xl font-bold text-orange-600 dark:text-orange-400">
                      {stats?.totalPolls || 0}
                    </p>
                  </CardContent>
                </Card>

                <Card className="hover-elevate">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Administradores
                      </CardTitle>
                      <Shield className="h-4 w-4 text-red-600 dark:text-red-400" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-4xl font-bold text-red-600 dark:text-red-400">
                      {stats?.adminUsers || 0}
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}
          </section>

          {/* Acciones Rápidas */}
          <section>
            <h2 className="text-2xl font-semibold font-[Poppins] mb-4">Gestión de Contenido</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link href="/admin/noticias">
                <Card className="hover-elevate cursor-pointer h-full" data-testid="card-admin-news">
                  <CardHeader>
                    <Newspaper className="h-8 w-8 text-primary mb-2" />
                    <CardTitle>Noticias</CardTitle>
                    <CardDescription>
                      Crear, editar y eliminar noticias políticas
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>

              <Link href="/admin/propuestas">
                <Card className="hover-elevate cursor-pointer h-full" data-testid="card-admin-proposals">
                  <CardHeader>
                    <FileText className="h-8 w-8 text-primary mb-2" />
                    <CardTitle>Propuestas</CardTitle>
                    <CardDescription>
                      Moderar y cambiar estados de propuestas
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>

              <Link href="/admin/sondeos">
                <Card className="hover-elevate cursor-pointer h-full" data-testid="card-admin-polls">
                  <CardHeader>
                    <BarChart3 className="h-8 w-8 text-primary mb-2" />
                    <CardTitle>Sondeos</CardTitle>
                    <CardDescription>
                      Crear y gestionar sondeos de opinión
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>

              <Link href="/admin/usuarios">
                <Card className="hover-elevate cursor-pointer h-full" data-testid="card-admin-users">
                  <CardHeader>
                    <Users className="h-8 w-8 text-primary mb-2" />
                    <CardTitle>Usuarios</CardTitle>
                    <CardDescription>
                      Gestionar niveles y permisos de usuarios
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
