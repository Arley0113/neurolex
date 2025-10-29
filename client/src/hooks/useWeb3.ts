// Hook para manejar la conexión con MetaMask y Web3
import { useState, useEffect } from "react";
import { BrowserProvider } from "ethers";

interface Web3State {
  account: string | null;
  provider: BrowserProvider | null;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
}

export function useWeb3() {
  const [state, setState] = useState<Web3State>({
    account: null,
    provider: null,
    isConnected: false,
    isLoading: false,
    error: null,
  });

  // Verificar si MetaMask está instalado
  const isMetaMaskInstalled = () => {
    return typeof window !== "undefined" && typeof window.ethereum !== "undefined";
  };

  // Conectar con MetaMask
  const connect = async () => {
    if (!isMetaMaskInstalled()) {
      setState((prev) => ({
        ...prev,
        error: "MetaMask no está instalado. Por favor instala la extensión de MetaMask.",
      }));
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      // Verificar que window.ethereum existe antes de usarlo
      if (!window.ethereum) {
        throw new Error("MetaMask no está disponible");
      }
      
      const provider = new BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      
      if (accounts.length > 0) {
        setState({
          account: accounts[0],
          provider,
          isConnected: true,
          isLoading: false,
          error: null,
        });
        
        // Guardar en localStorage
        localStorage.setItem("web3Connected", "true");
      }
    } catch (error: any) {
      console.error("Error al conectar con MetaMask:", error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error.message || "Error al conectar con MetaMask",
      }));
    }
  };

  // Desconectar
  const disconnect = () => {
    setState({
      account: null,
      provider: null,
      isConnected: false,
      isLoading: false,
      error: null,
    });
    localStorage.removeItem("web3Connected");
  };

  // Intentar reconectar automáticamente si estaba conectado
  useEffect(() => {
    const wasConnected = localStorage.getItem("web3Connected");
    if (wasConnected === "true" && isMetaMaskInstalled()) {
      connect();
    }
  }, []);

  // Escuchar cambios de cuenta en MetaMask
  useEffect(() => {
    if (!isMetaMaskInstalled() || !window.ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length > 0) {
        setState((prev) => ({ ...prev, account: accounts[0] }));
      } else {
        disconnect();
      }
    };

    // Verificar que los métodos existen antes de usarlos
    if (window.ethereum.on) {
      window.ethereum.on("accountsChanged", handleAccountsChanged);
    }

    return () => {
      if (window.ethereum?.removeListener) {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      }
    };
  }, []);

  return {
    ...state,
    connect,
    disconnect,
    isMetaMaskInstalled: isMetaMaskInstalled(),
  };
}
