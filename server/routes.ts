// Rutas API para la plataforma Neurolex
// Todas las respuestas y mensajes de error están en español
import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertNewsSchema, insertProposalSchema, insertPollSchema, insertPollOptionSchema, insertCommentSchema, insertContactSchema } from "@shared/schema";
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
  app.get("/api/users/me", async (req: Request, res: Response) => {
    try {
      const userId = req.query.userId as string;
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

  const httpServer = createServer(app);
  return httpServer;
}
