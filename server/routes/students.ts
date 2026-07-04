import { Router, Response, NextFunction } from "express";
import { authenticateJWT, AuthenticatedRequest } from "../middleware/auth";
import { requireRole } from "../middleware/roles";
import { prisma } from "../config/prisma";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";
import multer from "multer";

const router = Router();

// Configuration files paths
const settingsPath = path.join(process.cwd(), "prisma", "platform_settings.json");

// Helper function to load platform settings
export function getPlatformSettings() {
  if (fs.existsSync(settingsPath)) {
    try {
      return JSON.parse(fs.readFileSync(settingsPath, "utf-8"));
    } catch (e) {
      // fallback
    }
  }
  const defaults = {
    grade_levels: ["الصف الثاني الثانوي", "الصف الثالث الثانوي"],
    tracks: {
      "الصف الثالث الثانوي": ["علمي علوم", "علمي رياضة", "أدبي"],
      "الصف الثاني الثانوي": ["علمي", "أدبي"]
    },
    auto_promote_winners: false
  };
  fs.writeFileSync(settingsPath, JSON.stringify(defaults, null, 2));
  return defaults;
}

function savePlatformSettings(settings: any) {
  fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
}

// Generate signed URL token for document retrieval (expires in 60s)
export function generateDocSignedUrl(studentId: string): string {
  const JWT_SECRET = process.env.JWT_SECRET || "platform-super-secret-key-123!";
  const token = jwt.sign(
    { studentId, purpose: "id_document_view" },
    JWT_SECRET,
    { expiresIn: "60s" }
  );
  return `/api/students/${studentId}/id-document?token=${token}`;
}

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
  limits: { fileSize: 5 * 1024 * 1024 }
});


// 1. GET platform registration settings (Grade levels, tracks, auto-promote setting)
router.get("/settings/registration-config", async (req, res, next) => {
  try {
    const s = getPlatformSettings();
    res.json(s);
  } catch (err) {
    next(err);
  }
});

// 2. PUT platform registration settings (Teacher ONLY)
router.put("/settings/registration-config", authenticateJWT, requireRole("teacher"), async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { grade_levels, tracks, auto_promote_winners } = req.body;
    if (!Array.isArray(grade_levels)) {
      res.status(400).json({ error: "grade_levels must be an array" });
      return;
    }
    savePlatformSettings({
      grade_levels,
      tracks: tracks || {},
      auto_promote_winners: !!auto_promote_winners
    });
    res.json({ success: true, message: "Settings updated successfully" });
  } catch (err) {
    next(err);
  }
});

// 3. GET Top Achievers from database
router.get("/achievers", async (req, res, next) => {
  try {
    const achievers = await prisma.topAchiever.findMany({
      orderBy: { created_at: "desc" }
    });
    res.json(achievers);
  } catch (err) {
    next(err);
  }
});

// 4. POST add a Top Achiever manually (Teacher ONLY)
router.post("/achievers", authenticateJWT, requireRole("teacher"), uploadPublic.single("photo"), async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, result_line, student_id } = req.body;
    if (!name || !result_line) {
      res.status(400).json({ error: "Name and result/description are required" });
      return;
    }

    let photo_url = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150";
    if (req.file) {
      photo_url = `/uploads/${req.file.filename}`;
    } else if (req.body.photo_url) {
      photo_url = req.body.photo_url;
    }

    const newAchiever = await prisma.topAchiever.create({
      data: {
        student_id: student_id || null,
        name,
        result_line,
        photo_url,
        created_at: new Date().toISOString()
      }
    });

    res.status(201).json(newAchiever);
  } catch (err) {
    next(err);
  }
});

// 5. DELETE a Top Achiever (Teacher ONLY)
router.delete("/achievers/:id", authenticateJWT, requireRole("teacher"), async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.topAchiever.delete({
      where: { id }
    });
    res.json({ success: true, message: "Top Achiever removed successfully" });
  } catch (err) {
    next(err);
  }
});

// 6. GET Quiz winners candidates (Teacher ONLY)
router.get("/quiz-candidates", authenticateJWT, requireRole("teacher"), async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const quizzes = await prisma.quiz.findMany();
    const candidates = [];

    for (const q of quizzes) {
      const attempts = await prisma.quizAttempt.findMany({
        where: { quiz_id: q.id },
        orderBy: { score: "desc" },
        take: 3 // top 3 scorers
      });

      for (const attempt of attempts) {
        candidates.push({
          attempt_id: attempt.id,
          quiz_id: q.id,
          quiz_title: q.title,
          student_id: attempt.student_id,
          student_name: attempt.student_name,
          student_email: attempt.student_email,
          score: attempt.score,
          total_questions: attempt.total_questions,
          percentage: Math.round((attempt.score / attempt.total_questions) * 100),
          created_at: attempt.created_at
        });
      }
    }

    res.json(candidates);
  } catch (err) {
    next(err);
  }
});

// Retrieve list of registered students with aggregated statistics (Teacher ONLY)
router.get("/", authenticateJWT, requireRole("teacher"), async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const studentsList = await prisma.user.findMany({
      where: {
        role: "student"
      },
      orderBy: {
        created_at: "desc"
      }
    });

    // Fetch transactions and enrollments and quiz attempts for statistics
    const transactions = await prisma.walletTransaction.findMany();
    const enrollments = await prisma.enrollment.findMany();
    const quizAttempts = await prisma.quizAttempt ? await prisma.quizAttempt.findMany() : [];

    const enrichedStudents = studentsList.map(student => {
      // Calculate balance
      const studentTx = transactions.filter(t => t.student_id === student.id);
      let balance = 0;
      studentTx.forEach(tx => {
        if (tx.type === "topup_approved") {
          balance += tx.points_amount;
        } else if (tx.type === "course_purchase") {
          balance -= tx.points_amount;
        }
      });

      const studentEnrollments = enrollments.filter(e => e.student_id === student.id);
      const studentAttempts = quizAttempts.filter(q => q.student_id === student.id);

      return {
        id: student.id,
        name: student.name,
        email: student.email,
        created_at: student.created_at,
        current_balance: balance,
        courses_count: studentEnrollments.length,
        quiz_attempts_count: studentAttempts.length
      };
    });

    res.json(enrichedStudents);
  } catch (err) {
    next(err);
  }
});

// Retrieve single student's complete historical details (Teacher or own Student)
router.get("/:id", authenticateJWT, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || "";
    const userRole = req.user?.role;

    if (userRole !== "teacher" && userId !== id) {
      res.status(403).json({ error: "Access Denied. You can only view your own records." });
      return;
    }

    const student = await prisma.user.findFirst({
      where: {
        id,
        role: "student"
      }
    });

    if (!student) {
      res.status(404).json({ error: "Student not found" });
      return;
    }

    // Wallet transaction history
    const walletHistory = await prisma.walletTransaction.findMany({
      where: { student_id: id },
      orderBy: { created_at: "desc" }
    });

    // Compute balance
    let balance = 0;
    walletHistory.forEach(tx => {
      if (tx.type === "topup_approved") {
        balance += tx.points_amount;
      } else if (tx.type === "course_purchase") {
        balance -= tx.points_amount;
      }
    });

    // Enrollments with Course details
    const studentEnrollments = await prisma.enrollment.findMany({
      where: { student_id: id },
      orderBy: { created_at: "desc" }
    });

    const courses = await prisma.course.findMany();
    const enrollmentsWithDetails = studentEnrollments.map(e => {
      const course = courses.find(c => c.id === e.course_id);
      return {
        id: e.id,
        course_id: e.course_id,
        course_title: course?.title || "Unknown Course",
        enrolled_at: e.created_at
      };
    });

    // Quiz history / attempts
    let attemptsList: any[] = [];
    try {
      attemptsList = await prisma.quizAttempt.findMany({
        where: { student_id: id },
        orderBy: { created_at: "desc" }
      });
    } catch (e) {
      // QuizAttempt table fallback
    }

    const quizAttemptsParsed = attemptsList.map(a => ({
      ...a,
      answers: typeof a.answers === "string" ? JSON.parse(a.answers) : a.answers
    }));

    // Fetch the sensitive student profile
    const profile = await prisma.studentProfile.findUnique({
      where: { user_id: id }
    });

    // Cleaned profile with server-side signed URL
    let secureProfile = null;
    if (profile) {
      secureProfile = {
        first_name: profile.first_name,
        middle_name: profile.middle_name,
        last_name: profile.last_name,
        governorate: profile.governorate,
        city: profile.city,
        gender: profile.gender,
        phone: profile.phone,
        grade_level: profile.grade_level,
        track: profile.track,
        created_at: profile.created_at,
        // Only return these highly sensitive fields to teacher or owning student
        father_phone: profile.father_phone,
        mother_phone: profile.mother_phone,
        id_document_url: profile.id_document_url ? generateDocSignedUrl(id) : ""
      };
    }

    res.json({
      student: {
        id: student.id,
        name: student.name,
        email: student.email,
        created_at: student.created_at,
        current_balance: balance
      },
      profile: secureProfile,
      enrollments: enrollmentsWithDetails,
      wallet_history: walletHistory,
      quiz_history: quizAttemptsParsed
    });
  } catch (err) {
    next(err);
  }
});

// Serve private ID document file (Teacher or own Student only, gated by signed token)
router.get("/:id/id-document", authenticateJWT, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { token } = req.query;

    if (!token || typeof token !== "string") {
      res.status(401).json({ error: "Missing document authorization token" });
      return;
    }

    const JWT_SECRET = process.env.JWT_SECRET || "platform-super-secret-key-123!";
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      res.status(403).json({ error: "Expired or invalid document token" });
      return;
    }

    if (decoded.purpose !== "id_document_view" || decoded.studentId !== id) {
      res.status(403).json({ error: "Unauthorized token purpose or recipient" });
      return;
    }

    const requesterId = req.user?.id || "";
    const requesterRole = req.user?.role;
    if (requesterRole !== "teacher" && requesterId !== id) {
      res.status(403).json({ error: "Access Denied to view this private file" });
      return;
    }

    const profile = await prisma.studentProfile.findUnique({
      where: { user_id: id }
    });

    if (!profile || !profile.id_document_url) {
      res.status(404).json({ error: "ID Document not found for this student profile" });
      return;
    }

    const filePath = path.join(process.cwd(), "private_uploads", profile.id_document_url);
    if (!fs.existsSync(filePath)) {
      res.status(404).json({ error: "ID Document file not found on server disk" });
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    let contentType = "application/octet-stream";
    if (ext === ".pdf") contentType = "application/pdf";
    else if (ext === ".jpg" || ext === ".jpeg") contentType = "image/jpeg";
    else if (ext === ".png") contentType = "image/png";

    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Disposition", `inline; filename="id_document${ext}"`);
    fs.createReadStream(filePath).pipe(res);
  } catch (err) {
    next(err);
  }
});

export default router;
