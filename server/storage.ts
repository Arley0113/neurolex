// Implementación de almacenamiento usando PostgreSQL con Drizzle ORM
// Todos los métodos CRUD están en español para consistencia
import { 
  users, 
  tokensBalance, 
  tokenTransactions,
  karmaHistory, 
  news, 
  proposals, 
  polls, 
  pollOptions, 
  votes, 
  debates,
  comments, 
  contacts,
  badges,
  userBadges,
  type User, 
  type InsertUser,
  type TokensBalance,
  type TokenTransaction,
  type InsertTokenTransaction,
  type News,
  type InsertNews,
  type Proposal,
  type InsertProposal,
  type Poll,
  type InsertPoll,
  type PollOption,
  type InsertPollOption,
  type Vote,
  type Debate,
  type InsertDebate,
  type Comment,
  type InsertComment,
  type Contact,
  type InsertContact,
  type KarmaHistory,
  type Badge,
  type UserBadge,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";

// Interfaz de almacenamiento con todos los métodos CRUD necesarios
export interface IStorage {
  // Usuarios
  getAllUsers(): Promise<User[]>;
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, data: Partial<User>): Promise<User | undefined>;

  // Tokens
  getTokensBalance(userId: string): Promise<TokensBalance | undefined>;
  createTokensBalance(userId: string): Promise<TokensBalance>;
  updateTokensBalance(userId: string, data: Partial<TokensBalance>): Promise<TokensBalance | undefined>;
  
  // Transacciones de tokens
  createTokenTransaction(transactionData: InsertTokenTransaction): Promise<TokenTransaction>;
  getTokenTransactions(userId: string): Promise<TokenTransaction[]>;
  getTransactionByHash(txHash: string): Promise<TokenTransaction | undefined>;

  // Karma
  addKarma(userId: string, cantidad: number, razon: string): Promise<void>;
  getKarmaHistory(userId: string): Promise<KarmaHistory[]>;

  // Noticias
  getAllNews(): Promise<News[]>;
  getNewsById(id: string): Promise<News | undefined>;
  createNews(newsData: InsertNews): Promise<News>;
  updateNews(id: string, data: Partial<News>): Promise<News | undefined>;
  deleteNews(id: string): Promise<void>;

  // Propuestas
  getAllProposals(): Promise<Proposal[]>;
  getProposalById(id: string): Promise<Proposal | undefined>;
  createProposal(proposalData: InsertProposal): Promise<Proposal>;
  updateProposal(id: string, data: Partial<Proposal>): Promise<Proposal | undefined>;
  deleteProposal(id: string): Promise<void>;

  // Sondeos
  getAllPolls(): Promise<Poll[]>;
  getPollById(id: string): Promise<Poll | undefined>;
  createPoll(pollData: InsertPoll): Promise<Poll>;
  updatePoll(id: string, data: Partial<Poll>): Promise<Poll | undefined>;
  deletePoll(id: string): Promise<void>;
  getPollOptions(pollId: string): Promise<PollOption[]>;
  createPollOption(optionData: InsertPollOption): Promise<PollOption>;
  vote(userId: string, pollId: string, optionId: string): Promise<void>;
  hasUserVoted(userId: string, pollId: string): Promise<boolean>;

  // Debates
  getAllDebates(): Promise<Debate[]>;
  getDebateById(id: string): Promise<Debate | undefined>;
  createDebate(debateData: InsertDebate): Promise<Debate>;
  updateDebate(id: string, data: Partial<Debate>): Promise<Debate | undefined>;
  deleteDebate(id: string): Promise<void>;
  incrementDebateViews(id: string): Promise<void>;

  // Comentarios
  getCommentsByProposal(propuestaId: string): Promise<Comment[]>;
  getCommentsByNews(noticiaId: string): Promise<Comment[]>;
  getCommentsByDebate(debateId: string): Promise<Comment[]>;
  createComment(commentData: InsertComment): Promise<Comment>;
  updateComment(id: string, data: Partial<Comment>): Promise<Comment | undefined>;
  deleteComment(id: string): Promise<void>;

  // Contacto
  createContact(contactData: InsertContact): Promise<Contact>;
  getAllContacts(): Promise<Contact[]>;

  // Insignias
  getUserBadges(userId: string): Promise<Badge[]>;
}

// Implementación con PostgreSQL usando Drizzle ORM
export class DatabaseStorage implements IStorage {
  // === USUARIOS ===
  async getAllUsers(): Promise<User[]> {
    const allUsers = await db.select().from(users).orderBy(desc(users.createdAt));
    return allUsers;
  }

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        karmaTotal: 0,
        nivelGamificacion: 1,
      })
      .returning();
    
    // Crear balance de tokens inicial
    await this.createTokensBalance(user.id);
    
    return user;
  }

  async updateUser(id: string, data: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  // === TOKENS ===
  async getTokensBalance(userId: string): Promise<TokensBalance | undefined> {
    const [balance] = await db
      .select()
      .from(tokensBalance)
      .where(eq(tokensBalance.userId, userId));
    return balance || undefined;
  }

  async createTokensBalance(userId: string): Promise<TokensBalance> {
    const [balance] = await db
      .insert(tokensBalance)
      .values({
        userId,
        tokensParticipacion: 0,
        tokensApoyo: 0,
        tokensGobernanza: 0,
      })
      .returning();
    return balance;
  }

  async updateTokensBalance(userId: string, data: Partial<TokensBalance>): Promise<TokensBalance | undefined> {
    const [balance] = await db
      .update(tokensBalance)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(tokensBalance.userId, userId))
      .returning();
    return balance || undefined;
  }

  // === TRANSACCIONES DE TOKENS ===
  async createTokenTransaction(transactionData: InsertTokenTransaction): Promise<TokenTransaction> {
    const [transaction] = await db
      .insert(tokenTransactions)
      .values(transactionData)
      .returning();
    return transaction;
  }

  async getTokenTransactions(userId: string): Promise<TokenTransaction[]> {
    const transactions = await db
      .select()
      .from(tokenTransactions)
      .where(eq(tokenTransactions.userId, userId))
      .orderBy(desc(tokenTransactions.createdAt));
    return transactions;
  }

  async getTransactionByHash(txHash: string): Promise<TokenTransaction | undefined> {
    const [transaction] = await db
      .select()
      .from(tokenTransactions)
      .where(eq(tokenTransactions.relacionadoId, txHash));
    return transaction || undefined;
  }

  // === KARMA ===
  async addKarma(userId: string, cantidad: number, razon: string): Promise<void> {
    // Añadir a historial
    await db.insert(karmaHistory).values({
      userId,
      cantidad,
      razon,
    });

    // Actualizar karma total del usuario
    const user = await this.getUser(userId);
    if (user) {
      const nuevoKarma = user.karmaTotal + cantidad;
      const nuevoNivel = Math.floor(nuevoKarma / 500) + 1;
      await this.updateUser(userId, {
        karmaTotal: nuevoKarma,
        nivelGamificacion: nuevoNivel,
      });
    }
  }

  async getKarmaHistory(userId: string): Promise<KarmaHistory[]> {
    return await db
      .select()
      .from(karmaHistory)
      .where(eq(karmaHistory.userId, userId))
      .orderBy(desc(karmaHistory.createdAt));
  }

  // === NOTICIAS ===
  async getAllNews(): Promise<News[]> {
    return await db
      .select()
      .from(news)
      .orderBy(desc(news.createdAt));
  }

  async getNewsById(id: string): Promise<News | undefined> {
    const [noticia] = await db
      .select()
      .from(news)
      .where(eq(news.id, id));
    return noticia || undefined;
  }

  async createNews(newsData: InsertNews): Promise<News> {
    const [noticia] = await db
      .insert(news)
      .values(newsData)
      .returning();
    return noticia;
  }

  async updateNews(id: string, data: Partial<News>): Promise<News | undefined> {
    const [noticia] = await db
      .update(news)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(news.id, id))
      .returning();
    return noticia || undefined;
  }

  async deleteNews(id: string): Promise<void> {
    await db.delete(news).where(eq(news.id, id));
  }

  // === PROPUESTAS ===
  async getAllProposals(): Promise<Proposal[]> {
    return await db
      .select()
      .from(proposals)
      .orderBy(desc(proposals.createdAt));
  }

  async getProposalById(id: string): Promise<Proposal | undefined> {
    const [propuesta] = await db
      .select()
      .from(proposals)
      .where(eq(proposals.id, id));
    return propuesta || undefined;
  }

  async createProposal(proposalData: InsertProposal): Promise<Proposal> {
    const [propuesta] = await db
      .insert(proposals)
      .values({
        ...proposalData,
        apoyosTP: 0,
        apoyosTA: 0,
      })
      .returning();
    return propuesta;
  }

  async updateProposal(id: string, data: Partial<Proposal>): Promise<Proposal | undefined> {
    const [propuesta] = await db
      .update(proposals)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(proposals.id, id))
      .returning();
    return propuesta || undefined;
  }

  async deleteProposal(id: string): Promise<void> {
    await db.delete(proposals).where(eq(proposals.id, id));
  }

  // === SONDEOS ===
  async getAllPolls(): Promise<Poll[]> {
    return await db
      .select()
      .from(polls)
      .orderBy(desc(polls.createdAt));
  }

  async getPollById(id: string): Promise<Poll | undefined> {
    const [poll] = await db
      .select()
      .from(polls)
      .where(eq(polls.id, id));
    return poll || undefined;
  }

  async createPoll(pollData: InsertPoll): Promise<Poll> {
    const [poll] = await db
      .insert(polls)
      .values(pollData)
      .returning();
    return poll;
  }

  async updatePoll(id: string, data: Partial<Poll>): Promise<Poll | undefined> {
    const [poll] = await db
      .update(polls)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(polls.id, id))
      .returning();
    return poll || undefined;
  }

  async deletePoll(id: string): Promise<void> {
    // Primero eliminar opciones y votos relacionados
    await db.delete(votes).where(eq(votes.pollId, id));
    await db.delete(pollOptions).where(eq(pollOptions.pollId, id));
    // Luego eliminar el sondeo
    await db.delete(polls).where(eq(polls.id, id));
  }

  async getPollOptions(pollId: string): Promise<PollOption[]> {
    return await db
      .select()
      .from(pollOptions)
      .where(eq(pollOptions.pollId, pollId))
      .orderBy(pollOptions.orden);
  }

  async createPollOption(optionData: InsertPollOption): Promise<PollOption> {
    const [option] = await db
      .insert(pollOptions)
      .values({
        ...optionData,
        votos: 0,
      })
      .returning();
    return option;
  }

  async vote(userId: string, pollId: string, optionId: string): Promise<void> {
    // Verificar si ya votó
    const hasVoted = await this.hasUserVoted(userId, pollId);
    if (hasVoted) {
      throw new Error("Ya has votado en este sondeo");
    }

    // Registrar voto
    await db.insert(votes).values({
      userId,
      pollId,
      optionId,
    });

    // Incrementar contador de votos
    await db
      .update(pollOptions)
      .set({
        votos: sql`${pollOptions.votos} + 1`,
      })
      .where(eq(pollOptions.id, optionId));
  }

  async hasUserVoted(userId: string, pollId: string): Promise<boolean> {
    const [voto] = await db
      .select()
      .from(votes)
      .where(and(
        eq(votes.userId, userId),
        eq(votes.pollId, pollId)
      ));
    return !!voto;
  }

  // === COMENTARIOS ===
  async getCommentsByProposal(propuestaId: string): Promise<Comment[]> {
    return await db
      .select()
      .from(comments)
      .where(eq(comments.propuestaId, propuestaId))
      .orderBy(desc(comments.createdAt));
  }

  async getCommentsByNews(noticiaId: string): Promise<Comment[]> {
    return await db
      .select()
      .from(comments)
      .where(eq(comments.noticiaId, noticiaId))
      .orderBy(desc(comments.createdAt));
  }

  async createComment(commentData: InsertComment): Promise<Comment> {
    const [comment] = await db
      .insert(comments)
      .values({
        ...commentData,
        votosPositivos: 0,
        votosNegativos: 0,
      })
      .returning();
    return comment;
  }

  async updateComment(id: string, data: Partial<Comment>): Promise<Comment | undefined> {
    const [comment] = await db
      .update(comments)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(comments.id, id))
      .returning();
    return comment || undefined;
  }

  async getCommentsByDebate(debateId: string): Promise<Comment[]> {
    return await db
      .select()
      .from(comments)
      .where(eq(comments.debateId, debateId))
      .orderBy(desc(comments.createdAt));
  }

  async deleteComment(id: string): Promise<void> {
    await db.delete(comments).where(eq(comments.id, id));
  }

  // === DEBATES ===
  async getAllDebates(): Promise<Debate[]> {
    const debatesWithAuthor = await db
      .select({
        debate: debates,
        autor: {
          id: users.id,
          username: users.username,
        },
      })
      .from(debates)
      .leftJoin(users, eq(debates.autorId, users.id))
      .orderBy(desc(debates.createdAt));

    return debatesWithAuthor.map(d => ({
      ...d.debate,
      autorNombre: d.autor?.username || "Anónimo",
    }));
  }

  async getDebateById(id: string): Promise<Debate | undefined> {
    const [debateWithAuthor] = await db
      .select({
        debate: debates,
        autor: {
          id: users.id,
          username: users.username,
        },
      })
      .from(debates)
      .leftJoin(users, eq(debates.autorId, users.id))
      .where(eq(debates.id, id));

    if (!debateWithAuthor) return undefined;

    return {
      ...debateWithAuthor.debate,
      autorNombre: debateWithAuthor.autor?.username || "Anónimo",
    };
  }

  async createDebate(debateData: InsertDebate): Promise<Debate> {
    const [debate] = await db
      .insert(debates)
      .values({
        ...debateData,
        numRespuestas: 0,
        numVistas: 0,
        destacado: debateData.destacado || false,
      })
      .returning();
    return debate;
  }

  async updateDebate(id: string, data: Partial<Debate>): Promise<Debate | undefined> {
    const [debate] = await db
      .update(debates)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(debates.id, id))
      .returning();
    return debate || undefined;
  }

  async deleteDebate(id: string): Promise<void> {
    await db.delete(debates).where(eq(debates.id, id));
  }

  async incrementDebateViews(id: string): Promise<void> {
    await db
      .update(debates)
      .set({ numVistas: sql`${debates.numVistas} + 1` })
      .where(eq(debates.id, id));
  }

  // === CONTACTO ===
  async createContact(contactData: InsertContact): Promise<Contact> {
    const [contact] = await db
      .insert(contacts)
      .values(contactData)
      .returning();
    return contact;
  }

  async getAllContacts(): Promise<Contact[]> {
    return await db
      .select()
      .from(contacts)
      .orderBy(desc(contacts.createdAt));
  }

  // === INSIGNIAS ===
  async getUserBadges(userId: string): Promise<Badge[]> {
    const userBadgesData = await db
      .select({
        badge: badges,
      })
      .from(userBadges)
      .innerJoin(badges, eq(userBadges.badgeId, badges.id))
      .where(eq(userBadges.userId, userId));
    
    return userBadgesData.map(ub => ub.badge);
  }
}

export const storage = new DatabaseStorage();
