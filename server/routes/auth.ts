import { Router, Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../config/prisma";
import { rateLimiter } from "../middleware/rateLimiter";
import { authenticateJWT, AuthenticatedRequest } from "../middleware/auth";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "platform-super-secret-key-123!";

// Auto seed teacher account function
export async function seedTeacherAccount() {
  try {
    const existing = await prisma.user.findUnique({
      where: { email: "teacher@platform.com" }
    });
    if (!existing) {
      console.log("Seeding default teacher account...");
      const hashedPassword = await bcrypt.hash("teacher123", 10);
      await prisma.user.create({
        data: {
          name: "Teacher Account",
          email: "teacher@platform.com",
          password_hash: hashedPassword,
          role: "teacher",
          created_at: new Date().toISOString()
        }
      });
      console.log("Default teacher account successfully seeded!");
    } else if (existing.role !== "teacher") {
      console.log("Teacher account found but with different role. Correcting...");
      await prisma.user.update({
        where: { email: "teacher@platform.com" },
        data: { role: "teacher" }
      });
      console.log("Default teacher account successfully corrected!");
    }
  } catch (err) {
    console.error("Error seeding teacher account:", err);
  }
}

import multer from "multer";
import fs from "fs";
import path from "path";

const privateDir = path.join(process.cwd(), "private_uploads");
if (!fs.existsSync(privateDir)) {
  fs.mkdirSync(privateDir, { recursive: true });
}

const privateStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, privateDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "id-" + uniqueSuffix + path.extname(file.originalname));
  }
});

const uploadPrivate = multer({
  storage: privateStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowed = [".png", ".jpg", ".jpeg", ".pdf"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Allowed file types: JPG, PNG, PDF"));
    }
  }
});

// Student signup rate limit: max 5 requests per 15 minutes
const signupLimiter = rateLimiter(5, 15 * 60 * 1000);
// Login rate limit: max 10 requests per 5 minutes
const loginLimiter = rateLimiter(10, 5 * 60 * 1000);

// Student registration with Egyptian student profile data
router.post("/signup", signupLimiter, uploadPrivate.single("id_document"), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      first_name,
      middle_name,
      last_name,
      email,
      governorate,
      city,
      gender,
      phone,
      grade_level,
      track,
      father_phone,
      mother_phone,
      password,
      confirm_password
    } = req.body;

    if (!first_name || !middle_name || !last_name || !email || !governorate || !city || !gender || !phone || !grade_level || !father_phone || !mother_phone || !password || !confirm_password) {
      res.status(400).json({ error: "جميع الحقول المطلوبة يجب ملؤها" });
      return;
    }

    if (password !== confirm_password) {
      res.status(400).json({ error: "كلمتا المرور غير متطابقتين" });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ error: "البريد الإلكتروني غير صالح" });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: "يجب أن تكون كلمة المرور 6 أحرف على الأقل" });
      return;
    }

    const egPhoneRegex = /^01[0125]\d{8}$/;
    if (!egPhoneRegex.test(phone)) {
      res.status(400).json({ error: "رقم الهاتف غير صحيح (يجب أن يكون رقم محمول مصري صالح)" });
      return;
    }
    if (!egPhoneRegex.test(father_phone)) {
      res.status(400).json({ error: "رقم هاتف الأب غير صحيح (يجب أن يكون رقم محمول مصري صالح)" });
      return;
    }
    if (!egPhoneRegex.test(mother_phone)) {
      res.status(400).json({ error: "رقم هاتف الأم غير صحيح (يجب أن يكون رقم محمول مصري صالح)" });
      return;
    }

    if (!req.file) {
      res.status(400).json({ error: "برجاء رفع صورة البطاقة الشخصية أو شهادة الميلاد" });
      return;
    }

    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });
    if (existing) {
      res.status(400).json({ error: "البريد الإلكتروني مسجل بالفعل" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const fullName = `${first_name} ${middle_name} ${last_name}`;

    const result = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name: fullName,
          email: email.toLowerCase(),
          password_hash: hashedPassword,
          role: "student",
          created_at: new Date().toISOString()
        }
      });

      await tx.studentProfile.create({
        data: {
          user_id: newUser.id,
          first_name,
          middle_name,
          last_name,
          governorate,
          city,
          gender,
          phone,
          grade_level,
          track: track || null,
          father_phone,
          mother_phone,
          id_document_url: req.file!.filename,
          created_at: new Date().toISOString()
        }
      });

      return { newUser };
    });

    const token = jwt.sign(
      { id: result.newUser.id, email: result.newUser.email, role: result.newUser.role, name: result.newUser.name },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      token,
      user: {
        id: result.newUser.id,
        name: result.newUser.name,
        email: result.newUser.email,
        role: result.newUser.role
      }
    });
  } catch (err: any) {
    next(err);
  }
});

// Login
router.post("/login", loginLimiter, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: "Missing email or password" });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });
    if (!user) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    next(err);
  }
});

// Fetch current user self details
router.get("/me", authenticateJWT, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthenticated" });
      return;
    }
    const dbUser = await prisma.user.findUnique({
      where: { id: req.user.id }
    });
    if (!dbUser) {
      res.status(401).json({ error: "User not found in database. Please log in again." });
      return;
    }
    res.json({ user: req.user });
  } catch (err) {
    next(err);
  }
});

// Update current user profile / password
router.put("/profile", authenticateJWT, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id || "";
    const { name, password } = req.body;

    const dataToUpdate: any = {};
    if (name) {
      dataToUpdate.name = name;
    }
    if (password) {
      if (password.length < 6) {
        res.status(400).json({ error: "Password must be at least 6 characters long" });
        return;
      }
      dataToUpdate.password_hash = await bcrypt.hash(password, 10);
    }

    if (Object.keys(dataToUpdate).length === 0) {
      res.status(400).json({ error: "No valid fields to update" });
      return;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: dataToUpdate
    });

    res.json({
      success: true,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role
      }
    });
  } catch (err) {
    next(err);
  }
});

export default router;
