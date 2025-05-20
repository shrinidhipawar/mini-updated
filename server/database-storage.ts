import { 
  users, type User, type InsertUser,
  submissions, type Submission, type InsertSubmission,
  logs, type Log, type InsertLog
} from "@shared/schema";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { db, pool } from "./db";
import { eq } from "drizzle-orm";
import { IStorage } from "./storage";

const PostgresSessionStore = connectPg(session);

export class DatabaseStorage implements IStorage {
  sessionStore: any; // Using any for session store type

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Submission methods
  async getSubmissions(): Promise<Submission[]> {
    return await db.select().from(submissions);
  }

  async getSubmissionsByUserId(userId: number): Promise<Submission[]> {
    return await db.select().from(submissions).where(eq(submissions.userId, userId));
  }

  async createSubmission(insertSubmission: InsertSubmission): Promise<Submission> {
    const [submission] = await db.insert(submissions).values(insertSubmission).returning();
    return submission;
  }

  // Log methods
  async getLogs(): Promise<Log[]> {
    return await db.select().from(logs);
  }

  async getLogsByUserId(userId: number): Promise<Log[]> {
    return await db.select().from(logs).where(eq(logs.userId, userId));
  }

  async getLogsByType(type: string): Promise<Log[]> {
    return await db.select().from(logs).where(eq(logs.type, type));
  }

  async createLog(insertLog: InsertLog): Promise<Log> {
    const [log] = await db.insert(logs).values(insertLog).returning();
    return log;
  }
}