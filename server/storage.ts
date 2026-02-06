import { db } from "./db";
import { 
  invoices, credits, aiReports, users, notifications,
  type InsertInvoice, type UpdateInvoiceRequest, type Invoice,
  type InsertUser, type User,
  type AiReport, type Notification, type InsertNotification
} from "@shared/schema";
import { eq, and, gte, lte, desc } from "drizzle-orm";

export interface IStorage {
  // Users (from Auth)
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Invoices
  getInvoices(userId: string): Promise<Invoice[]>;
  getInvoice(id: number): Promise<Invoice | undefined>;
  createInvoice(userId: string, invoice: InsertInvoice): Promise<Invoice>;
  updateInvoice(id: number, updates: UpdateInvoiceRequest): Promise<Invoice>;
  deleteInvoice(id: number): Promise<void>;

  // Credits
  getCreditBalance(userId: string): Promise<number>;
  addCredits(userId: string, amount: number): Promise<number>;
  deductCredit(userId: string, amount: number): Promise<boolean>;

  // AI Reports
  createAiReport(userId: string, type: string, content: any): Promise<AiReport>;
  getAiReports(userId: string): Promise<AiReport[]>;

  // Notifications
  getNotifications(userId: string): Promise<Notification[]>;
  createNotification(userId: string, notification: InsertNotification): Promise<Notification>;
  markNotificationRead(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // --- Users ---
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    // Note: Replit Auth usually uses 'email' or 'id', but we keep this for compatibility
    // if the auth setup uses it.
    const [user] = await db.select().from(users).where(eq(users.email, username)); 
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // --- Invoices ---
  async getInvoices(userId: string): Promise<Invoice[]> {
    return db.select().from(invoices).where(eq(invoices.userId, userId));
  }

  async getInvoice(id: number): Promise<Invoice | undefined> {
    const [invoice] = await db.select().from(invoices).where(eq(invoices.id, id));
    return invoice;
  }

  async createInvoice(userId: string, invoice: InsertInvoice): Promise<Invoice> {
    const [newInvoice] = await db
      .insert(invoices)
      .values({ ...invoice, userId })
      .returning();
    return newInvoice;
  }

  async updateInvoice(id: number, updates: UpdateInvoiceRequest): Promise<Invoice> {
    const existing = await this.getInvoice(id);
    if (!existing) throw new Error("Invoice not found");

    const [updated] = await db
      .update(invoices)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(invoices.id, id))
      .returning();

    // Balance logic: If marking as paid, subtract from user balance
    if (updates.status === "paid" && existing.status !== "paid") {
      const user = await this.getUser(existing.userId);
      if (user) {
        const newBalance = Number(user.balance) - Number(updated.amount);
        await db.update(users).set({ balance: newBalance.toString() }).where(eq(users.id, user.id));
        
        // Auto-regeneration for recurring bills
        if (updated.recurrenceType !== "none") {
          const nextDueDate = new Date(updated.dueDate);
          if (updated.recurrenceType === "monthly") nextDueDate.setMonth(nextDueDate.getMonth() + 1);
          if (updated.recurrenceType === "annual") nextDueDate.setFullYear(nextDueDate.getFullYear() + 1);
          
          if (updated.recurrenceType === "installment") {
            const current = (updated.currentInstallment || 0) + 1;
            const total = updated.totalInstallments || 0;
            if (current <= total) {
              await this.createInvoice(updated.userId, {
                payee: updated.payee,
                amount: updated.amount,
                dueDate: nextDueDate,
                recurrenceType: "installment",
                currentInstallment: current,
                totalInstallments: total,
                status: "unpaid",
              });
            }
          } else {
            await this.createInvoice(updated.userId, {
              payee: updated.payee,
              amount: updated.amount,
              dueDate: nextDueDate,
              recurrenceType: updated.recurrenceType,
              status: "unpaid",
            });
          }
        }
      }
    }
    return updated;
  }

  async deleteInvoice(id: number): Promise<void> {
    await db.delete(invoices).where(eq(invoices.id, id));
  }

  // --- Credits ---
  async getCreditBalance(userId: string): Promise<number> {
    const [credit] = await db.select().from(credits).where(eq(credits.userId, userId));
    return credit?.balance ?? 0;
  }

  async addCredits(userId: string, amount: number): Promise<number> {
    const [existing] = await db.select().from(credits).where(eq(credits.userId, userId));
    
    if (existing) {
      const [updated] = await db
        .update(credits)
        .set({ balance: existing.balance + amount, updatedAt: new Date() })
        .where(eq(credits.id, existing.id))
        .returning();
      return updated.balance;
    } else {
      const [newCredit] = await db
        .insert(credits)
        .values({ userId, balance: amount })
        .returning();
      return newCredit.balance;
    }
  }

  async deductCredit(userId: string, amount: number): Promise<boolean> {
    const [existing] = await db.select().from(credits).where(eq(credits.userId, userId));
    
    if (!existing || existing.balance < amount) {
      return false;
    }

    await db
      .update(credits)
      .set({ balance: existing.balance - amount, updatedAt: new Date() })
      .where(eq(credits.id, existing.id));
    return true;
  }

  // --- AI Reports ---
  async createAiReport(userId: string, type: string, content: any): Promise<AiReport> {
    const [report] = await db
      .insert(aiReports)
      .values({ userId, reportType: type, content })
      .returning();
    return report;
  }

  async getAiReports(userId: string): Promise<AiReport[]> {
    return db.select().from(aiReports).where(eq(aiReports.userId, userId));
  }

  // --- Notifications ---
  async getNotifications(userId: string): Promise<Notification[]> {
    return db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt));
  }

  async createNotification(userId: string, notification: InsertNotification): Promise<Notification> {
    const [newNotification] = await db
      .insert(notifications)
      .values({ ...notification, userId })
      .returning();
    return newNotification;
  }

  async markNotificationRead(id: number): Promise<void> {
    await db.update(notifications).set({ read: true }).where(eq(notifications.id, id));
  }
}

export const storage = new DatabaseStorage();
