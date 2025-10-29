// Configuración de blockchain para donaciones crypto en Neurolex
// Usamos Sepolia testnet para desarrollo y pruebas

export const BLOCKCHAIN_CONFIG = {
  // Red de Ethereum (Sepolia testnet para desarrollo)
  network: {
    chainId: 11155111, // Sepolia testnet
    chainName: "Sepolia",
    rpcUrl: "https://sepolia.infura.io/v3/",
    blockExplorer: "https://sepolia.etherscan.io",
  },

  // Wallet de la plataforma (dirección que recibe las compras de tokens)
  platformWallet: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",

  // Precio de conversión: 1 TA = 0.001 ETH (ajustable)
  tokenPrice: {
    ethPerTA: "0.001", // 1 TA cuesta 0.001 ETH
    minPurchase: 10, // Mínimo 10 TA por compra
    maxPurchase: 10000, // Máximo 10,000 TA por compra
  },

  // Gas limit para transacciones
  gasLimit: 21000,
};

// Función helper para calcular precio en ETH
export function calculateETHPrice(taAmount: number): string {
  const ethAmount = taAmount * parseFloat(BLOCKCHAIN_CONFIG.tokenPrice.ethPerTA);
  return ethAmount.toFixed(6);
}

// Función helper para calcular cantidad de TA
export function calculateTAAmount(ethAmount: string): number {
  const eth = parseFloat(ethAmount);
  const ta = eth / parseFloat(BLOCKCHAIN_CONFIG.tokenPrice.ethPerTA);
  return Math.floor(ta);
}
