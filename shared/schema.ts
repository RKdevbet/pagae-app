import { pgTable, text, serial, integer, boolean, timestamp, numeric, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// === AUTH & USERS (From Replit Auth) ===
import { users } from "./models/auth";
export * from "./models/auth";

// === TABLE DEFINITIONS ===

export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  payee: text("payee").notNull(),
  description: text("description"),
  amount: numeric("amount").notNull(),
  dueDate: timestamp("due_date").notNull(),
  status: text("status", { enum: ["paid", "unpaid", "overdue"] }).default("unpaid").notNull(),
  paidAmount: numeric("paid_amount").default("0").notNull(),
  recurrenceType: text("recurrence_type", { enum: ["none", "monthly", "annual", "installment"] }).default("none").notNull(),
  totalInstallments: integer("total_installments"),
  currentInstallment: integer("current_installment"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const credits = pgTable("credits", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  balance: integer("balance").default(0).notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const aiReports = pgTable("ai_reports", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  reportType: text("report_type").notNull(), // e.g., "monthly_summary", "spending_analysis"
  content: jsonb("content").notNull(), // Structured AI response
  createdAt: timestamp("created_at").defaultNow(),
});

// === RELATIONS ===
export const invoicesRelations = relations(invoices, ({ one }) => ({
  user: one(users, {
    fields: [invoices.userId],
    references: [users.id],
  }),
}));

export const creditsRelations = relations(credits, ({ one }) => ({
  user: one(users, {
    fields: [credits.userId],
    references: [users.id],
  }),
}));

export const aiReportsRelations = relations(aiReports, ({ one }) => ({
  user: one(users, {
    fields: [aiReports.userId],
    references: [users.id],
  }),
}));


// === BASE SCHEMAS ===
export const insertInvoiceSchema = createInsertSchema(invoices).omit({ 
  id: true, 
  userId: true, 
  createdAt: true, 
  updatedAt: true 
}).extend({
  amount: z.coerce.number().min(0, "Amount must be positive"),
  paidAmount: z.coerce.number().min(0).optional(),
  dueDate: z.coerce.date(),
  totalInstallments: z.coerce.number().optional(),
  currentInstallment: z.coerce.number().optional(),
});

export const insertCreditSchema = createInsertSchema(credits).omit({
  id: true,
  userId: true,
  updatedAt: true
});

// === EXPLICIT API CONTRACT TYPES ===

// Base types
export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type Credit = typeof credits.$inferSelect;
export type AiReport = typeof aiReports.$inferSelect;

// Request types
export type CreateInvoiceRequest = InsertInvoice;
export type UpdateInvoiceRequest = Partial<InsertInvoice>;

// Response types
export type InvoiceResponse = Invoice;
export type InvoicesListResponse = Invoice[];
export type CreditBalanceResponse = { balance: number };

// AI Types
export type GenerateReportRequest = {
  startDate?: string; // ISO date string
  endDate?: string;   // ISO date string
};

export type AiReportResponse = {
  summary: string;
  recommendations: string[];
  totalSpent: number;
  remainingDue: number;
  upcomingBills: Invoice[];
};

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  message: text("message").notNull(),
  read: boolean("read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

