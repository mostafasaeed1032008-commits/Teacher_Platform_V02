import React, { useState, useEffect } from "react";
import { 
  Save, 
  Settings, 
  Phone, 
  Globe, 
  ShieldCheck, 
  Plus, 
  Trash2, 
  Megaphone, 
  BookOpen, 
  Share2, 
  Scale, 
  FileText,
  CheckCircle,
  Award,
  Upload,
  UserCheck
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { getHomepageContent, saveHomepageContent, HomepageContent } from "../../homepage.config";
import { api } from "../../api";

interface Achiever {
  id: string;
  name: string;
  result_line: string;
  photo_url: string;
}

interface QuizCandidate {
  attempt_id: string;
  quiz_id: string;
  quiz_title: string;
  student_id: string;
  student_name: string;
  student_email: string;
  score: number;
  total_questions: number;
  percentage: number;
  created_at: string;
}

export const TeacherSettings: React.FC = () => {
  const { user } = useAuth();
  const token = localStorage.getItem("token") || "";

  // Profile fields (Read-only as requested for security)
  const [profileName] = useState(user?.name || "Teacher");
  const [profileEmail] = useState(user?.email || "teacher@example.com");

  // Customizable platform settings
  const [platformNameEn, setPlatformNameEn] = useState("");
  const [platformNameAr, setPlatformNameAr] = useState("");
  const [platformVodafone, setPlatformVodafone] = useState("");
  const [platformLogo, setPlatformLogo] = useState("");
  const [platformLang, setPlatformLang] = useState("");

  // Homepage customization fields
  const [authorityStatementEn, setAuthorityStatementEn] = useState("");
  const [authorityStatementAr, setAuthorityStatementAr] = useState("");
  const [teacherImageUrl, setTeacherImageUrl] = useState("");
  const [bioEn, setBioEn] = useState("");
  const [bioAr, setBioAr] = useState("");
  const [bioImageUrl, setBioImageUrl] = useState("");
  const [demoVideoId, setDemoVideoId] = useState("");
  const [pointsToEgpRate, setPointsToEgpRate] = useState<number>(1);
  const [facebookUrl, setFacebookUrl] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [tiktokUrl, setTiktokUrl] = useState("");
  const [telegramUrl, setTelegramUrl] = useState("");
  const [termsTextEn, setTermsTextEn] = useState("");
  const [termsTextAr, setTermsTextAr] = useState("");
  const [privacyTextEn, setPrivacyTextEn] = useState("");
  const [privacyTextAr, setPrivacyTextAr] = useState("");
  const [refundTextEn, setRefundTextEn] = useState("");
  const [refundTextAr, setRefundTextAr] = useState("");

  // DB-Backed Top Achievers
  const [dbAchievers, setDbAchievers] = useState<Achiever[]>([]);
  const [quizCandidates, setQuizCandidates] = useState<QuizCandidate[]>([]);

  // Achiever form fields
  const [newAchieverName, setNewAchieverName] = useState("");
  const [newAchieverResult, setNewAchieverResult] = useState("");
  const [newAchieverStudentId, setNewAchieverStudentId] = useState("");
  const [newAchieverPhotoUrl, setNewAchieverPhotoUrl] = useState("");
  const [newAchieverFile, setNewAchieverFile] = useState<File | null>(null);

  // Student Registration & Grade Config fields
  const [gradeLevelsInput, setGradeLevelsInput] = useState("");
  const [autoPromoteWinners, setAutoPromoteWinners] = useState(false);
  const [tracksMap, setTracksMap] = useState<Record<string, string[]>>({});

  useEffect(() => {
    // Load config from localStorage
    setPlatformNameEn(localStorage.getItem("platform_name_en") || "Academia Platform");
    setPlatformNameAr(localStorage.getItem("platform_name_ar") || "منصة أكاديميا التعليمية");
    setPlatformVodafone(localStorage.getItem("platform_vodafone") || "01012345678");
    setPlatformLogo(localStorage.getItem("platform_logo") || "🎓");
    setPlatformLang(localStorage.getItem("platform_language") || "en");

    // Load homepage content
    const hp = getHomepageContent();
    setAuthorityStatementEn(hp.authority_statement_en);
    setAuthorityStatementAr(hp.authority_statement_ar);
    setTeacherImageUrl(hp.teacher_image_url);
    setBioEn(hp.bio_en);
    setBioAr(hp.bio_ar);
    setBioImageUrl(hp.bio_image_url);
    setDemoVideoId(hp.demo_video_id);
    setPointsToEgpRate(hp.points_to_egp_rate);
    setFacebookUrl(hp.facebook_url);
    setYoutubeUrl(hp.youtube_url);
    setInstagramUrl(hp.instagram_url);
    setTiktokUrl(hp.tiktok_url);
    setTelegramUrl(hp.telegram_url);
    setTermsTextEn(hp.terms_text_en);
    setTermsTextAr(hp.terms_text_ar);
    setPrivacyTextEn(hp.privacy_text_en);
    setPrivacyTextAr(hp.privacy_text_ar);
    setRefundTextEn(hp.refund_text_en);
    setRefundTextAr(hp.refund_text_ar);

    // Fetch DB achievers
    fetchDbAchievers();

    // Fetch quiz candidates
    fetchQuizCandidates();

    // Fetch registration config
    fetchRegistrationConfig();
  }, []);

  const fetchDbAchievers = async () => {
    try {
      const data = await api.students.getAchievers();
      setDbAchievers(data);
    } catch (err) {
      console.error("Could not fetch achievers from DB:", err);
    }
  };

  const fetchQuizCandidates = async () => {
    try {
      const data = await api.students.getQuizCandidates(token);
      setQuizCandidates(data);
    } catch (err) {
      console.error("Could not fetch quiz winner candidates:", err);
    }
  };

  const fetchRegistrationConfig = async () => {
    try {
      const data = await api.students.getRegistrationConfig();
      if (data.grade_levels) {
        setGradeLevelsInput(data.grade_levels.join(", "));
      }
      if (data.auto_promote_winners !== undefined) {
        setAutoPromoteWinners(data.auto_promote_winners);
      }
      if (data.tracks) {
        setTracksMap(data.tracks);
      }
    } catch (err) {
      console.error("Could not fetch registration settings config:", err);
    }
  };

  const handleAddAchiever = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAchieverName || !newAchieverResult) {
      alert("Please enter student name and achievement score!");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", newAchieverName);
      formData.append("result_line", newAchieverResult);
      if (newAchieverStudentId) {
        formData.append("student_id", newAchieverStudentId);
      }
      if (newAchieverFile) {
        formData.append("photo", newAchieverFile);
      } else if (newAchieverPhotoUrl) {
        formData.append("photo_url", newAchieverPhotoUrl);
      }

      await api.students.addAchiever(token, formData);
      alert("Top Achiever added successfully!");

      // Reset form
      setNewAchieverName("");
      setNewAchieverResult("");
      setNewAchieverStudentId("");
      setNewAchieverPhotoUrl("");
      setNewAchieverFile(null);

      // Refresh list
      fetchDbAchievers();
    } catch (err: any) {
      alert("Failed to add achiever: " + err.message);
    }
  };

  const handleRemoveAchiever = async (id: string) => {
    if (!confirm("Are you sure you want to remove this top achiever?")) return;
    try {
      await api.students.deleteAchiever(token, id);
      alert("Achiever removed!");
      fetchDbAchievers();
    } catch (err: any) {
      alert("Failed to remove: " + err.message);
    }
  };

  const handlePromoteCandidate = (candidate: QuizCandidate) => {
    setNewAchieverName(candidate.student_name);
    setNewAchieverResult(`المركز الأول بنسبة ${candidate.percentage}% في كويز: ${candidate.quiz_title}`);
    setNewAchieverStudentId(candidate.student_id);
    setNewAchieverPhotoUrl(`https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200`);
    
    // Smooth scroll to manual form
    const formElement = document.getElementById("add-achiever-form");
    if (formElement) {
      formElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSaveRegistrationConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    const gradeLevelsArray = gradeLevelsInput
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    if (gradeLevelsArray.length === 0) {
      alert("Please specify at least one grade level!");
      return;
    }

    try {
      // Build a basic track configuration mapping grades to default high school tracks
      const updatedTracks: Record<string, string[]> = { ...tracksMap };
      gradeLevelsArray.forEach((grade) => {
        if (!updatedTracks[grade]) {
          if (grade.includes("الثالث") || grade.includes("3") || grade.toLowerCase().includes("third")) {
            updatedTracks[grade] = ["علمي علوم", "علمي رياضة", "أدبي"];
          } else {
            updatedTracks[grade] = ["علمي", "أدبي"];
          }
        }
      });

      await api.students.saveRegistrationConfig(token, {
        grade_levels: gradeLevelsArray,
        tracks: updatedTracks,
        auto_promote_winners: autoPromoteWinners
      });

      alert("Student Registration Grade levels, tracks & Auto-promote settings updated!");
      fetchRegistrationConfig();
    } catch (err: any) {
      alert("Failed to save registration config: " + err.message);
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();

    if (!platformNameEn || !platformNameAr || !platformVodafone) {
      alert("Please fill in all platform details");
      return;
    }

    // Save platform customization
    localStorage.setItem("platform_name_en", platformNameEn);
    localStorage.setItem("platform_name_ar", platformNameAr);
    localStorage.setItem("platform_vodafone", platformVodafone);
    localStorage.setItem("platform_logo", platformLogo);
    localStorage.setItem("platform_language", platformLang);

    // Save landing page content
    const updatedHpContent: HomepageContent = {
      authority_statement_en: authorityStatementEn,
      authority_statement_ar: authorityStatementAr,
      teacher_image_url: teacherImageUrl,
      bio_en: bioEn,
      bio_ar: bioAr,
      bio_image_url: bioImageUrl,
      demo_video_id: demoVideoId,
      points_to_egp_rate: Number(pointsToEgpRate) || 1,
      facebook_url: facebookUrl,
      youtube_url: youtubeUrl,
      instagram_url: instagramUrl,
      tiktok_url: tiktokUrl,
      telegram_url: telegramUrl,
      terms_text_en: termsTextEn,
      terms_text_ar: termsTextAr,
      privacy_text_en: privacyTextEn,
      privacy_text_ar: privacyTextAr,
      refund_text_en: refundTextEn,
      refund_text_ar: refundTextAr,
      achievers: getHomepageContent().achievers, // keep local defaults untouched as fallback
      features: getHomepageContent().features // Preserve the 6 features grid cards structure
    };

    saveHomepageContent(updatedHpContent);

    // Update system preferred language
    const currentLang = localStorage.getItem("preferred_language");
    if (currentLang !== platformLang) {
      localStorage.setItem("preferred_language", platformLang);
    }

    alert("Settings and Homepage Content saved successfully!");
    window.location.reload();
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto animate-fade-in pb-16">
      <div>
        <h1 className="text-3xl font-display font-bold text-slate-900 tracking-tight">Platform Settings</h1>
        <p className="text-slate-500 text-sm mt-1">Configure your personal profile, global brand identity, student levels, and public Top Achievers.</p>
      </div>

      {/* SECTION: Teacher Profile summary (Read-only / verified role) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <ShieldCheck className="text-indigo-600" size={18} />
          <h3 className="font-display font-bold text-slate-800 text-sm">Teacher Credentials</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Full Name</span>
            <div className="px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-slate-600 text-sm font-semibold">
              {profileName}
            </div>
          </div>

          <div>
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Email ID</span>
            <div className="px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-slate-600 text-sm font-semibold">
              {profileEmail}
            </div>
          </div>
        </div>
        <p className="text-[10px] text-slate-400">Passwords and roles are handled securely by system authentication policies and cannot be updated dynamically.</p>
      </div>

      {/* SECTION: Student Registration Configuration & Auto-Promote */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Globe className="text-indigo-600" size={18} />
          <h3 className="font-display font-bold text-slate-800 text-sm">Student Registration Config & Auto-Promotion</h3>
        </div>

        <form onSubmit={handleSaveRegistrationConfig} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Available Grade Levels (Comma-separated)</label>
            <input
              type="text"
              required
              value={gradeLevelsInput}
              onChange={(e) => setGradeLevelsInput(e.target.value)}
              placeholder="الصف الأول الثانوي, الصف الثاني الثانوي, الصف الثالث الثانوي"
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm"
            />
            <p className="text-[10px] text-slate-400 mt-1">Specify which grade options students can select during registration. Tracks are mapped automatically based on grade names.</p>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-800">Auto-Promote Quiz Winners 🏆</h4>
              <p className="text-[10px] text-slate-400">Automatically add the student who achieves first place on any quiz directly to the Top Achievers Wall.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={autoPromoteWinners}
                onChange={(e) => setAutoPromoteWinners(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Save size={14} /> Update Registration & Promotion
            </button>
          </div>
        </form>
      </div>

      {/* SECTION: QUIZ WINNER CANDIDATES (MANUAL PROMOTION PLATFORM) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <UserCheck className="text-indigo-600" size={18} />
          <h3 className="font-display font-bold text-slate-800 text-sm">Quiz First-Place Candidates for Promotion</h3>
        </div>

        {quizCandidates.length === 0 ? (
          <p className="text-xs text-slate-400 font-medium italic">No quiz submissions yet to evaluate for top performers.</p>
        ) : (
          <div className="border border-slate-100 rounded-xl overflow-hidden divide-y divide-slate-100">
            {quizCandidates.map((cand, idx) => (
              <div key={`${cand.attempt_id}-${idx}`} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs hover:bg-slate-50/50 transition-colors">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-800">{cand.student_name}</span>
                    <span className="text-[10px] font-semibold text-slate-400">({cand.student_email})</span>
                  </div>
                  <p className="text-[11px] text-indigo-600 font-medium mt-1">
                    Scored <span className="font-bold">{cand.score}/{cand.total_questions} ({cand.percentage}%)</span> on quiz: <span className="font-bold text-slate-700">{cand.quiz_title}</span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handlePromoteCandidate(cand)}
                  className="px-3.5 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 font-bold text-[11px] rounded-lg cursor-pointer flex items-center gap-1 shrink-0 self-start sm:self-center transition-all"
                >
                  🏆 Promote to Wall
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION: MANAGING TOP ACHIEVERS (DB DYNAMIC) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5" id="add-achiever-form">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Award className="text-indigo-600" size={18} />
          <h3 className="font-display font-bold text-slate-800 text-sm">Top Achievers Showcase Wall (Active Database)</h3>
        </div>

        {/* Form to manual append */}
        <form onSubmit={handleAddAchiever} className="bg-slate-50 border border-slate-200/50 p-4 rounded-2xl space-y-4">
          <h4 className="text-xs font-bold text-slate-700">Add Outstanding Student to Showcase Wall</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Student Name *</label>
              <input
                type="text"
                required
                placeholder="أحمد محمود"
                value={newAchieverName}
                onChange={(e) => setNewAchieverName(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Achievement Score / Description *</label>
              <input
                type="text"
                required
                placeholder="المركز الأول بنسبة 99% في الكويز الأسبوعي"
                value={newAchieverResult}
                onChange={(e) => setNewAchieverResult(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Student photo file (.JPG, .PNG) *</label>
              <input
                type="file"
                accept=".jpg,.jpeg,.png"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setNewAchieverFile(e.target.files[0]);
                  }
                }}
                className="w-full text-xs font-medium text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Or Photo URL (Fallback)</label>
              <input
                type="text"
                placeholder="https://images.unsplash.com/..."
                value={newAchieverPhotoUrl}
                onChange={(e) => setNewAchieverPhotoUrl(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
            >
              <Plus size={14} /> Add Student to Wall
            </button>
          </div>
        </form>

        {/* Current dynamic list */}
        <div className="space-y-3 pt-3 border-t border-slate-100">
          <h4 className="text-xs font-bold text-slate-700">Showcased Students currently shown on Homepage:</h4>
          {dbAchievers.length === 0 ? (
            <p className="text-xs text-slate-400 font-medium italic">No students are currently on the database showcase list.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
              {dbAchievers.map((ach) => (
                <div key={ach.id} className="p-3 border border-slate-100 rounded-xl flex items-center justify-between gap-4 bg-slate-50/20">
                  <div className="flex items-center gap-3">
                    <img 
                      src={ach.photo_url} 
                      alt={ach.name} 
                      className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-xs"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <p className="font-bold text-slate-800 text-xs">{ach.name}</p>
                      <p className="text-[10px] text-indigo-600 font-semibold line-clamp-1">{ach.result_line}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveAchiever(ach.id)}
                    className="p-1.5 hover:bg-rose-50 text-rose-500 rounded-lg hover:text-rose-700 cursor-pointer shrink-0 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-8">
        
        {/* SECTION: Platform Branding Info */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Settings className="text-indigo-600" size={18} />
            <h3 className="font-display font-bold text-slate-800 text-sm">Brand Customization & Ingress</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Platform Name (English)</label>
              <input
                type="text"
                required
                value={platformNameEn}
                onChange={(e) => setPlatformNameEn(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Platform Name (Arabic)</label>
              <input
                type="text"
                required
                value={platformNameAr}
                onChange={(e) => setPlatformNameAr(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Logo Symbol / Emoji</label>
              <input
                type="text"
                required
                placeholder="🎓"
                value={platformLogo}
                onChange={(e) => setPlatformLogo(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Vodafone Cash Wallet Number</label>
              <div className="flex gap-2">
                <span className="flex items-center justify-center px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-400">
                  <Phone size={16} />
                </span>
                <input
                  type="text"
                  required
                  placeholder="010XXXXXXXX"
                  value={platformVodafone}
                  onChange={(e) => setPlatformVodafone(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                <Globe size={13} /> Preferred Platform Language
              </label>
              <select
                value={platformLang}
                onChange={(e) => setPlatformLang(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 text-sm"
              >
                <option value="en">English (default)</option>
                <option value="ar">العربية (Arabic)</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECTION: HOMEPAGE / LANDING PAGE HERO TEXT & BIOGRAPHY */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Megaphone className="text-indigo-600" size={18} />
            <h3 className="font-display font-bold text-slate-800 text-sm">Landing Page Marketing Copy</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                Hero Authority Statement (English)
              </label>
              <input
                type="text"
                required
                value={authorityStatementEn}
                onChange={(e) => setAuthorityStatementEn(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                Hero Authority Statement (Arabic)
              </label>
              <input
                type="text"
                required
                value={authorityStatementAr}
                onChange={(e) => setAuthorityStatementAr(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  Teacher Hero Image URL
                </label>
                <input
                  type="text"
                  required
                  value={teacherImageUrl}
                  onChange={(e) => setTeacherImageUrl(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  About Section Photo URL
                </label>
                <input
                  type="text"
                  required
                  value={bioImageUrl}
                  onChange={(e) => setBioImageUrl(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  Teacher Bio Text (English)
                </label>
                <textarea
                  rows={4}
                  required
                  value={bioEn}
                  onChange={(e) => setBioEn(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 text-sm font-sans"
                ></textarea>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  Teacher Bio Text (Arabic)
                </label>
                <textarea
                  rows={4}
                  required
                  value={bioAr}
                  onChange={(e) => setBioAr(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 text-sm font-sans"
                  dir="rtl"
                ></textarea>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  Demo YouTube Video ID (e.g., dQw4w9WgXcQ)
                </label>
                <input
                  type="text"
                  required
                  value={demoVideoId}
                  onChange={(e) => setDemoVideoId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  EGP Reference Value Per Point (Optional)
                </label>
                <input
                  type="number"
                  required
                  step="0.01"
                  min="0.01"
                  value={pointsToEgpRate}
                  onChange={(e) => setPointsToEgpRate(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 text-sm font-semibold"
                />
              </div>
            </div>

          </div>
        </div>

        {/* SECTION: SOCIAL NETWORKS */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Share2 className="text-indigo-600" size={18} />
            <h3 className="font-display font-bold text-slate-800 text-sm">Social Platform Handles</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Facebook Profile URL</label>
              <input
                type="text"
                value={facebookUrl}
                onChange={(e) => setFacebookUrl(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">YouTube Channel URL</label>
              <input
                type="text"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Instagram URL</label>
              <input
                type="text"
                value={instagramUrl}
                onChange={(e) => setInstagramUrl(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">TikTok URL</label>
              <input
                type="text"
                value={tiktokUrl}
                onChange={(e) => setTiktokUrl(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Telegram Support Group URL</label>
              <input
                type="text"
                value={telegramUrl}
                onChange={(e) => setTelegramUrl(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm"
              />
            </div>
          </div>
        </div>

        {/* SECTION: LEGAL PAGE TEXT */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Scale className="text-indigo-600" size={18} />
            <h3 className="font-display font-bold text-slate-800 text-sm">Legal Terms & Policy Pages</h3>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Terms of Use (English)</label>
                <textarea
                  rows={3}
                  value={termsTextEn}
                  onChange={(e) => setTermsTextEn(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 text-xs font-semibold"
                ></textarea>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Terms of Use (Arabic)</label>
                <textarea
                  rows={3}
                  value={termsTextAr}
                  onChange={(e) => setTermsTextAr(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 text-xs font-semibold"
                  dir="rtl"
                ></textarea>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Privacy Policy (English)</label>
                <textarea
                  rows={3}
                  value={privacyTextEn}
                  onChange={(e) => setPrivacyTextEn(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 text-xs font-semibold"
                ></textarea>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Privacy Policy (Arabic)</label>
                <textarea
                  rows={3}
                  value={privacyTextAr}
                  onChange={(e) => setPrivacyTextAr(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 text-xs font-semibold"
                  dir="rtl"
                ></textarea>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Refund Policy (English)</label>
                <textarea
                  rows={3}
                  value={refundTextEn}
                  onChange={(e) => setRefundTextEn(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 text-xs font-semibold"
                ></textarea>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Refund Policy (Arabic)</label>
                <textarea
                  rows={3}
                  value={refundTextAr}
                  onChange={(e) => setRefundTextAr(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 text-xs font-semibold"
                  dir="rtl"
                ></textarea>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION: Save Changes */}
        <div className="pt-6 border-t border-slate-100 flex items-center justify-end">
          <button
            type="submit"
            className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition-all shadow-md cursor-pointer flex items-center gap-2 text-xs sm:text-sm uppercase tracking-wider"
          >
            <Save size={16} /> Save All General Brand copy Settings
          </button>
        </div>
      </form>
    </div>
  );
};
