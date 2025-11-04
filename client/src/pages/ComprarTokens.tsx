// Página para comprar Tokens de Apoyo (TA) con criptomonedas
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useWeb3 } from "@/hooks/useWeb3";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Coins, Wallet, ArrowRight, AlertCircle, CheckCircle, Loader2, ExternalLink } from "lucide-react";
import { parseEther } from "ethers";
import { BLOCKCHAIN_CONFIG, calculateETHPrice, calculateTAAmount } from "@shared/blockchain-config";

export default function ComprarTokens() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [taAmount, setTaAmount] = useState(100);
  const [ethAmount, setEthAmount] = useState(calculateETHPrice(100));
  const [txHash, setTxHash] = useState<string | null>(null);
  const [isLinkingWallet, setIsLinkingWallet] = useState(false);

  // Cargar datos del usuario
  const { data: user } = useQuery<any>({
    queryKey: ["/api/users/me"],
  });

  // Redirigir al login si no está autenticado
  useEffect(() => {
    if (user === undefined) return; // Esperando carga
    if (!user) {
      setLocation("/login");
    }
  }, [user, setLocation]);

  // Cargar balance de tokens
  const { data: tokensBalance } = useQuery<any>({
    queryKey: ["/api/tokens"],
    enabled: !!user,
  });

  // Web3/MetaMask
  const { account, isConnected, connect, isLoading: loadingWeb3, error: web3Error, isMetaMaskInstalled } = useWeb3();

  // Vincular wallet al usuario con firma criptográfica
  useEffect(() => {
    const linkWalletWithSignature = async () => {
      if (isConnected && account && user && !user.walletAddress && !isLinkingWallet) {
        setIsLinkingWallet(true);
        try {
          // 1. Crear mensaje para firmar
          const message = `Vincular wallet a Neurolex\nUsuario: ${user.id}\nWallet: ${account}\nFecha: ${new Date().toISOString()}`;
          
          // 2. Solicitar firma al usuario con MetaMask
          const signature = await window.ethereum?.request({
            method: "personal_sign",
            params: [message, account],
          });

          // 3. Enviar firma al backend para verificar y vincular
          await apiRequest("/api/users/link-wallet", "POST", {
            walletAddress: account,
            message,
            signature,
          });

          // Refrescar datos del usuario para mostrar wallet vinculada
          queryClient.invalidateQueries({ queryKey: ["/api/users/me"] });
          
          toast({
            title: "Wallet vinculada",
            description: "Tu wallet de MetaMask ha sido vinculada exitosamente",
          });
        } catch (error: any) {
          console.error("Error al vincular wallet:", error);
          toast({
            variant: "destructive",
            title: "Error al vincular wallet",
            description: error.message || "No se pudo vincular la wallet",
          });
        } finally {
          setIsLinkingWallet(false);
        }
      }
    };

    linkWalletWithSignature();
  }, [isConnected, account, user, toast, isLinkingWallet]);

  // Mutación para registrar la compra en el backend
  const purchaseMutation = useMutation({
    mutationFn: async (data: { taAmount: number; ethAmount: string; txHash: string }) => {
      return apiRequest("/api/tokens/purchase", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tokens"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      toast({
        title: "¡Compra exitosa!",
        description: `Has adquirido ${taAmount} Tokens de Apoyo`,
      });
      setTaAmount(100);
      setTxHash(null);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error en la compra",
        description: error.message || "No se pudo procesar la transacción",
      });
    },
  });

  // Actualizar precio en ETH cuando cambia la cantidad de TA
  const handleTAChange = (value: string) => {
    const ta = parseInt(value) || 0;
    setTaAmount(ta);
    setEthAmount(calculateETHPrice(ta));
  };

  // Actualizar cantidad de TA cuando cambia el precio en ETH
  const handleETHChange = (value: string) => {
    setEthAmount(value);
    const ta = calculateTAAmount(value);
    setTaAmount(ta);
  };

  // Procesar compra con MetaMask
  const handlePurchase = async () => {
    if (!isConnected || !account || !window.ethereum) {
      toast({
        variant: "destructive",
        title: "MetaMask no conectado",
        description: "Por favor conecta tu billetera MetaMask",
      });
      return;
    }

    if (!user?.walletAddress) {
      toast({
        variant: "destructive",
        title: "Wallet no vinculada",
        description: "Espera a que se vincule tu wallet automáticamente",
      });
      return;
    }

    if (taAmount < BLOCKCHAIN_CONFIG.tokenPrice.minPurchase) {
      toast({
        variant: "destructive",
        title: "Cantidad mínima no alcanzada",
        description: `Debes comprar al menos ${BLOCKCHAIN_CONFIG.tokenPrice.minPurchase} TA`,
      });
      return;
    }

    if (taAmount > BLOCKCHAIN_CONFIG.tokenPrice.maxPurchase) {
      toast({
        variant: "destructive",
        title: "Cantidad máxima excedida",
        description: `Puedes comprar máximo ${BLOCKCHAIN_CONFIG.tokenPrice.maxPurchase} TA`,
      });
      return;
    }

    try {
      // Preparar transacción
      const tx = {
        from: account,
        to: BLOCKCHAIN_CONFIG.platformWallet,
        value: parseEther(ethAmount).toString(),
        gasLimit: BLOCKCHAIN_CONFIG.gasLimit,
      };

      // Enviar transacción con MetaMask
      const txHash = await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [tx],
      });

      setTxHash(txHash as string);

      toast({
        title: "Transacción enviada",
        description: "Esperando confirmación en la blockchain...",
      });

      // Registrar la compra en el backend
      purchaseMutation.mutate({
        taAmount,
        ethAmount,
        txHash: txHash as string,
      });

    } catch (error: any) {
      console.error("Error en la transacción:", error);
      toast({
        variant: "destructive",
        title: "Error en la transacción",
        description: error.message || "La transacción fue rechazada",
      });
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={user} tokensBalance={tokensBalance} />

      <main className="flex-1 bg-background">
        <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold font-[Poppins] mb-2" data-testid="text-page-title">
              Comprar Tokens de Apoyo
            </h1>
            <p className="text-muted-foreground">
              Adquiere TA tokens con Ethereum para donar a propuestas y partidos políticos
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Formulario de compra */}
            <div className="lg:col-span-2 space-y-6">
              {/* Conexión MetaMask */}
              {!isMetaMaskInstalled ? (
                <Card className="border-yellow-200 dark:border-yellow-800">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                          MetaMask requerido
                        </p>
                        <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-3">
                          Necesitas instalar MetaMask para comprar tokens con criptomonedas.
                        </p>
                        <a
                          href="https://metamask.io/download/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                        >
                          Instalar MetaMask
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : !isConnected ? (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center space-y-4">
                      <Wallet className="h-12 w-12 mx-auto text-muted-foreground" />
                      <div>
                        <h3 className="font-semibold mb-2">Conecta tu billetera</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Conecta MetaMask para comprar tokens
                        </p>
                      </div>
                      <Button onClick={connect} disabled={loadingWeb3} data-testid="button-connect-wallet">
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
                      {web3Error && (
                        <p className="text-sm text-destructive">{web3Error}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {/* Wallet conectada */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Billetera Conectada</CardTitle>
                        <Badge variant="outline" className="bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          {user?.walletAddress ? "Vinculada" : "Vinculando..."}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="font-mono text-sm" data-testid="text-wallet-address">
                        {account}
                      </p>
                      {isLinkingWallet && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Firmando mensaje para vincular wallet...
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Calculadora de compra */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Cantidad a Comprar</CardTitle>
                      <CardDescription>
                        1 TA = {BLOCKCHAIN_CONFIG.tokenPrice.ethPerTA} ETH
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Cantidad de TA */}
                      <div>
                        <Label htmlFor="ta-amount">Tokens de Apoyo (TA)</Label>
                        <Input
                          id="ta-amount"
                          type="number"
                          value={taAmount}
                          onChange={(e) => handleTAChange(e.target.value)}
                          min={BLOCKCHAIN_CONFIG.tokenPrice.minPurchase}
                          max={BLOCKCHAIN_CONFIG.tokenPrice.maxPurchase}
                          data-testid="input-ta-amount"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Mínimo: {BLOCKCHAIN_CONFIG.tokenPrice.minPurchase} TA | Máximo: {BLOCKCHAIN_CONFIG.tokenPrice.maxPurchase} TA
                        </p>
                      </div>

                      <ArrowRight className="h-5 w-5 text-muted-foreground mx-auto" />

                      {/* Precio en ETH */}
                      <div>
                        <Label htmlFor="eth-amount">Precio en Ethereum (ETH)</Label>
                        <Input
                          id="eth-amount"
                          type="text"
                          value={ethAmount}
                          onChange={(e) => handleETHChange(e.target.value)}
                          data-testid="input-eth-amount"
                        />
                      </div>

                      <Button
                        className="w-full"
                        size="lg"
                        onClick={handlePurchase}
                        disabled={purchaseMutation.isPending || taAmount < BLOCKCHAIN_CONFIG.tokenPrice.minPurchase || !user?.walletAddress}
                        data-testid="button-purchase"
                      >
                        {purchaseMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Procesando...
                          </>
                        ) : (
                          <>
                            <Coins className="mr-2 h-4 w-4" />
                            Comprar {taAmount} TA por {ethAmount} ETH
                          </>
                        )}
                      </Button>

                      {txHash && (
                        <div className="p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                          <p className="text-sm text-green-800 dark:text-green-200 mb-1">
                            Transacción enviada
                          </p>
                          <a
                            href={`${BLOCKCHAIN_CONFIG.network.blockExplorer}/tx/${txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                          >
                            Ver en Etherscan
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </>
              )}
            </div>

            {/* Información lateral */}
            <div className="space-y-6">
              {/* Balance actual */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Tu Balance Actual</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Tokens de Apoyo</p>
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {tokensBalance?.tokensApoyo || 0} TA
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Información */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">¿Cómo funciona?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex gap-2">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                      1
                    </div>
                    <p>Conecta tu billetera MetaMask</p>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                      2
                    </div>
                    <p>Firma un mensaje para vincular tu wallet (seguridad)</p>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                      3
                    </div>
                    <p>Elige la cantidad de TA tokens a comprar</p>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                      4
                    </div>
                    <p>Confirma la transacción en MetaMask</p>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                      5
                    </div>
                    <p>Tus tokens se acreditarán automáticamente</p>
                  </div>
                </CardContent>
              </Card>

              {/* Red de prueba */}
              <Card className="border-blue-200 dark:border-blue-800">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-blue-800 dark:text-blue-200">
                        <strong>Red de prueba:</strong> Estamos usando Sepolia testnet. Los ETH son de prueba y no tienen valor real.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
