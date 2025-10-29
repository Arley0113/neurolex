// Rutas API para la plataforma Neurolex
// Todas las respuestas y mensajes de error están en español
import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertNewsSchema, insertProposalSchema, insertPollSchema, insertPollOptionSchema, insertDebateSchema, insertCommentSchema, insertContactSchema } from "@shared/schema";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import bcrypt from "bcrypt";

// Helper para validar datos con Zod
function validateRequest<T>(schema: z.ZodSchema<T>, data: any): { success: boolean; data?: T; error?: string } {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const validationError = fromZodError(error, { prefix: null });
      return { success: false, error: validationError.message };
    }
    return { success: false, error: "Error de validación" };
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  
  // ===========================================================================
  // AUTENTICACIÓN
  // ===========================================================================

  // Registro de usuarios
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const validation = validateRequest(insertUserSchema, req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error });
      }

      const { username, email, password, ...rest } = validation.data!;

      // Verificar si el usuario ya existe
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: "El correo electrónico ya está registrado" });
      }

      const existingUsername = await storage.getUserByUsername(username);
      if (existingUsername) {
        return res.status(400).json({ error: "El nombre de usuario ya existe" });
      }

      // Encriptar contraseña
      const hashedPassword = await bcrypt.hash(password, 10);

      // Crear usuario
      const user = await storage.createUser({
        username,
        email,
        password: hashedPassword,
        ...rest,
      });

      // Dar tokens de bienvenida
      await storage.updateTokensBalance(user.id, {
        tokensParticipacion: 100, // Tokens de bienvenida
      });

      // Dar karma inicial
      await storage.addKarma(user.id, 50, "Bienvenida a Neurolex");

      // No devolver la contraseña
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error en registro:", error);
      res.status(500).json({ error: "Error al registrar usuario" });
    }
  });

  // Inicio de sesión
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: "Correo y contraseña son requeridos" });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: "Credenciales inválidas" });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: "Credenciales inválidas" });
      }

      // No devolver la contraseña
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error en login:", error);
      res.status(500).json({ error: "Error al iniciar sesión" });
    }
  });

  // ===========================================================================
  // USUARIOS
  // ===========================================================================

  // Obtener información del usuario actual
  app.get("/api/users/me/:userId", async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      if (!userId) {
        return res.status(400).json({ error: "Usuario no autenticado" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }

      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error al obtener usuario:", error);
      res.status(500).json({ error: "Error al obtener información del usuario" });
    }
  });

  // ===========================================================================
  // TOKENS
  // ===========================================================================

  // ⚠️ SECURITY WARNING: Este endpoint tiene una limitación de seguridad conocida
  // ⚠️ PROBLEMA: Actualmente NO hay autenticación real (JWT/sesiones)
  // ⚠️ MITIGACIÓN PARCIAL: Validamos que el mensaje firmado incluya el userId correcto
  // ⚠️ SOLUCIÓN REAL: Implementar JWT/sesiones y derivar userId del contexto autenticado
  // ⚠️ RIESGO RESIDUAL: Si un atacante obtiene acceso a localStorage de otro usuario,
  //    podría vincular su wallet a esa cuenta. La firma previene vincular wallets
  //    ajenas, pero no previene el secuestro si el atacante tiene acceso al localStorage.
  // Vincular wallet de MetaMask al usuario (CON VERIFICACIÓN DE FIRMA)
  app.post("/api/users/:userId/link-wallet", async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const { walletAddress, message, signature } = req.body;

      if (!walletAddress || !message || !signature) {
        return res.status(400).json({ error: "Wallet, mensaje y firma requeridos" });
      }

      // Validar formato de dirección Ethereum
      if (!walletAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
        return res.status(400).json({ error: "Formato de dirección Ethereum inválido" });
      }

      // Verificar que el usuario existe
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }

      // CRÍTICO: Verificar firma criptográfica para demostrar propiedad de la wallet
      const { verifyMessage } = await import("ethers");
      try {
        const recoveredAddress = verifyMessage(message, signature);
        
        // Validar que la firma corresponda a la wallet
        if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
          return res.status(403).json({ 
            error: "Firma inválida. No puedes demostrar propiedad de esta wallet." 
          });
        }

        // CRÍTICO: Validar que el mensaje incluya el userId correcto
        // Esto previene que un atacante firme con su wallet y la vincule a otro userId
        if (!message.includes(`Usuario: ${userId}`)) {
          return res.status(403).json({ 
            error: "El mensaje firmado no corresponde a este usuario" 
          });
        }

        console.log(`✅ Firma verificada para wallet ${walletAddress} y usuario ${userId}`);
      } catch (error) {
        console.error("Error al verificar firma:", error);
        return res.status(403).json({ error: "Firma inválida o corrupta" });
      }

      // Verificar que la wallet no esté ya vinculada a otro usuario
      const existingUserWithWallet = await db.select().from(users).where(eq(users.walletAddress, walletAddress));
      if (existingUserWithWallet.length > 0 && existingUserWithWallet[0].id !== userId) {
        return res.status(400).json({ error: "Esta wallet ya está vinculada a otro usuario" });
      }

      // Vincular wallet al usuario (solo después de verificar firma)
      const updatedUser = await storage.updateUser(userId, {
        walletAddress: walletAddress.toLowerCase(), // Normalizar a minúsculas
      });

      console.log(`Wallet ${walletAddress} vinculada exitosamente al usuario ${userId}`);

      res.json({
        success: true,
        message: "Wallet vinculada exitosamente",
        walletAddress: updatedUser?.walletAddress,
      });
    } catch (error: any) {
      console.error("Error al vincular wallet:", error);
      res.status(500).json({ error: error.message || "Error al vincular wallet" });
    }
  });

  // ===========================================================================
  // TOKENS
  // ===========================================================================

  // Obtener balance de tokens de un usuario
  app.get("/api/tokens/:userId", async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const balance = await storage.getTokensBalance(userId);
      
      if (!balance) {
        // Crear balance si no existe
        const newBalance = await storage.createTokensBalance(userId);
        return res.json(newBalance);
      }

      res.json(balance);
    } catch (error) {
      console.error("Error al obtener tokens:", error);
      res.status(500).json({ error: "Error al obtener balance de tokens" });
    }
  });

  // Obtener historial de transacciones de un usuario
  app.get("/api/transactions/:userId", async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const transactions = await storage.getTokenTransactions(userId);
      res.json(transactions);
    } catch (error) {
      console.error("Error al obtener transacciones:", error);
      res.status(500).json({ error: "Error al obtener historial de transacciones" });
    }
  });

  // ⚠️ SECURITY WARNING: Este endpoint tiene una limitación de seguridad conocida
  // ⚠️ PROBLEMA: Actualmente NO hay autenticación real (JWT/sesiones)
  // ⚠️ MITIGACIÓN: Múltiples capas de validación blockchain previenen la mayoría de ataques
  // ⚠️ SOLUCIÓN REAL: Implementar JWT/sesiones y derivar userId del contexto autenticado
  // Procesar compra de tokens con criptomonedas (CON VERIFICACIÓN BLOCKCHAIN)
  app.post("/api/tokens/purchase", async (req: Request, res: Response) => {
    try {
      const { userId, taAmount, ethAmount, txHash } = req.body;

      // 1. Validar datos básicos
      if (!userId || !taAmount || !ethAmount || !txHash) {
        return res.status(400).json({ error: "Datos incompletos para la compra" });
      }

      // 2. Validar parámetros de compra (rangos, congruencia TA↔ETH)
      const { verifyTransaction, validatePurchaseParams } = await import("./blockchain-verifier");
      const { BLOCKCHAIN_CONFIG } = await import("../shared/blockchain-config");
      
      const paramValidation = validatePurchaseParams(taAmount, ethAmount);
      if (!paramValidation.valid) {
        return res.status(400).json({ error: paramValidation.error });
      }

      // 3. Validar que el usuario existe
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }

      // 3.5 CRÍTICO: Validar que el usuario tenga una wallet vinculada
      if (!user.walletAddress) {
        return res.status(400).json({ 
          error: "Debes vincular tu wallet de MetaMask antes de comprar tokens. Conecta tu wallet primero." 
        });
      }

      // 4. VERIFICAR TRANSACCIÓN EN LA BLOCKCHAIN (CRÍTICO)
      console.log(`Verificando transacción blockchain: ${txHash} desde ${user.walletAddress}`);
      const verification = await verifyTransaction(
        txHash,
        ethAmount,
        BLOCKCHAIN_CONFIG.platformWallet,
        user.walletAddress // CRÍTICO: Validar que tx.from coincida con la wallet del usuario
      );

      if (!verification.valid) {
        console.error(`Verificación blockchain falló: ${verification.error}`);
        return res.status(400).json({ 
          error: verification.error || "Transacción blockchain inválida" 
        });
      }

      console.log(`✅ Transacción verificada exitosamente: ${txHash}`);

      // 5. Verificar que el txHash no haya sido usado antes (doble verificación con BD)
      const existingTx = await storage.getTransactionByHash(txHash);
      if (existingTx) {
        return res.status(400).json({ 
          error: "Esta transacción ya fue procesada anteriormente" 
        });
      }

      // 6. Obtener o crear balance de tokens
      let balance = await storage.getTokensBalance(userId);
      if (!balance) {
        balance = await storage.createTokensBalance(userId);
      }

      // 7. Actualizar balance (agregar TA tokens)
      const newBalance = await storage.updateTokensBalance(userId, {
        tokensApoyo: balance.tokensApoyo + taAmount,
      });

      // 8. Registrar transacción con txHash para prevenir duplicados
      await storage.createTokenTransaction({
        userId,
        tokenType: "tokensApoyo",
        amount: taAmount,
        transactionType: "comprado",
        descripcion: `Compra de ${taAmount} TA por ${ethAmount} ETH`,
        relacionadoId: txHash, // Guardamos el hash completo
      });

      res.json({
        success: true,
        balance: newBalance,
        message: `Compra exitosa: ${taAmount} TA tokens agregados`,
        txHash,
      });
    } catch (error: any) {
      console.error("Error al procesar compra de tokens:", error);
      res.status(500).json({ 
        error: error.message || "Error al procesar la compra" 
      });
    }
  });

  // ===========================================================================
  // KARMA
  // ===========================================================================

  // Obtener historial de karma de un usuario
  app.get("/api/karma/:userId", async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const history = await storage.getKarmaHistory(userId);
      res.json(history);
    } catch (error) {
      console.error("Error al obtener karma:", error);
      res.status(500).json({ error: "Error al obtener historial de karma" });
    }
  });

  // ===========================================================================
  // NOTICIAS
  // ===========================================================================

  // Obtener todas las noticias
  app.get("/api/news", async (req: Request, res: Response) => {
    try {
      const noticias = await storage.getAllNews();
      res.json(noticias);
    } catch (error) {
      console.error("Error al obtener noticias:", error);
      res.status(500).json({ error: "Error al obtener noticias" });
    }
  });

  // Obtener una noticia por ID
  app.get("/api/news/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const noticia = await storage.getNewsById(id);
      
      if (!noticia) {
        return res.status(404).json({ error: "Noticia no encontrada" });
      }

      res.json(noticia);
    } catch (error) {
      console.error("Error al obtener noticia:", error);
      res.status(500).json({ error: "Error al obtener noticia" });
    }
  });

  // Crear nueva noticia
  app.post("/api/news", async (req: Request, res: Response) => {
    try {
      const validation = validateRequest(insertNewsSchema, req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error });
      }

      const noticia = await storage.createNews(validation.data!);
      res.status(201).json(noticia);
    } catch (error) {
      console.error("Error al crear noticia:", error);
      res.status(500).json({ error: "Error al crear noticia" });
    }
  });

  // ===========================================================================
  // PROPUESTAS
  // ===========================================================================

  // Obtener todas las propuestas
  app.get("/api/proposals", async (req: Request, res: Response) => {
    try {
      const propuestas = await storage.getAllProposals();
      res.json(propuestas);
    } catch (error) {
      console.error("Error al obtener propuestas:", error);
      res.status(500).json({ error: "Error al obtener propuestas" });
    }
  });

  // Obtener una propuesta por ID
  app.get("/api/proposals/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const propuesta = await storage.getProposalById(id);
      
      if (!propuesta) {
        return res.status(404).json({ error: "Propuesta no encontrada" });
      }

      res.json(propuesta);
    } catch (error) {
      console.error("Error al obtener propuesta:", error);
      res.status(500).json({ error: "Error al obtener propuesta" });
    }
  });

  // Crear nueva propuesta
  app.post("/api/proposals", async (req: Request, res: Response) => {
    try {
      const validation = validateRequest(insertProposalSchema, req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error });
      }

      const propuesta = await storage.createProposal(validation.data!);
      
      // Dar karma al usuario por crear propuesta
      await storage.addKarma(propuesta.autorId, 20, "Propuesta creada");

      res.status(201).json(propuesta);
    } catch (error) {
      console.error("Error al crear propuesta:", error);
      res.status(500).json({ error: "Error al crear propuesta" });
    }
  });

  // Apoyar una propuesta con tokens
  app.post("/api/proposals/:id/support", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { userId, tipoToken, cantidad } = req.body;

      if (!userId || !tipoToken || !cantidad) {
        return res.status(400).json({ error: "Faltan parámetros requeridos" });
      }

      const propuesta = await storage.getProposalById(id);
      if (!propuesta) {
        return res.status(404).json({ error: "Propuesta no encontrada" });
      }

      const balance = await storage.getTokensBalance(userId);
      if (!balance) {
        return res.status(404).json({ error: "Balance de tokens no encontrado" });
      }

      // Verificar que el usuario tenga suficientes tokens
      if (tipoToken === "TP" && balance.tokensParticipacion < cantidad) {
        return res.status(400).json({ error: "No tienes suficientes Tokens de Participación" });
      }
      if (tipoToken === "TA" && balance.tokensApoyo < cantidad) {
        return res.status(400).json({ error: "No tienes suficientes Tokens de Apoyo" });
      }

      // Descontar tokens del usuario
      if (tipoToken === "TP") {
        await storage.updateTokensBalance(userId, {
          tokensParticipacion: balance.tokensParticipacion - cantidad,
        });
        await storage.updateProposal(id, {
          apoyosTP: propuesta.apoyosTP + cantidad,
        });
      } else if (tipoToken === "TA") {
        await storage.updateTokensBalance(userId, {
          tokensApoyo: balance.tokensApoyo - cantidad,
        });
        await storage.updateProposal(id, {
          apoyosTA: propuesta.apoyosTA + cantidad,
        });
      }

      // Dar karma al usuario por apoyar
      await storage.addKarma(userId, 5, "Propuesta apoyada");

      res.json({ success: true });
    } catch (error) {
      console.error("Error al apoyar propuesta:", error);
      res.status(500).json({ error: "Error al apoyar propuesta" });
    }
  });

  // Donar tokens de apoyo (TA) a una propuesta
  app.post("/api/proposals/donate", async (req: Request, res: Response) => {
    try {
      const { userId, proposalId, amount } = req.body;

      if (!userId || !proposalId || !amount) {
        return res.status(400).json({ error: "Datos incompletos para la donación" });
      }

      if (amount <= 0) {
        return res.status(400).json({ error: "La cantidad debe ser mayor a 0" });
      }

      // Validar que la propuesta existe
      const propuesta = await storage.getProposalById(proposalId);
      if (!propuesta) {
        return res.status(404).json({ error: "Propuesta no encontrada" });
      }

      // Obtener balance del usuario
      const balance = await storage.getTokensBalance(userId);
      if (!balance) {
        return res.status(404).json({ error: "Balance de tokens no encontrado" });
      }

      // Verificar que el usuario tenga suficientes TA tokens
      if (balance.tokensApoyo < amount) {
        return res.status(400).json({ error: "No tienes suficientes Tokens de Apoyo" });
      }

      // Descontar TA tokens del usuario
      await storage.updateTokensBalance(userId, {
        tokensApoyo: balance.tokensApoyo - amount,
      });

      // Incrementar apoyos TA de la propuesta
      await storage.updateProposal(proposalId, {
        apoyosTA: propuesta.apoyosTA + amount,
      });

      // Registrar transacción
      await storage.createTokenTransaction({
        userId,
        tokenType: "tokensApoyo",
        amount: -amount, // Negativo porque se gasta
        transactionType: "gastado_apoyo",
        descripcion: `Donación de ${amount} TA a propuesta: ${propuesta.titulo}`,
        relacionadoId: proposalId,
      });

      // Dar karma al usuario por donar
      await storage.addKarma(userId, 10, "Donación a propuesta");

      res.json({
        success: true,
        message: `Has donado ${amount} TA a la propuesta`,
      });
    } catch (error) {
      console.error("Error al procesar donación:", error);
      res.status(500).json({ error: "Error al procesar la donación" });
    }
  });

  // ===========================================================================
  // SONDEOS
  // ===========================================================================

  // Obtener todos los sondeos
  app.get("/api/polls", async (req: Request, res: Response) => {
    try {
      const polls = await storage.getAllPolls();
      
      // Obtener opciones para cada sondeo
      const pollsWithOptions = await Promise.all(
        polls.map(async (poll) => {
          const options = await storage.getPollOptions(poll.id);
          return { ...poll, options };
        })
      );

      res.json(pollsWithOptions);
    } catch (error) {
      console.error("Error al obtener sondeos:", error);
      res.status(500).json({ error: "Error al obtener sondeos" });
    }
  });

  // Obtener un sondeo por ID
  app.get("/api/polls/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const poll = await storage.getPollById(id);
      
      if (!poll) {
        return res.status(404).json({ error: "Sondeo no encontrado" });
      }

      const options = await storage.getPollOptions(id);
      res.json({ ...poll, options });
    } catch (error) {
      console.error("Error al obtener sondeo:", error);
      res.status(500).json({ error: "Error al obtener sondeo" });
    }
  });

  // Crear nuevo sondeo
  app.post("/api/polls", async (req: Request, res: Response) => {
    try {
      const { opciones, ...pollData } = req.body;
      
      const validation = validateRequest(insertPollSchema, pollData);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error });
      }

      const poll = await storage.createPoll(validation.data!);
      
      // Crear opciones del sondeo
      if (opciones && Array.isArray(opciones)) {
        for (let i = 0; i < opciones.length; i++) {
          await storage.createPollOption({
            pollId: poll.id,
            texto: opciones[i],
            orden: i,
          });
        }
      }

      const options = await storage.getPollOptions(poll.id);
      res.status(201).json({ ...poll, options });
    } catch (error) {
      console.error("Error al crear sondeo:", error);
      res.status(500).json({ error: "Error al crear sondeo" });
    }
  });

  // Votar en un sondeo
  app.post("/api/polls/:pollId/vote", async (req: Request, res: Response) => {
    try {
      const { pollId } = req.params;
      const { userId, optionId } = req.body;

      if (!userId || !optionId) {
        return res.status(400).json({ error: "Faltan parámetros requeridos" });
      }

      await storage.vote(userId, pollId, optionId);
      
      // Dar tokens y karma por votar
      const balance = await storage.getTokensBalance(userId);
      if (balance) {
        await storage.updateTokensBalance(userId, {
          tokensParticipacion: balance.tokensParticipacion + 10,
        });
      }
      await storage.addKarma(userId, 5, "Voto en sondeo");

      res.json({ success: true });
    } catch (error: any) {
      console.error("Error al votar:", error);
      if (error.message === "Ya has votado en este sondeo") {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: "Error al registrar voto" });
    }
  });

  // ===========================================================================
  // COMENTARIOS
  // ===========================================================================

  // Obtener comentarios de una propuesta
  app.get("/api/comments/proposal/:propuestaId", async (req: Request, res: Response) => {
    try {
      const { propuestaId } = req.params;
      const comentarios = await storage.getCommentsByProposal(propuestaId);
      res.json(comentarios);
    } catch (error) {
      console.error("Error al obtener comentarios:", error);
      res.status(500).json({ error: "Error al obtener comentarios" });
    }
  });

  // Obtener comentarios de una noticia
  app.get("/api/comments/news/:noticiaId", async (req: Request, res: Response) => {
    try {
      const { noticiaId } = req.params;
      const comentarios = await storage.getCommentsByNews(noticiaId);
      res.json(comentarios);
    } catch (error) {
      console.error("Error al obtener comentarios:", error);
      res.status(500).json({ error: "Error al obtener comentarios" });
    }
  });

  // Crear comentario
  app.post("/api/comments", async (req: Request, res: Response) => {
    try {
      const validation = validateRequest(insertCommentSchema, req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error });
      }

      const comentario = await storage.createComment(validation.data!);
      
      // Dar karma por comentar
      await storage.addKarma(comentario.autorId, 2, "Comentario creado");

      res.status(201).json(comentario);
    } catch (error) {
      console.error("Error al crear comentario:", error);
      res.status(500).json({ error: "Error al crear comentario" });
    }
  });

  // ===========================================================================
  // CONTACTO
  // ===========================================================================

  // Enviar formulario de contacto
  app.post("/api/contact", async (req: Request, res: Response) => {
    try {
      const validation = validateRequest(insertContactSchema, req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error });
      }

      const contact = await storage.createContact(validation.data!);
      res.status(201).json({ 
        success: true,
        message: "Mensaje enviado correctamente. Te responderemos pronto.",
        contact
      });
    } catch (error) {
      console.error("Error al enviar contacto:", error);
      res.status(500).json({ error: "Error al enviar mensaje de contacto" });
    }
  });

  // ===========================================================================
  // DEBATES
  // ===========================================================================

  // Obtener todos los debates
  app.get("/api/debates", async (req: Request, res: Response) => {
    try {
      const debates = await storage.getAllDebates();
      res.json(debates);
    } catch (error) {
      console.error("Error al obtener debates:", error);
      res.status(500).json({ error: "Error al obtener debates" });
    }
  });

  // Obtener un debate por ID
  app.get("/api/debates/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const debate = await storage.getDebateById(id);
      
      if (!debate) {
        return res.status(404).json({ error: "Debate no encontrado" });
      }

      // Incrementar vistas
      await storage.incrementDebateViews(id);

      res.json(debate);
    } catch (error) {
      console.error("Error al obtener debate:", error);
      res.status(500).json({ error: "Error al obtener debate" });
    }
  });

  // Obtener comentarios de un debate
  app.get("/api/debates/:id/comments", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const comentarios = await storage.getCommentsByDebate(id);
      
      // Obtener información del autor para cada comentario
      const comentariosConAutor = await Promise.all(
        comentarios.map(async (comentario) => {
          const autor = await storage.getUser(comentario.autorId);
          return {
            ...comentario,
            autorNombre: autor?.username || "Anónimo",
          };
        })
      );

      res.json(comentariosConAutor);
    } catch (error) {
      console.error("Error al obtener comentarios del debate:", error);
      res.status(500).json({ error: "Error al obtener comentarios" });
    }
  });

  // Crear comentario en un debate
  app.post("/api/debates/:id/comments", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const validation = validateRequest(insertCommentSchema.extend({ debateId: z.string() }).partial({ propuestaId: true, noticiaId: true }), {
        ...req.body,
        debateId: id,
      });

      if (!validation.success) {
        return res.status(400).json({ error: validation.error });
      }

      const comentario = await storage.createComment(validation.data!);

      // Incrementar contador de respuestas del debate
      const debate = await storage.getDebateById(id);
      if (debate) {
        await storage.updateDebate(id, {
          numRespuestas: (debate.numRespuestas || 0) + 1,
        });
      }

      // Dar karma por comentar
      await storage.addKarma(validation.data!.autorId, 2, "Comentario en debate");

      res.status(201).json(comentario);
    } catch (error) {
      console.error("Error al crear comentario:", error);
      res.status(500).json({ error: "Error al crear comentario" });
    }
  });

  // ===========================================================================
  // ADMINISTRACIÓN
  // ===========================================================================

  // Middleware para verificar si el usuario es administrador
  const isAdmin = async (req: Request, res: Response, next: Function) => {
    try {
      const userId = req.body.adminId || req.params.adminId || req.query.adminId;
      if (!userId) {
        return res.status(401).json({ error: "No autenticado" });
      }

      const user = await storage.getUser(userId as string);
      if (!user || !user.isAdmin) {
        return res.status(403).json({ error: "No tienes permisos de administrador" });
      }

      next();
    } catch (error) {
      console.error("Error en middleware de admin:", error);
      res.status(500).json({ error: "Error al verificar permisos" });
    }
  };

  // --- NOTICIAS (Admin) ---

  // Crear noticia (Admin)
  app.post("/api/admin/news", isAdmin, async (req: Request, res: Response) => {
    try {
      const { adminId, ...newsData } = req.body;
      const validation = validateRequest(insertNewsSchema, newsData);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error });
      }

      const news = await storage.createNews(validation.data!);
      res.status(201).json(news);
    } catch (error) {
      console.error("Error al crear noticia:", error);
      res.status(500).json({ error: "Error al crear noticia" });
    }
  });

  // Editar noticia (Admin)
  app.put("/api/admin/news/:id", isAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { adminId, ...newsData } = req.body;
      
      const updated = await storage.updateNews(id, newsData);
      if (!updated) {
        return res.status(404).json({ error: "Noticia no encontrada" });
      }

      res.json(updated);
    } catch (error) {
      console.error("Error al actualizar noticia:", error);
      res.status(500).json({ error: "Error al actualizar noticia" });
    }
  });

  // Eliminar noticia (Admin)
  app.delete("/api/admin/news/:id", isAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await storage.deleteNews(id);
      res.json({ success: true, message: "Noticia eliminada correctamente" });
    } catch (error) {
      console.error("Error al eliminar noticia:", error);
      res.status(500).json({ error: "Error al eliminar noticia" });
    }
  });

  // --- PROPUESTAS (Admin) ---

  // Cambiar estado de propuesta (Admin)
  app.put("/api/admin/proposals/:id/status", isAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { estado } = req.body;

      const updated = await storage.updateProposal(id, { estado });
      if (!updated) {
        return res.status(404).json({ error: "Propuesta no encontrada" });
      }

      res.json(updated);
    } catch (error) {
      console.error("Error al actualizar estado de propuesta:", error);
      res.status(500).json({ error: "Error al actualizar estado de propuesta" });
    }
  });

  // Eliminar propuesta (Admin)
  app.delete("/api/admin/proposals/:id", isAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await storage.deleteProposal(id);
      res.json({ success: true, message: "Propuesta eliminada correctamente" });
    } catch (error) {
      console.error("Error al eliminar propuesta:", error);
      res.status(500).json({ error: "Error al eliminar propuesta" });
    }
  });

  // --- SONDEOS (Admin) ---

  // Crear sondeo completo con opciones (Admin)
  app.post("/api/admin/polls", isAdmin, async (req: Request, res: Response) => {
    try {
      const { adminId, opciones, ...pollData } = req.body;
      
      // Crear el sondeo
      const poll = await storage.createPoll(pollData);
      
      // Crear las opciones
      if (opciones && Array.isArray(opciones)) {
        for (const opcion of opciones) {
          await storage.createPollOption({
            pollId: poll.id,
            texto: opcion,
          });
        }
      }

      res.status(201).json(poll);
    } catch (error) {
      console.error("Error al crear sondeo:", error);
      res.status(500).json({ error: "Error al crear sondeo" });
    }
  });

  // --- DEBATES (Admin) ---

  // Obtener todos los debates (Admin)
  app.get("/api/admin/debates", isAdmin, async (req: Request, res: Response) => {
    try {
      const debates = await storage.getAllDebates();
      res.json(debates);
    } catch (error) {
      console.error("Error al obtener debates:", error);
      res.status(500).json({ error: "Error al obtener debates" });
    }
  });

  // Crear debate (Admin)
  app.post("/api/admin/debates", isAdmin, async (req: Request, res: Response) => {
    try {
      const { adminId, ...debateData } = req.body;
      const validation = validateRequest(insertDebateSchema, debateData);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error });
      }

      const debate = await storage.createDebate(validation.data!);
      res.status(201).json(debate);
    } catch (error) {
      console.error("Error al crear debate:", error);
      res.status(500).json({ error: "Error al crear debate" });
    }
  });

  // Editar debate (Admin)
  app.put("/api/admin/debates/:id", isAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { adminId, ...debateData } = req.body;
      const validation = validateRequest(insertDebateSchema.partial(), debateData);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error });
      }

      const debate = await storage.updateDebate(id, validation.data!);
      if (!debate) {
        return res.status(404).json({ error: "Debate no encontrado" });
      }

      res.json(debate);
    } catch (error) {
      console.error("Error al editar debate:", error);
      res.status(500).json({ error: "Error al editar debate" });
    }
  });

  // Eliminar debate (Admin)
  app.delete("/api/admin/debates/:id", isAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await storage.deleteDebate(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error al eliminar debate:", error);
      res.status(500).json({ error: "Error al eliminar debate" });
    }
  });

  // --- USUARIOS (Admin) ---

  // Obtener todos los usuarios (Admin)
  app.get("/api/admin/users", isAdmin, async (req: Request, res: Response) => {
    try {
      const users = await storage.getAllUsers();
      // Remover contraseñas
      const usersWithoutPasswords = users.map(({ password, ...user }) => user);
      res.json(usersWithoutPasswords);
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
      res.status(500).json({ error: "Error al obtener usuarios" });
    }
  });

  // Cambiar nivel o rol de admin de un usuario (Admin)
  app.put("/api/admin/users/:id", isAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { nivel, isAdmin: setAdmin } = req.body;
      
      const updateData: any = {};
      if (nivel) updateData.nivel = nivel;
      if (setAdmin !== undefined) updateData.isAdmin = setAdmin;

      const updated = await storage.updateUser(id, updateData);
      if (!updated) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }

      const { password, ...userWithoutPassword } = updated;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error al actualizar usuario:", error);
      res.status(500).json({ error: "Error al actualizar usuario" });
    }
  });

  // Estadísticas generales (Admin)
  app.get("/api/admin/stats", isAdmin, async (req: Request, res: Response) => {
    try {
      const [users, news, proposals, polls] = await Promise.all([
        storage.getAllUsers(),
        storage.getAllNews(),
        storage.getAllProposals(),
        storage.getAllPolls(),
      ]);

      res.json({
        totalUsers: users.length,
        totalNews: news.length,
        totalProposals: proposals.length,
        totalPolls: polls.length,
        verifiedUsers: users.filter(u => u.nivel === "verificado").length,
        adminUsers: users.filter(u => u.isAdmin).length,
      });
    } catch (error) {
      console.error("Error al obtener estadísticas:", error);
      res.status(500).json({ error: "Error al obtener estadísticas" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
