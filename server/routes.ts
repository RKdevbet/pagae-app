import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { setupAuth, registerAuthRoutes } from "./replit_integrations/auth";
import { openai } from "./replit_integrations/audio/client"; // Re-using client config

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // === AUTH SETUP ===
  await setupAuth(app);
  registerAuthRoutes(app);

  // === INVOICE ROUTES ===
  app.get(api.invoices.list.path, async (req, res) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const invoices = await storage.getInvoices((req.user as any).claims.sub);
    res.json(invoices);
  });

  app.get(api.invoices.get.path, async (req, res) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const invoice = await storage.getInvoice(Number(req.params.id));
    
    if (!invoice || invoice.userId !== (req.user as any).claims.sub) {
      return res.status(404).json({ message: "Invoice not found" });
    }
    res.json(invoice);
  });

  app.post(api.invoices.create.path, async (req, res) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    try {
      const input = api.invoices.create.input.parse(req.body);
      const invoice = await storage.createInvoice((req.user as any).claims.sub, input);
      res.status(201).json(invoice);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.put(api.invoices.update.path, async (req, res) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    try {
      const id = Number(req.params.id);
      const existing = await storage.getInvoice(id);
      
      if (!existing || existing.userId !== (req.user as any).claims.sub) {
        return res.status(404).json({ message: "Invoice not found" });
      }

      const input = api.invoices.update.input.parse(req.body);
      const updated = await storage.updateInvoice(id, input);
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.delete(api.invoices.delete.path, async (req, res) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const id = Number(req.params.id);
    const existing = await storage.getInvoice(id);
    
    if (!existing || existing.userId !== (req.user as any).claims.sub) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    await storage.deleteInvoice(id);
    res.status(204).send();
  });

  // === CREDIT ROUTES ===
  app.get(api.credits.get.path, async (req, res) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const balance = await storage.getCreditBalance((req.user as any).claims.sub);
    res.json({ balance });
  });

  app.post(api.credits.add.path, async (req, res) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    // This would normally be handled via Stripe webhook
    const amount = req.body.amount || 1;
    const newBalance = await storage.addCredits((req.user as any).claims.sub, amount);
    res.json({ balance: newBalance });
  });

  // === AI REPORTING ROUTES ===
  app.get(api.ai.listReports.path, async (req, res) => {
      if (!req.user) return res.status(401).json({ message: "Unauthorized" });
      const reports = await storage.getAiReports((req.user as any).claims.sub);
      res.json(reports);
  });

  app.post(api.ai.generateReport.path, async (req, res) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    
    const userId = (req.user as any).claims.sub;
    
    // 1. Check credits
    const balance = await storage.getCreditBalance(userId);
    if (balance < 1) {
      return res.status(402).json({ message: "Insufficient credits. Please purchase more to generate reports." });
    }

    // 2. Fetch User Data
    const invoices = await storage.getInvoices(userId);
    const invoicesData = JSON.stringify(invoices);

    try {
        // 3. Call OpenAI
        const prompt = `
            Analyze the following financial data (invoices) and generate a comprehensive monthly report.
            Data: ${invoicesData}

            Please provide the output in the following JSON format:
            {
                "summary": "Executive summary of the financial status...",
                "recommendations": ["Recommendation 1", "Recommendation 2"...],
                "totalSpent": 1234.56,
                "remainingDue": 567.89,
                "upcomingBills": [list of immediate next 3 bills]
            }
        `;

        const response = await openai.chat.completions.create({
            model: "gpt-5.1",
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" },
        });

        const content = JSON.parse(response.choices[0]?.message?.content || "{}");

        // 4. Deduct Credit & Store Report
        await storage.deductCredit(userId, 1);
        const report = await storage.createAiReport(userId, "monthly_summary", content);

        res.json(report);

    } catch (error) {
        console.error("AI Generation Error:", error);
        res.status(500).json({ message: "Failed to generate report" });
    }
  });

  // === NOTIFICATIONS ROUTES ===
  app.get("/api/notifications", async (req, res) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const notifications = await storage.getNotifications((req.user as any).claims.sub);
    res.json(notifications);
  });

  app.patch("/api/notifications/:id/read", async (req, res) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    await storage.markNotificationRead(Number(req.params.id));
    res.status(204).send();
  });

  // Settings
  app.patch("/api/user/settings", async (req, res) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const userId = (req.user as any).claims.sub;
    const { language, currency, notificationsEnabled, balance } = req.body;
    
    const [updated] = await db.update(users)
      .set({ 
        ...(language && { language }),
        ...(currency && { currency }),
        ...(notificationsEnabled !== undefined && { notificationsEnabled }),
        ...(balance !== undefined && { balance: balance.toString() }),
        updatedAt: new Date() 
      })
      .where(eq(users.id, userId))
      .returning();
    res.json(updated);
  });

  return httpServer;
}
