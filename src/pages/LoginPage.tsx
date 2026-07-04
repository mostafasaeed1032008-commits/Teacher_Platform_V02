import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../api";
import { THEME_CONFIG, getBrandName } from "../theme.config";
import { t } from "../locales";
import { Mail, Lock, User, AlertCircle, Upload, CheckCircle, FileText, Smartphone, MapPin, GraduationCap, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { motion } from "motion/react";
import { getPlatformLanguage } from "../locales";

interface LoginPageProps {
  initialMode?: "login" | "signup";
  onBack?: () => void;
}

const EGYPT_GOVERNORATES: Record<string, string[]> = {
  "القاهرة": ["القاهرة", "حلوان", "شبرا الخيمة", "القاهرة الجديدة", "الشروق", "المعادي", "مصر الجديدة"],
  "الجيزة": ["الجيزة", "6 أكتوبر", "الشيخ زايد", "المهندسين", "الهرم", "الدقي", "فيصل"],
  "الإسكندرية": ["الإسكندرية", "برج العرب", "العجمي", "سيدي بشر", "سموحة"],
  "القليوبية": ["بنها", "قليوب", "الخانكة", "شبرا الخيمة", "شين الكوم"],
  "الشرقية": ["الزقازيق", "العاشر من رمضان", "بلبيس", "منيا القمح"],
  "الدقهلية": ["المنصورة", "ميت غمر", "السنبلاوين", "طلخا"],
  "الغربية": ["طنطا", "المحلة الكبرى", "كفر الزيات", "زفتى"],
  "المنوفية": ["شبين الكوم", "أشمون", "منوف", "قويسنا", "مدينة السادات"],
  "البحيرة": ["دمنهور", "كفر الدوار", "إيتاي البارود", "رشيد"],
  "كفر الشيخ": ["كفر الشيخ", "دسوق", "قلين", "بلطيم"],
  "دمياط": ["دمياط", "رأس البر", "فارسكور"],
  "بورسعيد": ["بورسعيد", "بورفؤاد"],
  "الإسماعيلية": ["الإسماعيلية", "التل الكبير"],
  "السويس": ["السويس", "الأربعين"],
  "الفيوم": ["الفيوم", "إطسا", "سنورس"],
  "بني سويف": ["بني سويف", "الواسطى", "ناصر"],
  "المنيا": ["المنيا", "ملوي", "مغاغة", "بني مزار"],
  "أسيوط": ["أسيوط", "ديروط", "منفلوط", "القوصية"],
  "سوهاج": ["سوهاج", "طهطا", "جرجا", "أخميم"],
  "قنا": ["قنا", "نجع حمادي", "دشنا", "قوص"],
  "الأقصر": ["الأقصر", "إسنا", "أرمنت"],
  "أسوان": ["أسوان", "إدفو", "كوم أمبو"],
  "مطروح": ["مرسى مطروح", "العلمين", "سيوة"],
  "البحر الأحمر": ["الغردقة", "سفاجا", "القصير"],
  "الوادي الجديد": ["الخارجة", "الداخلة"],
  "شمال سيناء": ["العريش", "بئر العبد"],
  "جنوب سيناء": ["طور سيناء", "شرم الشيخ", "دهب"]
};

export const LoginPage: React.FC<LoginPageProps> = ({ initialMode = "login", onBack }) => {
  const { login } = useAuth();
  const [authMode, setAuthMode] = useState<"login" | "signup">(initialMode);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Configuration for Registration Fields (dynamic from DB/Settings)
  const [gradeLevels, setGradeLevels] = useState<string[]>(["الصف الثاني الثانوي", "الصف الثالث الثانوي"]);
  const [tracksConfig, setTracksConfig] = useState<Record<string, string[]>>({
    "الصف الثالث الثانوي": ["علمي علوم", "علمي رياضة", "أدبي"],
    "الصف الثاني الثانوي": ["علمي", "أدبي"]
  });

  // Login inputs
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Signup inputs
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [governorate, setGovernorate] = useState("");
  const [city, setCity] = useState("");
  const [gender, setGender] = useState("");
  const [phone, setPhone] = useState("");
  const [gradeLevel, setGradeLevel] = useState("");
  const [track, setTrack] = useState("");
  const [fatherPhone, setFatherPhone] = useState("");
  const [motherPhone, setMotherPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // ID Verification Upload State
  const [idFile, setIdFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);

  // Load configuration from backend on mount
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const config = await api.students.getRegistrationConfig();
        if (config.grade_levels) {
          setGradeLevels(config.grade_levels);
        }
        if (config.tracks) {
          setTracksConfig(config.tracks);
        }
      } catch (err) {
        console.warn("Could not load registration settings, using default high school config", err);
      }
    };
    fetchConfig();
  }, [authMode]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
      if ([".jpg", ".jpeg", ".png", ".pdf"].includes(ext)) {
        setIdFile(file);
      } else {
        setError(getPlatformLanguage() === 'ar' ? 'نوع الملف غير مسموح به. الصيغ المقبولة: JPG, PNG, PDF' : 'Invalid file type. Allowed: JPG, PNG, PDF');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIdFile(e.target.files[0]);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const data = await api.auth.login(loginEmail, loginPassword);
      login(data.token, data.user);
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const isAr = getPlatformLanguage() === 'ar';

    // Verification checkups
    if (password !== confirmPassword) {
      setError(isAr ? "كلمتا المرور غير متطابقتين" : "Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError(isAr ? "كلمة المرور يجب أن لا تقل عن 6 أحرف" : "Password must be at least 6 characters");
      return;
    }

    // Egyptian phone numbers pattern: begins with 010, 011, 012, or 015 followed by exactly 8 digits
    const egPhoneRegex = /^01[0125]\d{8}$/;
    if (!egPhoneRegex.test(phone)) {
      setError(isAr ? "رقم الهاتف غير صحيح (يجب أن يكون رقم محمول مصري مكون من 11 رقم)" : "Invalid student mobile (must be a valid Egyptian mobile number)");
      return;
    }
    if (!egPhoneRegex.test(fatherPhone)) {
      setError(isAr ? "رقم هاتف الأب غير صحيح (يجب أن يكون رقم محمول مصري مكون من 11 رقم)" : "Invalid father mobile (must be a valid Egyptian mobile number)");
      return;
    }
    if (!egPhoneRegex.test(motherPhone)) {
      setError(isAr ? "رقم هاتف الأم غير صحيح (يجب أن يكون رقم محمول مصري مكون من 11 رقم)" : "Invalid mother mobile (must be a valid Egyptian mobile number)");
      return;
    }

    if (!idFile) {
      setError(isAr ? "يجب رفع ملف إثبات الهوية (البطاقة أو شهادة الميلاد)" : "ID document upload is required for verification");
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("first_name", firstName);
      formData.append("middle_name", middleName);
      formData.append("last_name", lastName);
      formData.append("email", signupEmail);
      formData.append("governorate", governorate);
      formData.append("city", city);
      formData.append("gender", gender);
      formData.append("phone", phone);
      formData.append("grade_level", gradeLevel);
      formData.append("track", track);
      formData.append("father_phone", fatherPhone);
      formData.append("mother_phone", motherPhone);
      formData.append("password", password);
      formData.append("confirm_password", confirmPassword);
      formData.append("id_document", idFile);

      const data = await api.auth.signup(formData);
      
      // Clear ID document from local state
      setIdFile(null);
      
      login(data.token, data.user);
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  const activeTracks = gradeLevel ? tracksConfig[gradeLevel] || [] : [];
  const isAr = getPlatformLanguage() === 'ar';

  return (
    <div className={`max-w-xl mx-auto my-12 px-4`} id="login-container">
      {onBack && (
        <button
          onClick={onBack}
          className="mb-4 inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
        >
          <ArrowLeft size={14} className="stroke-[2.5]" />
          <span>{isAr ? 'العودة للرئيسية' : 'BACK TO HOMEPAGE'}</span>
        </button>
      )}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className={`${THEME_CONFIG.classes.card} p-6 sm:p-8 space-y-6`}
      >
        <div className="text-center space-y-2">
          <span className="text-4xl inline-block animate-bounce" id="logo-symbol">
            {THEME_CONFIG.logoSymbol}
          </span>
          <h1 className="font-display font-bold text-2xl text-slate-900 tracking-tight">
            {getBrandName()}
          </h1>
          <p className="text-xs text-slate-400 font-medium tracking-wide uppercase">
            {authMode === "login" ? (isAr ? "بوابة تسجيل الدخول للمنصة" : "Platform Portal Gateway") : (isAr ? "تسجيل حساب طالب جديد" : "Register Student Account")}
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-50 border border-red-100 text-red-800 p-4 rounded-xl text-xs font-semibold flex items-start gap-2.5"
            id="login-error-banner"
          >
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </motion.div>
        )}

        {authMode === "login" ? (
          // ================= LOGIN FORM =================
          <form onSubmit={handleLogin} className="space-y-4" id="auth-form-login">
            <div>
              <label className={THEME_CONFIG.classes.label}>{t("email")}</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="user@example.com"
                  className={`${THEME_CONFIG.classes.input} pl-10`}
                  id="auth-email-input"
                />
              </div>
            </div>

            <div>
              <label className={THEME_CONFIG.classes.label}>{t("password")}</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`${THEME_CONFIG.classes.input} pl-10 pr-10`}
                  id="auth-password-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className={`${THEME_CONFIG.classes.primaryButton} w-full py-3 mt-2`}
              id="btn-auth-submit"
            >
              {submitting ? t("submitting") : t("login")}
            </button>
          </form>
        ) : (
          // ================= SIGNUP FORM (ENHANCED STUDENT REGISTRATION) =================
          <form onSubmit={handleSignup} className="space-y-6" id="auth-form-signup">
            
            {/* 1. Personal Info Section */}
            <div className="space-y-4 border-b border-slate-100 pb-4">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs">١</span>
                {isAr ? "البيانات الشخصية للطالب" : "Student Personal Details"}
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className={THEME_CONFIG.classes.label}>{isAr ? "الاسم الأول *" : "First Name *"}</label>
                  <input
                    type="text"
                    required
                    placeholder={isAr ? "أحمد" : "Ahmed"}
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className={THEME_CONFIG.classes.input}
                  />
                </div>
                <div>
                  <label className={THEME_CONFIG.classes.label}>{isAr ? "اسم الأب *" : "Middle Name *"}</label>
                  <input
                    type="text"
                    required
                    placeholder={isAr ? "محمد" : "Mohamed"}
                    value={middleName}
                    onChange={(e) => setMiddleName(e.target.value)}
                    className={THEME_CONFIG.classes.input}
                  />
                </div>
                <div>
                  <label className={THEME_CONFIG.classes.label}>{isAr ? "اسم العائلة *" : "Last Name *"}</label>
                  <input
                    type="text"
                    required
                    placeholder={isAr ? "سعيد" : "Saeed"}
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className={THEME_CONFIG.classes.input}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={THEME_CONFIG.classes.label}>{isAr ? "البريد الإلكتروني *" : "Email Address *"}</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      placeholder="student@example.com"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      className={`${THEME_CONFIG.classes.input} pl-10`}
                    />
                  </div>
                </div>

                <div>
                  <label className={THEME_CONFIG.classes.label}>{isAr ? "رقم الموبايل *" : "Student Mobile *"}</label>
                  <div className="relative">
                    <Smartphone className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="tel"
                      required
                      placeholder="01xxxxxxxxx"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className={`${THEME_CONFIG.classes.input} pl-10`}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className={THEME_CONFIG.classes.label}>{isAr ? "الجنس *" : "Gender *"}</label>
                <div className="flex gap-4">
                  <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      value="male"
                      required
                      checked={gender === "male"}
                      onChange={() => setGender("male")}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>{isAr ? "ذكر" : "Male"}</span>
                  </label>
                  <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      value="female"
                      required
                      checked={gender === "female"}
                      onChange={() => setGender("female")}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>{isAr ? "أنثى" : "Female"}</span>
                  </label>
                </div>
              </div>
            </div>

            {/* 2. Location Info Section */}
            <div className="space-y-4 border-b border-slate-100 pb-4">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs">٢</span>
                {isAr ? "الموقع الجغرافي" : "Geographical Location"}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={THEME_CONFIG.classes.label}>{isAr ? "المحافظة *" : "Governorate *"}</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <select
                      required
                      value={governorate}
                      onChange={(e) => {
                        setGovernorate(e.target.value);
                        setCity("");
                      }}
                      className={`${THEME_CONFIG.classes.input} pl-10`}
                    >
                      <option value="">{isAr ? "اختر المحافظة" : "Select Governorate"}</option>
                      {Object.keys(EGYPT_GOVERNORATES).map((gov) => (
                        <option key={gov} value={gov}>
                          {gov}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className={THEME_CONFIG.classes.label}>{isAr ? "المركز / المدينة *" : "City / Center *"}</label>
                  <select
                    required
                    disabled={!governorate}
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className={THEME_CONFIG.classes.input}
                  >
                    <option value="">{isAr ? "اختر المدينة" : "Select City"}</option>
                    {governorate &&
                      EGYPT_GOVERNORATES[governorate]?.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
            </div>

            {/* 3. Academic Info & Parents Section */}
            <div className="space-y-4 border-b border-slate-100 pb-4">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs">٣</span>
                {isAr ? "البيانات الدراسية والاتصال بأولياء الأمور" : "Academic Level & Parents Contact"}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={THEME_CONFIG.classes.label}>{isAr ? "الصف الدراسي *" : "Academic Grade *"}</label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <select
                      required
                      value={gradeLevel}
                      onChange={(e) => {
                        setGradeLevel(e.target.value);
                        setTrack("");
                      }}
                      className={`${THEME_CONFIG.classes.input} pl-10`}
                    >
                      <option value="">{isAr ? "اختر الصف الدراسي" : "Select Grade"}</option>
                      {gradeLevels.map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {activeTracks.length > 0 && (
                  <div>
                    <label className={THEME_CONFIG.classes.label}>{isAr ? "الشعبة الدراسية *" : "Academic Track *"}</label>
                    <select
                      required
                      value={track}
                      onChange={(e) => setTrack(e.target.value)}
                      className={THEME_CONFIG.classes.input}
                    >
                      <option value="">{isAr ? "اختر الشعبة" : "Select Track"}</option>
                      {activeTracks.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={THEME_CONFIG.classes.label}>{isAr ? "رقم موبايل الأب *" : "Father's Mobile *"}</label>
                  <div className="relative">
                    <Smartphone className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="tel"
                      required
                      placeholder="01xxxxxxxxx"
                      value={fatherPhone}
                      onChange={(e) => setFatherPhone(e.target.value)}
                      className={`${THEME_CONFIG.classes.input} pl-10`}
                    />
                  </div>
                </div>

                <div>
                  <label className={THEME_CONFIG.classes.label}>{isAr ? "رقم موبايل الأم *" : "Mother's Mobile *"}</label>
                  <div className="relative">
                    <Smartphone className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="tel"
                      required
                      placeholder="01xxxxxxxxx"
                      value={motherPhone}
                      onChange={(e) => setMotherPhone(e.target.value)}
                      className={`${THEME_CONFIG.classes.input} pl-10`}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Identity Document Upload Section */}
            <div className="space-y-4 border-b border-slate-100 pb-4">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-semibold">٤</span>
                {isAr ? "إثبات الهوية (مستند خاص آمن)" : "Identity Verification Document (Private)"}
              </h3>
              
              <p className="text-[11px] text-slate-500 leading-relaxed bg-amber-50 border border-amber-100 p-2.5 rounded-lg">
                ⚠️ {isAr 
                  ? "يرجى رفع صورة واضحة لبطاقة الرقم القومي أو شهادة ميلاد الطالب. يتم مراجعتها وتأكيدها بشكل آمن وخاص ولا تظهر للعامة." 
                  : "Please upload a clear scan/photo of the National ID card or birth certificate. This document is kept strictly confidential and visible only to the verified platform teacher."}
              </p>

              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
                  dragActive ? "border-indigo-500 bg-indigo-50/50" : idFile ? "border-emerald-500 bg-emerald-50/20" : "border-slate-200 hover:border-indigo-400"
                }`}
              >
                <input
                  type="file"
                  id="id-doc-upload"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                
                {idFile ? (
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="p-3 bg-emerald-100 text-emerald-700 rounded-full">
                      <CheckCircle className="w-6 h-6 animate-pulse" />
                    </div>
                    <p className="text-xs font-bold text-emerald-800">{idFile.name}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{(idFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                    <label
                      htmlFor="id-doc-upload"
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 underline cursor-pointer mt-1"
                    >
                      {isAr ? "تغيير الملف" : "Change File"}
                    </label>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="p-3 bg-slate-100 text-slate-400 rounded-full">
                      <Upload className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-semibold text-slate-700">
                      {isAr ? "اسحب وأفلت الملف هنا أو" : "Drag and drop your file here, or"}
                    </p>
                    <label
                      htmlFor="id-doc-upload"
                      className="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg shadow-sm transition-colors cursor-pointer"
                    >
                      {isAr ? "اختر الملف يدويًا" : "Select File"}
                    </label>
                    <p className="text-[10px] text-slate-400">
                      {isAr ? "الصيغ المقبولة: JPG, PNG, PDF (بحد أقصى ١٠ ميجابايت)" : "Allowed: JPG, PNG, PDF (Max size 10MB)"}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* 5. Password Credentials */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs">٥</span>
                {isAr ? "كلمة المرور وحماية الحساب" : "Password Credentials"}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={THEME_CONFIG.classes.label}>{isAr ? "كلمة المرور *" : "Password *"}</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`${THEME_CONFIG.classes.input} pl-10`}
                    />
                  </div>
                </div>

                <div>
                  <label className={THEME_CONFIG.classes.label}>{isAr ? "تأكيد كلمة المرور *" : "Confirm Password *"}</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`${THEME_CONFIG.classes.input} pl-10`}
                    />
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className={`${THEME_CONFIG.classes.primaryButton} w-full py-3.5 mt-4 flex items-center justify-center gap-2`}
            >
              {submitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  <span>{isAr ? "جاري إنشاء الحساب والمستندات..." : "Creating account & uploading documents..."}</span>
                </>
              ) : (
                <span>{isAr ? "إنشاء حساب الطالب والدخول للمنصة" : "Register and Enter Platform"}</span>
              )}
            </button>
          </form>
        )}

        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => {
              setAuthMode(authMode === "login" ? "signup" : "login");
              setError(null);
            }}
            className="text-xs text-indigo-600 hover:text-indigo-700 font-bold transition-colors cursor-pointer"
            id="btn-switch-auth-mode"
          >
            {authMode === "login" ? t("switch_to_signup") : t("switch_to_login")}
          </button>
        </div>

        {authMode === "login" && (
          <div className="pt-4 border-t border-slate-100 text-[10px] text-slate-400 text-center leading-relaxed">
            🎓 <span className="font-semibold">Teacher Account seeded:</span> Login with{" "}
            <code className="bg-slate-50 px-1.5 py-0.5 rounded font-mono font-bold text-slate-600">
              teacher@platform.com
            </code>{" "}
            and password{" "}
            <code className="bg-slate-50 px-1.5 py-0.5 rounded font-mono font-bold text-slate-600">
              teacher123
            </code>.
          </div>
        )}
      </motion.div>
    </div>
  );
};
