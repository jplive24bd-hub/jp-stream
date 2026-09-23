import { Express, Request, Response } from "express";
import { db } from "./db";
import { channels, categories } from "../shared/schema";
import { eq } from "drizzle-orm";

export function registerRoutes(app: Express) {

  // Admin Auto M3U Category Import
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

  // User Dynamic M3U Fetcher
  app.post("/api/user/fetch-playlist", async (req: Request, res: Response) => {
    try {
      const { url } = req.body;
      if (!url) return res.status(400).json({ error: "URL is required" });

      const response = await fetch(url);
      const m3uText = await response.text();

      const lines = m3uText.split("\n");
      const parsedChannels = [];
      let currentCategory = "User Playlist";

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith("#EXTINF:")) {
          const groupMatch = line.match(/group-title="([^"]+)"/);
          if (groupMatch) currentCategory = groupMatch[1].trim();

          const name = line.split(",")[1]?.trim() || "User Channel";
          const streamUrl = lines[i + 1]?.trim();

          if (streamUrl && !streamUrl.startsWith("#")) {
            parsedChannels.push({ name, url: streamUrl, category: currentCategory });
          }
        }
      }

      res.json({ success: true, channels: parsedChannels });
    } catch (e: any) {
      res.status(500).json({ error: "Failed to load M3U playlist" });
    }
  });

  // App API - Active Channels
  app.get("/api/channels/active", async (req: Request, res: Response) => {
    const activeList = await db.select().from(channels).where(eq(channels.isVisible, true));
    res.json(activeList);
  });

  // Hide/Unhide Toggle
  app.patch("/api/admin/channels/:id/toggle", async (req: Request, res: Response) => {
    const { id } = req.params;
    const { isVisible } = req.body;
    await db.update(channels).set({ isVisible }).where(eq(channels.id, Number(id)));
    res.json({ success: true });
  });

  // Delete Channel
  app.delete("/api/admin/channels/:id", async (req: Request, res: Response) => {
    const { id } = req.params;
    await db.delete(channels).where(eq(channels.id, Number(id)));
    res.json({ success: true });
  });
}

