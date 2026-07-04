import { Router, Response, NextFunction } from "express";
import { authenticateJWT, AuthenticatedRequest } from "../middleware/auth";
import { requireRole } from "../middleware/roles";
import { prisma } from "../config/prisma";
import { GoogleGenAI, Type } from "@google/genai";

const router = Router();

// Retrieve quizzes for a course
router.get("/course/:courseId", authenticateJWT, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { courseId } = req.params;
    const quizzesList = await prisma.quiz.findMany({
      where: {
        course_id: courseId
      }
    });

    const quizzes = quizzesList.map(q => ({
      ...q,
      questions: JSON.parse(q.questions || "[]")
    }));

    res.json(quizzes);
  } catch (err) {
    next(err);
  }
});

// Retrieve all quizzes (Teacher ONLY)
router.get("/", authenticateJWT, requireRole("teacher"), async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const quizzesList = await prisma.quiz.findMany({
      orderBy: { created_at: "desc" }
    });

    const quizzes = quizzesList.map(q => ({
      ...q,
      questions: JSON.parse(q.questions || "[]")
    }));

    res.json(quizzes);
  } catch (err) {
    next(err);
  }
});

// Create Quiz (Teacher ONLY)
router.post("/", authenticateJWT, requireRole("teacher"), async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { course_id, title, duration_minutes, questions } = req.body;
    if (!title || !questions || !Array.isArray(questions)) {
      res.status(400).json({ error: "Title and list of questions are required" });
      return;
    }

    // Validate JSON structure
    for (const q of questions) {
      if (!q.question || !Array.isArray(q.options) || typeof q.correct_index !== "number" || !q.explanation) {
        res.status(400).json({ error: "Invalid question schema. Each question must have a 'question', 'options', 'correct_index', and 'explanation'." });
        return;
      }
    }

    const newQuiz = await prisma.quiz.create({
      data: {
        course_id: course_id || null,
        title,
        duration_minutes: Number(duration_minutes) || 30,
        questions: JSON.stringify(questions),
        created_at: new Date().toISOString()
      }
    });

    res.status(201).json({
      ...newQuiz,
      questions: JSON.parse(newQuiz.questions || "[]")
    });
  } catch (err) {
    next(err);
  }
});

// Update Quiz (Teacher ONLY)
router.put("/:id", authenticateJWT, requireRole("teacher"), async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { course_id, title, duration_minutes, questions } = req.body;

    if (!title || !questions || !Array.isArray(questions)) {
      res.status(400).json({ error: "Title and list of questions are required" });
      return;
    }

    // Validate JSON structure
    for (const q of questions) {
      if (!q.question || !Array.isArray(q.options) || typeof q.correct_index !== "number" || !q.explanation) {
        res.status(400).json({ error: "Invalid question schema inside questions array." });
        return;
      }
    }

    const updated = await prisma.quiz.update({
      where: { id },
      data: {
        course_id: course_id || null,
        title,
        duration_minutes: Number(duration_minutes) || 30,
        questions: JSON.stringify(questions)
      }
    });

    res.json({
      ...updated,
      questions: JSON.parse(updated.questions || "[]")
    });
  } catch (err) {
    next(err);
  }
});

// Delete Quiz (Teacher ONLY)
router.delete("/:id", authenticateJWT, requireRole("teacher"), async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.quiz.delete({
      where: { id }
    });
    res.json({ success: true, message: "Quiz deleted successfully" });
  } catch (err) {
    next(err);
  }
});

// AI Quiz Generation Fallback - No Paid API Dependency
function generateMockQuestions(topic: string, count: number): any[] {
  const lowercaseTopic = topic.toLowerCase();
  const questions: any[] = [];
  
  if (lowercaseTopic.includes("newton") || lowercaseTopic.includes("motion") || lowercaseTopic.includes("force") || lowercaseTopic.includes("gravity") || lowercaseTopic.includes("physic")) {
    const pool = [
      {
        question: "According to Newton's First Law of Motion, what happens to an object in motion if no external force acts upon it?",
        options: [
          "It will gradually slow down and stop",
          "It will continue moving at a constant velocity in a straight line",
          "It will accelerate in the direction of its initial motion",
          "It will immediately come to rest"
        ],
        correct_index: 1,
        explanation: "Newton's First Law of Motion (the Law of Inertia) states that an object in motion remains in motion at a constant velocity, and an object at rest remains at rest, unless acted upon by a net external force.",
        image_query: "physics inertia moving"
      },
      {
        question: "What is the mathematical equation associated with Newton's Second Law of Motion?",
        options: [
          "E = mc²",
          "p = mv",
          "F = ma",
          "v = u + at"
        ],
        correct_index: 2,
        explanation: "Newton's Second Law of Motion defines force as the product of mass and acceleration, written as Force = mass × acceleration (F = ma).",
        image_query: "physics formula motion"
      },
      {
        question: "Newton's Third Law of Motion states that for every action, there is an equal and opposite _______?",
        options: [
          "Inertia",
          "Reaction",
          "Force of gravity",
          "Acceleration"
        ],
        correct_index: 1,
        explanation: "The Third Law states that for every action force, there is an equal and opposite reaction force acting on different objects.",
        image_query: "newton action reaction"
      },
      {
        question: "Which of the following is a unit of measurement for force named after the scientist who formulated the laws of motion?",
        options: [
          "Joule",
          "Watt",
          "Newton",
          "Pascal"
        ],
        correct_index: 2,
        explanation: "The SI unit of force is the Newton (N), named in honor of Sir Isaac Newton.",
        image_query: "newton gravity apple"
      },
      {
        question: "What physical property resists changes in an object's state of motion?",
        options: [
          "Inertia",
          "Velocity",
          "Gravity",
          "Friction"
        ],
        correct_index: 0,
        explanation: "Inertia is the tendency of an object to resist any change in its velocity, which is directly proportional to its mass.",
        image_query: "inertia mass force"
      }
    ];
    for (let i = 0; i < count; i++) {
      questions.push(JSON.parse(JSON.stringify(pool[i % pool.length])));
    }
  } else if (lowercaseTopic.includes("chem") || lowercaseTopic.includes("organic") || lowercaseTopic.includes("atom") || lowercaseTopic.includes("element") || lowercaseTopic.includes("acid")) {
    const pool = [
      {
        question: "Which element is considered the core backbone of all organic chemical compounds?",
        options: [
          "Hydrogen",
          "Oxygen",
          "Carbon",
          "Nitrogen"
        ],
        correct_index: 2,
        explanation: "Organic chemistry is defined as the chemistry of carbon compounds. Carbon atoms can form four stable covalent bonds, allowing for highly complex molecular structures.",
        image_query: "carbon atom model"
      },
      {
        question: "What type of chemical bond is formed when two atoms share valence electrons?",
        options: [
          "Ionic bond",
          "Covalent bond",
          "Hydrogen bond",
          "Metallic bond"
        ],
        correct_index: 1,
        explanation: "A covalent bond involves the sharing of electron pairs between atoms, common in organic molecules like hydrocarbons.",
        image_query: "covalent bond molecule"
      },
      {
        question: "What is the pH level of a completely neutral liquid solution, such as pure water?",
        options: [
          "0",
          "7",
          "14",
          "1"
        ],
        correct_index: 1,
        explanation: "On the pH scale of 0 to 14, 7 represents a completely neutral solution. Values below 7 are acidic, while values above 7 are basic/alkaline.",
        image_query: "water glass pure"
      },
      {
        question: "Hydrocarbons containing only single bonds between carbon atoms are called:",
        options: [
          "Alkanes",
          "Alkenes",
          "Alkynes",
          "Arenes"
        ],
        correct_index: 0,
        explanation: "Alkanes are saturated hydrocarbons containing only single carbon-carbon bonds, with the general formula CnH2n+2.",
        image_query: "hydrocarbon chemical formula"
      },
      {
        question: "Which of the following describes an endothermic reaction?",
        options: [
          "A reaction that releases energy in the form of heat",
          "A reaction that absorbs energy/heat from its surroundings",
          "A reaction that proceeds without any activation energy",
          "A reaction that results in a neutral pH level"
        ],
        correct_index: 1,
        explanation: "An endothermic reaction absorbs thermal energy from its surroundings, causing a drop in temperature.",
        image_query: "ice melting chemistry"
      }
    ];
    for (let i = 0; i < count; i++) {
      questions.push(JSON.parse(JSON.stringify(pool[i % pool.length])));
    }
  } else if (lowercaseTopic.includes("program") || lowercaseTopic.includes("cod") || lowercaseTopic.includes("javascript") || lowercaseTopic.includes("python") || lowercaseTopic.includes("web") || lowercaseTopic.includes("tech")) {
    const pool = [
      {
        question: "What does the abbreviation HTTP stand for in web technology?",
        options: [
          "High Transfer Text Protocol",
          "Hypertext Transfer Protocol",
          "Hyperlink Text Translation Process",
          "Home Tool Transfer Program"
        ],
        correct_index: 1,
        explanation: "HTTP stands for Hypertext Transfer Protocol. It is the foundation of data communication for the World Wide Web.",
        image_query: "internet network computer"
      },
      {
        question: "Which of the following is a non-volatile type of computer memory that retains data even when powered off?",
        options: [
          "RAM (Random Access Memory)",
          "L1 Cache",
          "ROM (Read-Only Memory)",
          "CPU Registers"
        ],
        correct_index: 2,
        explanation: "ROM (Read-Only Memory) is non-volatile, meaning it permanently stores data that is not lost when power is turned off, unlike RAM.",
        image_query: "computer chip rom memory"
      },
      {
        question: "In object-oriented programming, what is the process of hiding internal details and exposing only what is necessary called?",
        options: [
          "Polymorphism",
          "Inheritance",
          "Encapsulation",
          "Abstraction"
        ],
        correct_index: 2,
        explanation: "Encapsulation is the bundling of data and methods that operate on that data into a single unit (class) and restricting direct access to some of the object's components.",
        image_query: "lock shield secure"
      },
      {
        question: "Which programming language is predominantly used to add interactive behaviors and dynamic logic to websites?",
        options: [
          "HTML",
          "CSS",
          "JavaScript",
          "SQL"
        ],
        correct_index: 2,
        explanation: "While HTML provides structure and CSS provides style, JavaScript is the client-side programming language that implements interactive webpage logic.",
        image_query: "javascript code screen"
      },
      {
        question: "What is the primary function of a database management system (DBMS)?",
        options: [
          "To compile source code into machine executables",
          "To store, retrieve, manage, and secure structured data",
          "To render user interfaces for mobile web browsers",
          "To route network packets between routers and switches"
        ],
        correct_index: 1,
        explanation: "A Database Management System (DBMS) is software used to organize, store, retrieve, manipulate, and secure structured records.",
        image_query: "database server disk"
      }
    ];
    for (let i = 0; i < count; i++) {
      questions.push(JSON.parse(JSON.stringify(pool[i % pool.length])));
    }
  } else {
    const capitalizedTopic = topic.charAt(0).toUpperCase() + topic.slice(1);
    const pool = [
      {
        question: `Which of the following represents the foundational concept of ${capitalizedTopic}?`,
        options: [
          `The core theoretical principles defining its scope`,
          `Its application in simulated physical laboratory systems`,
          `The structural composition of its key variables`,
          `The historical evolution of its primary frameworks`
        ],
        correct_index: 0,
        explanation: `Understanding the foundational concepts of ${capitalizedTopic} is essential for advanced analysis and practical application.`,
        image_query: `${topic} foundation`
      },
      {
        question: `When analyzing ${capitalizedTopic}, which primary factor is considered most critical?`,
        options: [
          `The environmental constraints governing the system`,
          `The ratio of system efficiency to input energy`,
          `The qualitative correlation between key variable dynamics`,
          `The quantitative limits of error margins`
        ],
        correct_index: 2,
        explanation: `Evaluating the relationships and correlation between variables is the cornerstone of studying ${capitalizedTopic}.`,
        image_query: `${topic} factor`
      },
      {
        question: `What is a misconception regarding ${capitalizedTopic}?`,
        options: [
          `That it is only applicable under high pressure scenarios`,
          `That it operates independently of external systemic influences`,
          `That its outcomes are always entirely deterministic`,
          `That it has no direct real-world engineering value`
        ],
        correct_index: 1,
        explanation: `Many practitioners assume that ${capitalizedTopic} works in a vacuum, ignoring external environments and feedback loops.`,
        image_query: `${topic} concept`
      },
      {
        question: `Which of the following tools or methods is most suitable for evaluating ${capitalizedTopic}?`,
        options: [
          `Empirical experimental studies and structured observation`,
          `Theoretically derived mathematical model simulations`,
          `Statistical regression and data visualization dashboards`,
          `All of the above methods integrated together`
        ],
        correct_index: 3,
        explanation: `Comprehensive assessment of ${capitalizedTopic} utilizes empirical research, mathematical modeling, and data-driven analysis simultaneously.`,
        image_query: `${topic} analysis`
      },
      {
        question: `What is the most significant modern advancement in the field of ${capitalizedTopic}?`,
        options: [
          `The automation of its workflow processes and metrics`,
          `The discovery of completely new structural paradigms`,
          `The elimination of traditional measurement limits`,
          `The optimization of standard mechanical configurations`
        ],
        correct_index: 0,
        explanation: `Modern implementations of ${capitalizedTopic} rely heavily on automation, digitized tracking, and real-time computation.`,
        image_query: `${topic} technology`
      }
    ];
    for (let i = 0; i < count; i++) {
      questions.push(JSON.parse(JSON.stringify(pool[i % pool.length])));
    }
  }
  
  return questions;
}

// AI Quiz Generation using Gemini 3.5 Flash (Teacher ONLY)
router.post("/generate-ai", authenticateJWT, requireRole("teacher"), async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { topic, difficulty, question_count, source_text, include_images } = req.body;

    if (!topic || !question_count) {
      res.status(400).json({ error: "Topic and question count are required" });
      return;
    }

    let generatedQuestions: any[] = [];
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.log("No GEMINI_API_KEY set. Falling back to robust mock quiz generator...");
      generatedQuestions = generateMockQuestions(topic, Number(question_count) || 5);
    } else {
      try {
        // Initialize GoogleGenAI SDK
        const ai = new GoogleGenAI({
          apiKey,
          httpOptions: {
            headers: {
              "User-Agent": "aistudio-build"
            }
          }
        });

        const userPrompt = `
Generate a quiz based on the following parameters:
- Topic: ${topic}
- Difficulty: ${difficulty || "Medium"}
- Question Count: ${Number(question_count) || 5}
${source_text ? `- Source Reference Text: "${source_text}"` : ""}
${include_images ? "- Please generate a relevant, brief 2-4 word search term/query in 'image_query' to search Wikimedia Commons for an illustrative image for each question." : ""}

Guidelines:
1. Provide a list of accurate, non-trivial multiple-choice questions.
2. For each question, provide 4 options.
3. Choose the correct option index (0 to 3).
4. Provide a helpful educational explanation for the correct answer.
${source_text ? "5. IMPORTANT: Ground the questions and answers STRICTLY in the provided Source Reference Text." : ""}
        `;

        // Query Gemini 3.5 Flash
        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: userPrompt,
          config: {
            systemInstruction: "You are an expert curriculum developer. Generate multiple-choice quiz questions in high-quality JSON according to the requested schema. Provide explanations, correct indices, and search queries.",
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.ARRAY,
              description: "An array of multiple-choice questions.",
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING, description: "The multiple choice question text." },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "Exactly 4 options."
                  },
                  correct_index: { type: Type.INTEGER, description: "The 0-based index of the correct option (0, 1, 2, or 3)." },
                  explanation: { type: Type.STRING, description: "Detailed explanation of why the selected option is correct." },
                  image_query: { type: Type.STRING, description: "A 2-4 word search query to find a relevant image on Wikimedia Commons (e.g. 'gravity orbit' or 'mitosis cell')." },
                  image_url: { type: Type.STRING, description: "Always leave empty or omit this field initially." }
                },
                required: ["question", "options", "correct_index", "explanation"]
              }
            }
          }
        });

        const jsonText = response.text;
        if (!jsonText) {
          throw new Error("Empty response received from GenAI");
        }

        generatedQuestions = JSON.parse(jsonText.trim());
      } catch (geminiErr) {
        console.warn("Gemini generation failed. Falling back to mock generator:", geminiErr);
        generatedQuestions = generateMockQuestions(topic, Number(question_count) || 5);
      }
    }

    // If include_images is requested, execute the Wikimedia lookup for each question in parallel
    if (include_images && Array.isArray(generatedQuestions)) {
      const lookupPromises = generatedQuestions.map(async (q: any) => {
        const query = q.image_query || q.question.split(" ").slice(0, 3).join(" ");
        if (query) {
          try {
            const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrnamespace=6&prop=imageinfo&iiprop=url&format=json`;
            const wikiRes = await fetch(url, {
              headers: {
                "User-Agent": "BrandedTeacherPlatform/1.0 (mostafasaeed1032008@gmail.com)"
              }
            });
            if (wikiRes.ok) {
              const wikiData: any = await wikiRes.json();
              if (wikiData && wikiData.query && wikiData.query.pages) {
                const pages = wikiData.query.pages;
                const firstPageId = Object.keys(pages)[0];
                const page = pages[firstPageId];
                if (page && page.imageinfo && page.imageinfo[0] && page.imageinfo[0].url) {
                  q.image_url = page.imageinfo[0].url;
                }
              }
            }
          } catch (err) {
            console.error(`Wikimedia search failed for query "${query}":`, err);
          }
        }
        // Remove temporary search query
        delete q.image_query;
        return q;
      });

      generatedQuestions = await Promise.all(lookupPromises);
    }

    res.json({ questions: generatedQuestions });
  } catch (err: any) {
    console.error("AI quiz generation failed:", err);
    res.status(500).json({ error: err.message || "Failed to generate quiz." });
  }
});

// Retrieve single quiz details (Gated by enrollment for students)
router.get("/:id", authenticateJWT, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || "";
    const role = req.user?.role;

    const quiz = await prisma.quiz.findUnique({
      where: { id }
    });

    if (!quiz) {
      res.status(404).json({ error: "Quiz not found" });
      return;
    }

    // Verify enrollment for students if quiz is course-bound
    if (role === "student" && quiz.course_id) {
      const enrollment = await prisma.enrollment.findFirst({
        where: {
          student_id: userId,
          course_id: quiz.course_id
        }
      });
      if (!enrollment) {
        res.status(403).json({ error: "Access denied. You must be enrolled in the course to take this quiz." });
        return;
      }
    }

    res.json({
      ...quiz,
      questions: JSON.parse(quiz.questions || "[]")
    });
  } catch (err) {
    next(err);
  }
});

// Submit Quiz Attempt (Student ONLY)
router.post("/:id/attempt", authenticateJWT, requireRole("student"), async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const studentId = req.user?.id || "";
    const { answers } = req.body; // array of chosen indices

    if (!Array.isArray(answers)) {
      res.status(400).json({ error: "Answers array is required" });
      return;
    }

    const quiz = await prisma.quiz.findUnique({
      where: { id }
    });

    if (!quiz) {
      res.status(404).json({ error: "Quiz not found" });
      return;
    }

    // Verify enrollment if course-bound
    if (quiz.course_id) {
      const enrollment = await prisma.enrollment.findFirst({
        where: {
          student_id: studentId,
          course_id: quiz.course_id
        }
      });
      if (!enrollment) {
        res.status(403).json({ error: "You are not enrolled in the course associated with this quiz" });
        return;
      }
    }

    const quizQuestions = JSON.parse(quiz.questions || "[]");
    let score = 0;

    const snapshot = quizQuestions.map((q: any, index: number) => {
      const studentAnswer = answers[index] !== undefined ? answers[index] : -1;
      const isCorrect = studentAnswer === q.correct_index;
      if (isCorrect) {
        score++;
      }
      return {
        question: q.question,
        options: q.options,
        correct_index: q.correct_index,
        explanation: q.explanation || "",
        image_url: q.image_url || null,
        selected_index: studentAnswer,
        is_correct: isCorrect
      };
    });

    const newAttempt = await prisma.quizAttempt.create({
      data: {
        student_id: studentId,
        student_name: req.user?.name || "",
        student_email: req.user?.email || "",
        quiz_id: id,
        quiz_title: quiz.title,
        course_id: quiz.course_id,
        score,
        total_questions: quizQuestions.length,
        answers: JSON.stringify(snapshot),
        created_at: new Date().toISOString()
      }
    });

    // Auto promotion to Top Achievers wall if enabled
    try {
      const { getPlatformSettings } = await import("./students");
      const settings = getPlatformSettings();
      if (settings && settings.auto_promote_winners) {
        const totalQ = quizQuestions.length;
        // Check if this attempt is indeed the highest score so far for this quiz
        const otherAttempts = await prisma.quizAttempt.findMany({
          where: { quiz_id: id }
        });
        const isTopScore = otherAttempts.every(att => att.score <= score);
        if (isTopScore && score > 0) {
          const percentage = Math.round((score / totalQ) * 100);
          const result_line = `المركز الأول في اختبار: ${quiz.title} بنسبة ${percentage}%`;
          
          const already = await prisma.topAchiever.findFirst({
            where: {
              student_id: studentId,
              result_line: { contains: quiz.title }
            }
          });
          
          if (!already) {
            await prisma.topAchiever.create({
              data: {
                student_id: studentId,
                name: req.user?.name || "",
                result_line,
                photo_url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150",
                created_at: new Date().toISOString()
              }
            });
          }
        }
      }
    } catch (autoErr) {
      console.error("Auto promotion error (non-blocking):", autoErr);
    }

    res.status(201).json({
      success: true,
      attempt: {
        ...newAttempt,
        answers: snapshot
      }
    });
  } catch (err) {
    next(err);
  }
});

export default router;
