// Servicio para verificar transacciones blockchain en Sepolia testnet
import { JsonRpcProvider, TransactionResponse } from "ethers";
import { BLOCKCHAIN_CONFIG, calculateETHPrice } from "../shared/blockchain-config";

// Configurar provider de Sepolia (puede fallar si no hay API key, es opcional)
let provider: JsonRpcProvider | null = null;

try {
  // Usar el provider solo si hay API key configurada
  const infuraKey = process.env.INFURA_API_KEY || "";
  if (infuraKey) {
    provider = new JsonRpcProvider(`https://sepolia.infura.io/v3/${infuraKey}`);
  } else {
    console.warn("⚠️  INFURA_API_KEY no configurada. Las funciones blockchain estarán deshabilitadas.");
  }
} catch (error) {
  console.warn("⚠️  No se pudo conectar al provider blockchain:", error);
}

// Caché de transacciones verificadas (evitar duplicados)
const verifiedTxHashes = new Set<string>();

interface VerificationResult {
  valid: boolean;
  error?: string;
  transaction?: TransactionResponse;
}

/**
 * Verifica que una transacción blockchain sea válida
 * @param txHash - Hash de la transacción
 * @param expectedAmount - Cantidad esperada en ETH
 * @param expectedTo - Dirección esperada del receptor
 * @param expectedFrom - Dirección esperada del remitente (wallet del usuario)
 * @returns Resultado de la verificación
 */
export async function verifyTransaction(
  txHash: string,
  expectedAmount: string,
  expectedTo: string,
  expectedFrom: string
): Promise<VerificationResult> {
  try {
    // 0. Verificar que el provider blockchain esté disponible
    if (!provider) {
      return {
        valid: false,
        error: "Servicio blockchain temporalmente no disponible. Contacta al administrador.",
      };
    }

    // 1. Validar formato del hash
    if (!txHash || !txHash.startsWith("0x") || txHash.length !== 66) {
      return {
        valid: false,
        error: "Formato de hash de transacción inválido",
      };
    }

    // 2. Verificar que no haya sido usado antes
    if (verifiedTxHashes.has(txHash)) {
      return {
        valid: false,
        error: "Esta transacción ya fue procesada anteriormente",
      };
    }

    // 3. Obtener transacción de la blockchain
    const tx = await provider.getTransaction(txHash);
    
    if (!tx) {
      return {
        valid: false,
        error: "Transacción no encontrada en la blockchain",
      };
    }

    // 4. Verificar que la transacción esté confirmada
    const receipt = await provider.getTransactionReceipt(txHash);
    if (!receipt) {
      return {
        valid: false,
        error: "Transacción aún no confirmada. Por favor espera unos minutos.",
      };
    }

    // 5. Verificar que la transacción fue exitosa
    if (receipt.status !== 1) {
      return {
        valid: false,
        error: "La transacción falló en la blockchain",
      };
    }

    // 6. Verificar el receptor (wallet de la plataforma)
    if (tx.to?.toLowerCase() !== expectedTo.toLowerCase()) {
      return {
        valid: false,
        error: `Dirección de destino incorrecta. Se esperaba ${expectedTo} pero se recibió ${tx.to}`,
      };
    }

    // 6.5 CRÍTICO: Verificar el remitente (wallet del usuario que hace la compra)
    if (tx.from?.toLowerCase() !== expectedFrom.toLowerCase()) {
      return {
        valid: false,
        error: `La transacción no fue enviada desde tu wallet. Se esperaba ${expectedFrom} pero se recibió ${tx.from}`,
      };
    }

    // 7. Verificar el monto (con tolerancia de ±0.0001 ETH por fees)
    const actualETH = parseFloat((Number(tx.value) / 1e18).toFixed(6));
    const expectedETH = parseFloat(expectedAmount);
    const tolerance = 0.0001;

    if (Math.abs(actualETH - expectedETH) > tolerance) {
      return {
        valid: false,
        error: `Monto incorrecto. Se esperaba ${expectedETH} ETH pero se recibió ${actualETH} ETH`,
      };
    }

    // 8. Marcar como verificado para evitar duplicados
    verifiedTxHashes.add(txHash);

    return {
      valid: true,
      transaction: tx,
    };
  } catch (error: any) {
    console.error("Error al verificar transacción blockchain:", error);
    return {
      valid: false,
      error: `Error al verificar transacción: ${error.message}`,
    };
  }
}

/**
 * Valida los parámetros de compra de tokens
 * @param taAmount - Cantidad de TA tokens a comprar
 * @param ethAmount - Cantidad en ETH
 * @returns true si es válido, string con error si no
 */
export function validatePurchaseParams(
  taAmount: number,
  ethAmount: string
): { valid: boolean; error?: string } {
  // Validar cantidad de TA
  if (taAmount < BLOCKCHAIN_CONFIG.tokenPrice.minPurchase) {
    return {
      valid: false,
      error: `Debes comprar al menos ${BLOCKCHAIN_CONFIG.tokenPrice.minPurchase} TA`,
    };
  }

  if (taAmount > BLOCKCHAIN_CONFIG.tokenPrice.maxPurchase) {
    return {
      valid: false,
      error: `Puedes comprar máximo ${BLOCKCHAIN_CONFIG.tokenPrice.maxPurchase} TA`,
    };
  }

  // Validar que la cantidad sea entera y positiva
  if (!Number.isInteger(taAmount) || taAmount <= 0) {
    return {
      valid: false,
      error: "La cantidad de TA debe ser un número entero positivo",
    };
  }

  // Validar congruencia entre TA y ETH
  const expectedETH = calculateETHPrice(taAmount);
  const providedETH = parseFloat(ethAmount);
  const tolerance = 0.0001;

  if (Math.abs(providedETH - parseFloat(expectedETH)) > tolerance) {
    return {
      valid: false,
      error: `Cantidad ETH incorrecta. Para ${taAmount} TA se requieren ${expectedETH} ETH`,
    };
  }

  return { valid: true };
}
