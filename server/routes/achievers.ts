import { Router, Response, NextFunction } from "express";
import { authenticateJWT, AuthenticatedRequest } from "../middleware/auth";
import { requireRole } from "../middleware/roles";
import { prisma } from "../config/prisma";
import multer from "multer";
import fs from "fs";
import path from "path";

const router = Router();

// Multer storage for public achiever uploads
const publicUploadsDir = path.join(process.cwd(), "public", "uploads");
if (!fs.existsSync(publicUploadsDir)) {
  fs.mkdirSync(publicUploadsDir, { recursive: true });
}

const publicStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, publicUploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "achiever-" + uniqueSuffix + path.extname(file.originalname));
  }
});

const uploadPublic = multer({
  storage: publicStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = [".png", ".jpg", ".jpeg", ".webp"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Allowed file types: JPG, PNG, WebP"));
    }
  }
});

// ============================================================
// PUBLIC ENDPOINT: Get top N achievers for landing page
// ============================================================
router.get("/public", async (req, res, next) => {
  try {
    // Get the display count setting
    let settings = await prisma.achieversSettings.findFirst();
    if (!settings) {
      settings = await prisma.achieversSettings.create({
        data: {
          achievers_homepage_count: 6,
          updated_at: new Date().toISOString()
        }
      });
    }

    const count = settings.achievers_homepage_count;

    // Fetch top N achievers ordered by display_order (ascending)
    const achievers = await prisma.topAchiever.findMany({
      take: count,
      orderBy: { display_order: "asc" }
    });

    res.json(achievers);
  } catch (err) {
    next(err);
  }
});

// ============================================================
// TEACHER ENDPOINTS: Manage achievers
// ============================================================

// GET all achievers with their order (Teacher ONLY)
router.get("/", authenticateJWT, requireRole("teacher"), async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const achievers = await prisma.topAchiever.findMany({
      orderBy: { display_order: "asc" }
    });
    res.json(achievers);
  } catch (err) {
    next(err);
  }
});

// POST: Create new achiever (Teacher ONLY)
router.post("/", authenticateJWT, requireRole("teacher"), uploadPublic.single("photo"), async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, result_line, student_id } = req.body;

    if (!name || !result_line) {
      res.status(400).json({ error: "Name and result_line are required" });
      return;
    }

    let photo_url = null;
    if (req.file) {
      photo_url = `/uploads/${req.file.filename}`;
    }

    // Get the highest current order
    const lastAchiever = await prisma.topAchiever.findFirst({
      orderBy: { display_order: "desc" }
    });
    const nextOrder = (lastAchiever?.display_order ?? -1) + 1;

    const newAchiever = await prisma.topAchiever.create({
      data: {
        student_id: student_id || null,
        name,
        result_line,
        photo_url,
        display_order: nextOrder,
        created_at: new Date().toISOString()
      }
    });

    res.status(201).json(newAchiever);
  } catch (err) {
    next(err);
  }
});

// GET single achiever (Teacher ONLY)
router.get("/:id", authenticateJWT, requireRole("teacher"), async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const achiever = await prisma.topAchiever.findUnique({
      where: { id }
    });

    if (!achiever) {
      res.status(404).json({ error: "Achiever not found" });
      return;
    }

    res.json(achiever);
  } catch (err) {
    next(err);
  }
});

// PUT: Update achiever (Teacher ONLY)
router.put("/:id", authenticateJWT, requireRole("teacher"), uploadPublic.single("photo"), async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, result_line, student_id } = req.body;

    if (!name || !result_line) {
      res.status(400).json({ error: "Name and result_line are required" });
      return;
    }

    const existing = await prisma.topAchiever.findUnique({
      where: { id }
    });

    if (!existing) {
      res.status(404).json({ error: "Achiever not found" });
      return;
    }

    // If a new photo is uploaded, use it; otherwise keep the old one
    let photo_url = existing.photo_url;
    if (req.file) {
      photo_url = `/uploads/${req.file.filename}`;
    }

    const updated = await prisma.topAchiever.update({
      where: { id },
      data: {
        name,
        result_line,
        student_id: student_id || null,
        photo_url
      }
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// DELETE achiever (Teacher ONLY)
router.delete("/:id", authenticateJWT, requireRole("teacher"), async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    const achiever = await prisma.topAchiever.findUnique({
      where: { id }
    });

    if (!achiever) {
      res.status(404).json({ error: "Achiever not found" });
      return;
    }

    await prisma.topAchiever.delete({
      where: { id }
    });

    res.json({ success: true, message: "Achiever deleted successfully" });
  } catch (err) {
    next(err);
  }
});

// POST: Reorder achievers (Drag & Drop) (Teacher ONLY)
router.post("/reorder", authenticateJWT, requireRole("teacher"), async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { orders } = req.body; // Array of { id, display_order }

    if (!Array.isArray(orders)) {
      res.status(400).json({ error: "orders must be an array" });
      return;
    }

    // Use transaction to update all orders atomically
    await prisma.$transaction(
      orders.map((item: any) =>
        prisma.topAchiever.update({
          where: { id: item.id },
          data: { display_order: item.display_order }
        })
      )
    );

    const updated = await prisma.topAchiever.findMany({
      orderBy: { display_order: "asc" }
    });

    res.json({ success: true, achievers: updated });
  } catch (err) {
    next(err);
  }
});

// ============================================================
// ACHIEVERS SETTINGS ENDPOINTS
// ============================================================

// GET achievers settings (Teacher ONLY)
router.get("/settings/homepage-count", authenticateJWT, requireRole("teacher"), async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    let settings = await prisma.achieversSettings.findFirst();
    if (!settings) {
      settings = await prisma.achieversSettings.create({
        data: {
          achievers_homepage_count: 6,
          updated_at: new Date().toISOString()
        }
      });
    }
    res.json(settings);
  } catch (err) {
    next(err);
  }
});

// PUT: Update homepage count (Teacher ONLY)
router.put("/settings/homepage-count", authenticateJWT, requireRole("teacher"), async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { achievers_homepage_count } = req.body;

    if (typeof achievers_homepage_count !== "number" || achievers_homepage_count < 0) {
      res.status(400).json({ error: "achievers_homepage_count must be a non-negative number" });
      return;
    }

    let settings = await prisma.achieversSettings.findFirst();
    if (!settings) {
      settings = await prisma.achieversSettings.create({
        data: {
          achievers_homepage_count,
          updated_at: new Date().toISOString()
        }
      });
    } else {
      settings = await prisma.achieversSettings.update({
        where: { id: settings.id },
        data: {
          achievers_homepage_count,
          updated_at: new Date().toISOString()
        }
      });
    }

    res.json(settings);
  } catch (err) {
    next(err);
  }
});

export default router;
