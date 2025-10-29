// Página de Monedero con historial de transacciones e integración MetaMask
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { TokenCard } from "@/components/TokenCard";
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
import { Loader2, Wallet, ArrowUpCircle, ArrowDownCircle, AlertCircle } from "lucide-react";
import { useEffect } from "react";
import { useLocation } from "wouter";
import { useWeb3 } from "@/hooks/useWeb3";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

export default function Monedero() {
  const [, setLocation] = useLocation();
  const userId = localStorage.getItem("userId");

  // Redirigir al login si no está autenticado
  useEffect(() => {
    if (!userId) {
      setLocation("/login");
    }
  }, [userId, setLocation]);

  // Cargar datos del usuario
  const { data: user } = useQuery<any>({
    queryKey: ["/api/users/me", userId],
    enabled: !!userId,
  });

  // Cargar balance de tokens
  const { data: tokensBalance, isLoading: loadingTokens } = useQuery<any>({
    queryKey: ["/api/tokens", userId],
    enabled: !!userId,
  });

  // Cargar historial de transacciones
  const { data: transactions = [], isLoading: loadingTransactions, isError, error } = useQuery<any[]>({
    queryKey: ["/api/transactions", userId],
    enabled: !!userId,
  });

  // Web3/MetaMask
  const { account, isConnected, connect, disconnect, isLoading: loadingWeb3, error: web3Error, isMetaMaskInstalled } = useWeb3();

  // Formatear dirección de wallet (mostrar solo primeros y últimos caracteres)
  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  // Mapeo de tipos de token a colores
  const tokenColors: Record<string, string> = {
    TP: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
    TA: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
    TGR: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
  };

  if (!userId) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={user} tokensBalance={tokensBalance} />

      <main className="flex-1 bg-background">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold font-[Poppins] mb-2" data-testid="text-monedero-title">
              Mi Monedero
            </h1>
            <p className="text-muted-foreground">
              Gestiona tus tokens y revisa tu historial de transacciones
            </p>
          </div>

          {/* Sección de MetaMask */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Wallet className="h-5 w-5" />
                    Billetera Web3
                  </CardTitle>
                  <CardDescription>
                    Conecta tu billetera MetaMask para interacciones blockchain
                  </CardDescription>
                </div>
                {isConnected ? (
                  <Button 
                    variant="outline" 
                    onClick={disconnect}
                    data-testid="button-disconnect-wallet"
                  >
                    Desconectar
                  </Button>
                ) : (
                  <Button 
                    onClick={connect} 
                    disabled={loadingWeb3 || !isMetaMaskInstalled}
                    data-testid="button-connect-wallet"
                  >
                    {loadingWeb3 ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Conectando...
                      </>
                    ) : (
                      <>
                        <Wallet className="mr-2 h-4 w-4" />
                        Conectar MetaMask
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {!isMetaMaskInstalled ? (
                <div className="flex items-center gap-2 p-4 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                  <div>
                    <p className="font-medium text-yellow-800 dark:text-yellow-200">
                      MetaMask no detectado
                    </p>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      Por favor instala la extensión de MetaMask para conectar tu billetera.
                    </p>
                  </div>
                </div>
              ) : isConnected && account ? (
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-1">Dirección conectada</p>
                    <p className="font-mono text-lg" data-testid="text-wallet-address">
                      {formatAddress(account)}
                    </p>
                  </div>
                  <Badge variant="outline" className="bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300">
                    Conectado
                  </Badge>
                </div>
              ) : web3Error ? (
                <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                  <p className="text-sm text-red-800 dark:text-red-200">{web3Error}</p>
                </div>
              ) : (
                <p className="text-muted-foreground">
                  No hay billetera conectada. Haz clic en "Conectar MetaMask" para vincular tu cuenta.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Saldos de Tokens */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold font-[Poppins] mb-4">Mis Tokens</h2>
            {loadingTokens ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="h-32 flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <TokenCard
                  tipo="TP"
                  cantidad={tokensBalance?.tokensParticipacion || 0}
                  descripcion="Ganados por participación activa"
                />
                <TokenCard
                  tipo="TA"
                  cantidad={tokensBalance?.tokensApoyo || 0}
                  descripcion="Comprados para apoyar propuestas"
                />
                <TokenCard
                  tipo="TGR"
                  cantidad={tokensBalance?.tokensGobernanza || 0}
                  descripcion="Ganados por contribuciones destacadas"
                />
              </div>
            )}
          </section>

          {/* Historial de Transacciones */}
          <section>
            <h2 className="text-2xl font-semibold font-[Poppins] mb-4">Historial de Transacciones</h2>
            <Card>
              <CardContent className="p-0">
                {loadingTransactions ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : isError ? (
                  <div className="flex flex-col items-center gap-2 py-12">
                    <AlertCircle className="h-12 w-12 text-destructive" />
                    <p className="text-destructive font-medium">Error al cargar transacciones</p>
                    <p className="text-sm text-muted-foreground">
                      {error instanceof Error ? error.message : "Por favor intenta de nuevo más tarde"}
                    </p>
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 py-12">
                    <Wallet className="h-12 w-12 text-muted-foreground" />
                    <p className="text-muted-foreground">No hay transacciones aún</p>
                    <p className="text-sm text-muted-foreground">
                      Tus movimientos de tokens aparecerán aquí
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Token</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead className="text-right">Cantidad</TableHead>
                        <TableHead>Descripción</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((tx: any) => (
                        <TableRow key={tx.id} data-testid={`row-transaction-${tx.id}`}>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDistanceToNow(new Date(tx.createdAt), {
                              addSuffix: true,
                              locale: es,
                            })}
                          </TableCell>
                          <TableCell>
                            <Badge className={tokenColors[tx.tipoToken]} variant="outline">
                              {tx.tipoToken}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm capitalize">
                            {tx.tipoTransaccion.replace(/_/g, " ")}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            <span className={tx.cantidad > 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
                              {tx.cantidad > 0 ? (
                                <ArrowUpCircle className="inline h-4 w-4 mr-1" />
                              ) : (
                                <ArrowDownCircle className="inline h-4 w-4 mr-1" />
                              )}
                              {tx.cantidad > 0 ? "+" : ""}
                              {tx.cantidad}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm">{tx.descripcion}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
