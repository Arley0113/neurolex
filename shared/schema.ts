// Schema para la plataforma Neurolex de Gobernanza y Participación Cívica
// Todos los modelos de datos están en español para consistencia

import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Enumeraciones para tipos de datos

export const nivelUsuarioEnum = pgEnum("nivel_usuario", ["basico", "verificado"]);
export const tipoTokenEnum = pgEnum("tipo_token", ["TP", "TA", "TGR"]);
export const estadoPropuestaEnum = pgEnum("estado_propuesta", ["borrador", "en_deliberacion", "votacion", "aprobada", "rechazada", "archivada"]);
export const tipoNoticiaEnum = pgEnum("tipo_noticia", ["nacional", "internacional", "economia", "social", "tecnologia", "otro"]);
export const tipoTransaccionEnum = pgEnum("tipo_transaccion", [
  "ganado_participacion", 
  "ganado_recompensa", 
  "comprado", 
  "gastado_apoyo", 
  "gastado_gobernanza",
  "transferido"
]);

// Tabla de Usuarios
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  nombre: text("nombre"),
  apellido: text("apellido"),
  
  // Nivel de usuario (básico o verificado)
  nivel: nivelUsuarioEnum("nivel").notNull().default("basico"),
  
  // Afinidad política para personalización del feed
  afinidadPolitica: text("afinidad_politica"), // nombre del partido o "Ninguno/Otros"
  
  // Gamificación
  karmaTotal: integer("karma_total").notNull().default(0),
  nivelGamificacion: integer("nivel_gamificacion").notNull().default(1),
  
  // Metadata
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Balance de Tokens de usuario
export const tokensBalance = pgTable("tokens_balance", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  // Tokens de Participación (TP)
  tokensParticipacion: integer("tokens_participacion").notNull().default(0),
  
  // Tokens de Apoyo (TA) - se compran con dinero
  tokensApoyo: integer("tokens_apoyo").notNull().default(0),
  
  // Tokens de Gobernanza y Recompensa (TGR)
  tokensGobernanza: integer("tokens_gobernanza").notNull().default(0),
  
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Historial de transacciones de Tokens
export const tokenTransactions = pgTable("token_transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  tipoToken: tipoTokenEnum("tipo_token").notNull(), // TP, TA, o TGR
  cantidad: integer("cantidad").notNull(), // puede ser positivo (ganado/comprado) o negativo (gastado)
  tipoTransaccion: tipoTransaccionEnum("tipo_transaccion").notNull(),
  descripcion: text("descripcion").notNull(), // ej: "Votaste en una propuesta", "Compraste 100 TA"
  relacionadoId: varchar("relacionado_id"), // ID de propuesta, sondeo, etc. que generó la transacción
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Historial de transacciones de Karma
export const karmaHistory = pgTable("karma_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  cantidad: integer("cantidad").notNull(), // puede ser positivo o negativo
  razon: text("razon").notNull(), // ej: "Comentario votado positivamente", "Propuesta aceptada"
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Noticias políticas
export const news = pgTable("news", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  titulo: text("titulo").notNull(),
  contenido: text("contenido").notNull(),
  resumen: text("resumen"), // breve descripción para las tarjetas
  imagenUrl: text("imagen_url"),
  
  // Clasificación
  tipo: tipoNoticiaEnum("tipo").notNull().default("nacional"),
  partidoRelacionado: text("partido_relacionado"), // para personalización
  etiquetas: text("etiquetas").array(), // ["economía", "salud", etc]
  
  // Fuente
  fuente: text("fuente"), // nombre del medio
  urlOriginal: text("url_original"),
  
  // Metadata
  publicadoPor: varchar("publicado_por").references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Propuestas ciudadanas
export const proposals = pgTable("proposals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  titulo: text("titulo").notNull(),
  descripcion: text("descripcion").notNull(),
  contenidoCompleto: text("contenido_completo").notNull(), // texto completo de la propuesta
  
  // Estado y clasificación
  estado: estadoPropuestaEnum("estado").notNull().default("borrador"),
  categoria: text("categoria").notNull(), // ej: "Educación", "Salud", "Economía"
  partidoRelacionado: text("partido_relacionado"),
  
  // Apoyo mediante tokens
  apoyosTP: integer("apoyos_tp").notNull().default(0),
  apoyosTA: integer("apoyos_ta").notNull().default(0),
  
  // Autor
  autorId: varchar("autor_id").notNull().references(() => users.id),
  
  // Metadata
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Sondeos/Encuestas
export const polls = pgTable("polls", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  pregunta: text("pregunta").notNull(),
  descripcion: text("descripcion"),
  
  // Configuración
  permitirMultiplesRespuestas: boolean("permitir_multiples_respuestas").notNull().default(false),
  requiereNivelVerificado: boolean("requiere_nivel_verificado").notNull().default(false),
  
  // Fechas
  fechaInicio: timestamp("fecha_inicio").notNull().defaultNow(),
  fechaFin: timestamp("fecha_fin"),
  
  // Metadata
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Opciones de sondeos
export const pollOptions = pgTable("poll_options", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  pollId: varchar("poll_id").notNull().references(() => polls.id, { onDelete: "cascade" }),
  texto: text("texto").notNull(),
  votos: integer("votos").notNull().default(0),
  orden: integer("orden").notNull().default(0),
});

// Votos en sondeos
export const votes = pgTable("votes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  pollId: varchar("poll_id").notNull().references(() => polls.id, { onDelete: "cascade" }),
  optionId: varchar("option_id").notNull().references(() => pollOptions.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Comentarios en propuestas y noticias
export const comments = pgTable("comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  contenido: text("contenido").notNull(),
  
  // Puede ser comentario en propuesta o noticia
  propuestaId: varchar("propuesta_id").references(() => proposals.id, { onDelete: "cascade" }),
  noticiaId: varchar("noticia_id").references(() => news.id, { onDelete: "cascade" }),
  
  // Comentarios anidados
  parentId: varchar("parent_id").references((): any => comments.id, { onDelete: "cascade" }),
  
  // Autor
  autorId: varchar("autor_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  // Votación del comentario
  votosPositivos: integer("votos_positivos").notNull().default(0),
  votosNegativos: integer("votos_negativos").notNull().default(0),
  
  // Metadata
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Formulario de contacto
export const contacts = pgTable("contacts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  nombre: text("nombre").notNull(),
  email: text("email").notNull(),
  asunto: text("asunto").notNull(),
  mensaje: text("mensaje").notNull(),
  respondido: boolean("respondido").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Insignias/Badges de gamificación
export const badges = pgTable("badges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  nombre: text("nombre").notNull().unique(),
  descripcion: text("descripcion").notNull(),
  iconoUrl: text("icono_url"),
  nivelRequerido: integer("nivel_requerido").notNull().default(1),
});

// Insignias de usuarios
export const userBadges = pgTable("user_badges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  badgeId: varchar("badge_id").notNull().references(() => badges.id, { onDelete: "cascade" }),
  obtenidoEn: timestamp("obtenido_en").notNull().defaultNow(),
});

// Relaciones

export const usersRelations = relations(users, ({ one, many }) => ({
  tokensBalance: one(tokensBalance, {
    fields: [users.id],
    references: [tokensBalance.userId],
  }),
  proposals: many(proposals),
  comments: many(comments),
  karmaHistory: many(karmaHistory),
  userBadges: many(userBadges),
  votes: many(votes),
}));

export const tokensBalanceRelations = relations(tokensBalance, ({ one }) => ({
  user: one(users, {
    fields: [tokensBalance.userId],
    references: [users.id],
  }),
}));

export const proposalsRelations = relations(proposals, ({ one, many }) => ({
  autor: one(users, {
    fields: [proposals.autorId],
    references: [users.id],
  }),
  comments: many(comments),
}));

export const newsRelations = relations(news, ({ one, many }) => ({
  publicadoPor: one(users, {
    fields: [news.publicadoPor],
    references: [users.id],
  }),
  comments: many(comments),
}));

export const pollsRelations = relations(polls, ({ many }) => ({
  options: many(pollOptions),
  votes: many(votes),
}));

export const pollOptionsRelations = relations(pollOptions, ({ one, many }) => ({
  poll: one(polls, {
    fields: [pollOptions.pollId],
    references: [polls.id],
  }),
  votes: many(votes),
}));

export const commentsRelations = relations(comments, ({ one, many }) => ({
  autor: one(users, {
    fields: [comments.autorId],
    references: [users.id],
  }),
  propuesta: one(proposals, {
    fields: [comments.propuestaId],
    references: [proposals.id],
  }),
  noticia: one(news, {
    fields: [comments.noticiaId],
    references: [news.id],
  }),
  parent: one(comments, {
    fields: [comments.parentId],
    references: [comments.id],
  }),
  replies: many(comments),
}));

export const userBadgesRelations = relations(userBadges, ({ one }) => ({
  user: one(users, {
    fields: [userBadges.userId],
    references: [users.id],
  }),
  badge: one(badges, {
    fields: [userBadges.badgeId],
    references: [badges.id],
  }),
}));

// Schemas de validación con Zod

// Usuarios
export const insertUserSchema = createInsertSchema(users, {
  email: z.string().email("El correo electrónico no es válido"),
  username: z.string().min(3, "El nombre de usuario debe tener al menos 3 caracteres"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
}).omit({
  id: true,
  karmaTotal: true,
  nivelGamificacion: true,
  createdAt: true,
  updatedAt: true,
});

export const selectUserSchema = createSelectSchema(users);

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Noticias
export const insertNewsSchema = createInsertSchema(news).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertNews = z.infer<typeof insertNewsSchema>;
export type News = typeof news.$inferSelect;

// Propuestas
export const insertProposalSchema = createInsertSchema(proposals, {
  titulo: z.string().min(10, "El título debe tener al menos 10 caracteres"),
  descripcion: z.string().min(20, "La descripción debe tener al menos 20 caracteres"),
  contenidoCompleto: z.string().min(50, "El contenido debe tener al menos 50 caracteres"),
}).omit({
  id: true,
  apoyosTP: true,
  apoyosTA: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertProposal = z.infer<typeof insertProposalSchema>;
export type Proposal = typeof proposals.$inferSelect;

// Sondeos
export const insertPollSchema = createInsertSchema(polls).omit({
  id: true,
  createdAt: true,
});

export type InsertPoll = z.infer<typeof insertPollSchema>;
export type Poll = typeof polls.$inferSelect;

// Opciones de sondeo
export const insertPollOptionSchema = createInsertSchema(pollOptions).omit({
  id: true,
  votos: true,
});

export type InsertPollOption = z.infer<typeof insertPollOptionSchema>;
export type PollOption = typeof pollOptions.$inferSelect;

// Comentarios
export const insertCommentSchema = createInsertSchema(comments, {
  contenido: z.string().min(1, "El comentario no puede estar vacío"),
}).omit({
  id: true,
  votosPositivos: true,
  votosNegativos: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertComment = z.infer<typeof insertCommentSchema>;
export type Comment = typeof comments.$inferSelect;

// Contacto
export const insertContactSchema = createInsertSchema(contacts, {
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("El correo electrónico no es válido"),
  asunto: z.string().min(5, "El asunto debe tener al menos 5 caracteres"),
  mensaje: z.string().min(10, "El mensaje debe tener al menos 10 caracteres"),
}).omit({
  id: true,
  respondido: true,
  createdAt: true,
});

export type InsertContact = z.infer<typeof insertContactSchema>;
export type Contact = typeof contacts.$inferSelect;

// Transacciones de tokens
export const insertTokenTransactionSchema = createInsertSchema(tokenTransactions, {
  cantidad: z.number().int("La cantidad debe ser un número entero"),
  descripcion: z.string().min(1, "La descripción no puede estar vacía"),
}).omit({
  id: true,
  createdAt: true,
});

export type InsertTokenTransaction = z.infer<typeof insertTokenTransactionSchema>;
export type TokenTransaction = typeof tokenTransactions.$inferSelect;

// Tipos de balance de tokens
export type TokensBalance = typeof tokensBalance.$inferSelect;
export type KarmaHistory = typeof karmaHistory.$inferSelect;
export type Vote = typeof votes.$inferSelect;
export type Badge = typeof badges.$inferSelect;
export type UserBadge = typeof userBadges.$inferSelect;
