import { Express, Request, Response } from "express";
import { db } from "./db";
import { channels, categories, users } from "../shared/schema";
import { eq } from "drizzle-orm";

export function registerRoutes(app: Express) {

  // URL Based Admin Login API
  app.post("/api/admin/login", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      
      // Default initial login check
      if (email === "admin@jpstream.com" && password === "123456") {
        return res.json({ success: true, token: "jp-admin-secure-token", email });
      }

      // Updated DB Credentials check
      const adminUser = await db.select().from(users).where(eq(users.email, email)).get();
      if (adminUser && adminUser.password === password) {
        return res.json({ success: true, token: "jp-admin-secure-token", email });
      }

      res.status(401).json({ error: "ইমেইল অথবা পাসওয়ার্ড সঠিক নয়!" });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Admin Change Password API
  app.post("/api/admin/change-password", async (req: Request, res: Response) => {
    try {
      const { email, newPassword } = req.body;
      const existingUser = await db.select().from(users).where(eq(users.email, email)).get();

      if (existingUser) {
        await db.update(users).set({ password: newPassword }).where(eq(users.email, email));
      } else {
        await db.insert(users).values({ email, password: newPassword, role: "admin" });
      }

      res.json({ success: true, message: "পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে!" });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Auto Category Import from M3U (Admin Only)
  app.post("/api/admin/import-m3u", async (req: Request, res: Response) => {
    try {
      const { m3uContent } = req.body;
      if (!m3uContent) return res.status(400).json({ error: "Content is empty" });

      const lines = m3uContent.split("\n");
      let currentCategory = "General";
      let count = 0;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith("#EXTINF:")) {
          const groupMatch = line.match(/group-title="([^"]+)"/);
          if (groupMatch) currentCategory = groupMatch[1].trim();

          const name = line.split(",")[1]?.trim() || "JP Stream Channel";
          const url = lines[i + 1]?.trim();

          if (url && !url.startsWith("#")) {
            let cat = await db.select().from(categories).where(eq(categories.name, currentCategory)).get();
            if (!cat) {
              const inserted = await db.insert(categories).values({ name: currentCategory }).returning();
              cat = inserted[0];
            }
            await db.insert(channels).values({
              name: name,
              url: url,
              categoryId: cat.id,
              isVisible: true
            });
            count++;
          }
        }
      }
      res.json({ success: true, count: count });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // App API - Public Channel Feed (No Login Required)
  app.get("/api/channels/active", async (req: Request, res: Response) => {
    const activeList = await db.select().from(channels).where(eq(channels.isVisible, true));
    res.json(activeList);
  });

  // Admin Toggle Channel Visibility
  app.patch("/api/admin/channels/:id/toggle", async (req: Request, res: Response) => {
    const { id } = req.params;
    const { isVisible } = req.body;
    await db.update(channels).set({ isVisible }).where(eq(channels.id, Number(id)));
    res.json({ success: true });
  });

  // Admin Delete Channel
  app.delete("/api/admin/channels/:id", async (req: Request, res: Response) => {
    const { id } = req.params;
    await db.delete(channels).where(eq(channels.id, Number(id)));
    res.json({ success: true });
  });
        }
