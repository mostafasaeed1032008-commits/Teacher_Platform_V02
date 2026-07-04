import React, { useState, useEffect } from "react";
import { getPlatformLanguage, getPlatformDirection, t } from "../locales";
import { THEME_CONFIG, getBrandName } from "../theme.config";
import { getHomepageContent, HomepageContent } from "../homepage.config";
import { AchieverCard } from "../components/AchieverCard";
import { RobustImage } from "../components/RobustImage";
import { 
  Video, 
  HelpCircle, 
  FileText, 
  TrendingUp, 
  Award, 
  Wallet, 
  ChevronRight, 
  Menu, 
  X, 
  Facebook, 
  Youtube, 
  Instagram, 
  Send, 
  Phone, 
  BookOpen, 
  ArrowRight,
  ShieldAlert,
  Clock,
  Sparkles
} from "lucide-react";
import { motion } from "motion/react";

interface LandingPageProps {
  onLogin: () => void;
  onRegister: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLogin, onRegister }) => {
  const lang = getPlatformLanguage() as "en" | "ar";
  const dir = getPlatformDirection();
  const [content, setContent] = useState<HomepageContent>(getHomepageContent());
  const [courses, setCourses] = useState<any[]>([]);
  const [coursesLoading, setCoursesLoading] = useState<boolean>(true);
  const [achievers, setAchievers] = useState<any[]>([]);
  
  // Mobile Nav State
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Modal states for legal content
  const [activeModal, setActiveModal] = useState<"terms" | "privacy" | "refund" | null>(null);

  useEffect(() => {
    // Fetch public courses for real point prices
    fetch("/api/courses/public")
      .then((res) => {
        if (!res.ok) throw new Error("Could not fetch public courses");
        return res.json();
      })
      .then((data) => {
        setCourses(data);
      })
      .catch((err) => console.error(err))
      .finally(() => setCoursesLoading(false));

    // Fetch dynamic top achievers
    fetch("/api/students/achievers")
      .then((res) => {
        if (!res.ok) throw new Error("Could not fetch achievers");
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setAchievers(data);
        } else {
          setAchievers(content.achievers);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch achievers:", err);
        setAchievers(content.achievers);
      });
  }, [content]);

  // Map icon strings to Lucide components
  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case "Video": return <Video className="w-6 h-6" />;
      case "HelpCircle": return <HelpCircle className="w-6 h-6" />;
      case "FileText": return <FileText className="w-6 h-6" />;
      case "TrendingUp": return <TrendingUp className="w-6 h-6" />;
      case "Award": return <Award className="w-6 h-6" />;
      case "Wallet": return <Wallet className="w-6 h-6" />;
      default: return <BookOpen className="w-6 h-6" />;
    }
  };

  const currentAuthorityText = lang === "ar" ? content.authority_statement_ar : content.authority_statement_en;
  const currentBioText = lang === "ar" ? content.bio_ar : content.bio_en;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans" dir={dir}>
      {/* 1. TOP NAVIGATION */}
      <nav className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{THEME_CONFIG.logoSymbol}</span>
              <span className="font-display font-black text-lg sm:text-xl text-slate-900 tracking-tight">
                {getBrandName()}
              </span>
            </div>

            {/* Desktop Action Buttons (Exactly TWO) */}
            <div className="hidden md:flex items-center gap-4">
              <button 
                onClick={onLogin}
                className="text-xs sm:text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors px-4 py-2 hover:bg-slate-50 rounded-xl cursor-pointer"
              >
                {t("login")}
              </button>
              <button 
                onClick={onRegister}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-sm text-xs sm:text-sm cursor-pointer"
              >
                {lang === "ar" ? "اشترك الآن / تسجيل" : "Register / Subscribe"}
              </button>
            </div>

            {/* Mobile Menu Icon */}
            <div className="flex md:hidden">
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-slate-500 hover:text-slate-800 p-2 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-100 px-4 pt-2 pb-4 space-y-2">
            <button 
              onClick={() => { setMobileMenuOpen(false); onLogin(); }}
              className="w-full text-center py-2.5 font-bold text-slate-700 hover:bg-slate-50 rounded-xl text-sm block cursor-pointer"
            >
              {t("login")}
            </button>
            <button 
              onClick={() => { setMobileMenuOpen(false); onRegister(); }}
              className="w-full text-center py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm block cursor-pointer"
            >
              {lang === "ar" ? "اشترك الآن / تسجيل" : "Register / Subscribe"}
            </button>
          </div>
        )}
      </nav>

      {/* 2. HERO SECTION */}
      <section className="relative overflow-hidden py-12 md:py-20 lg:py-24 bg-gradient-to-b from-indigo-50/40 via-white to-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Text Column */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-1.5 bg-indigo-50 border border-indigo-100/60 px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase text-indigo-700 tracking-wider">
              <Sparkles size={12} className="text-indigo-600 animate-pulse" />
              <span>{lang === "ar" ? "أفضل منصة تعليمية متخصصة" : "Premier Branded Learning Hub"}</span>
            </div>
            
            <h1 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-slate-900 tracking-tight leading-[1.15] lg:leading-[1.12]">
              {currentAuthorityText}
            </h1>
            
            <p className="text-sm sm:text-base text-slate-500 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium">
              {lang === "ar" 
                ? "انضم الآن إلى مئات الطلاب المتفوقين واستمتع بمحاضرات تفاعلية، واختبارات دورية تصحح بالذكاء الاصطناعي، ومتابعة دقيقة لمستواك العلمي من هاتفك." 
                : "Join hundreds of high-achieving students. Gain instant access to premium curriculum, timed auto-graded quizzes, custom summaries, and robust progress analytics."}
            </p>

            <div className="pt-4 flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
              <button 
                onClick={onRegister}
                className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition-all shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] text-xs sm:text-sm uppercase tracking-wider cursor-pointer"
              >
                {lang === "ar" ? "ابدأ رحلة التفوق الآن 🚀" : "Get Started Now 🚀"}
              </button>
              <a 
                href="#demo-video"
                className="px-8 py-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold rounded-2xl transition-all shadow-xs text-xs sm:text-sm text-center cursor-pointer"
              >
                {lang === "ar" ? "شاهد فيديو تعريفي 📺" : "Watch Demo Video 📺"}
              </a>
            </div>
          </div>

          {/* Right Image/Banner Column */}
          <div className="lg:col-span-5 relative flex justify-center">
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-teal-500/10 blur-3xl -z-10 rounded-full scale-90"></div>
            <div className="w-full max-w-md aspect-[3/4] bg-slate-100 rounded-[32px] overflow-hidden shadow-xl border-4 border-white transform hover:rotate-1 transition-transform duration-500">
              <RobustImage
                src={content.teacher_image_url}
                alt="Teacher Portrait"
                fallbackType="teacher"
                aspectRatio="aspect-[3/4]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 3. ABOUT SECTION */}
      <section className="py-12 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Biography Image Block */}
            <div className="order-2 lg:order-1 flex justify-center">
              <div className="relative w-full max-w-md aspect-video sm:aspect-square bg-slate-50 rounded-[28px] overflow-hidden shadow-md border border-slate-100">
                <RobustImage
                  src={content.bio_image_url}
                  alt="Teacher Working/Teaching"
                  fallbackType="teacher"
                  aspectRatio="aspect-square"
                />
              </div>
            </div>

            {/* Biography Content Block */}
            <div className="order-1 lg:order-2 space-y-6">
              <span className="text-[10px] uppercase font-bold text-indigo-600 tracking-widest block">
                {lang === "ar" ? "نبذة عن المحاضر" : "ABOUT YOUR INSTRUCTOR"}
              </span>
              <h2 className="font-display font-black text-2xl sm:text-3xl text-slate-900 tracking-tight">
                {lang === "ar" ? "طريقك نحو فهم عميق ومجموع متميز" : "Expert Instruction Focused on Real Cognitive Growth"}
              </h2>
              <p className="text-slate-600 leading-relaxed text-sm sm:text-base font-medium">
                {currentBioText}
              </p>
              <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-4 text-xs font-semibold">
                <div className="space-y-1.5">
                  <span className="text-indigo-600 text-lg font-black block">12+</span>
                  <span className="text-slate-400 block">{lang === "ar" ? "سنوات الخبرة" : "Years Experience"}</span>
                </div>
                <div className="space-y-1.5">
                  <span className="text-indigo-600 text-lg font-black block">10,000+</span>
                  <span className="text-slate-400 block">{lang === "ar" ? "طالب متفوق" : "Successful Alumni"}</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. TOP ACHIEVERS WALL */}
      {achievers && achievers.length > 0 && (
        <section className="py-16 md:py-24 bg-slate-50/50 border-y border-slate-100" id="top-achievers-section">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-3 mb-16">
              <span className="text-xs uppercase font-bold text-indigo-600 tracking-widest bg-indigo-50 px-3 py-1 rounded-full inline-block">
                {lang === "ar" ? "لوحة شرف الأبطال" : "Top Achievers"}
              </span>
              <h2 className="font-display font-black text-3xl sm:text-4xl text-slate-900 tracking-tight">
                {lang === "ar" ? "لوحة شرف المتفوقين والترتيب" : "Our Top Achievers Wall"}
              </h2>
              <p className="text-slate-500 max-w-xl mx-auto text-sm">
                {lang === "ar" 
                  ? "طلابنا المتفوقون الحاصلون على أعلى الدرجات والترتيب الأول في اختباراتنا الدورية" 
                  : "Celebrating the dedication, high marks, and perfect scores of our leading students."}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 sm:gap-8 justify-center">
              {achievers.map((achiever, idx) => (
                <AchieverCard
                  key={achiever.id}
                  id={achiever.id}
                  name={achiever.name}
                  result_line={achiever.result_line}
                  photo_url={achiever.photo_url}
                  index={idx}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 5. FEATURES GRID (EXACTLY 6 CARDS) */}
      <section className="py-12 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-2 mb-12">
            <span className="text-[10px] uppercase font-bold text-indigo-600 tracking-widest block">
              {lang === "ar" ? "مميزات المنصة الفائقة" : "WHY OUR PLATFORM"}
            </span>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-slate-900 tracking-tight">
              {lang === "ar" ? "بيئة تعليمية متكاملة مصممة لنجاحك" : "A Unified Digital Ecosystem Engineered for Success"}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {content.features.map((feature, idx) => (
              <div key={idx} className="bg-slate-50/50 hover:bg-white border border-slate-100 hover:border-slate-200 p-6 rounded-2xl shadow-xs transition-all hover:shadow-md hover:-translate-y-0.5 duration-300 space-y-4">
                <div className="w-12 h-12 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center shadow-xs transition-colors">
                  {getIconComponent(feature.icon)}
                </div>
                <div className="space-y-1.5">
                  <h3 className="font-bold text-slate-800 text-sm sm:text-base tracking-tight">{feature.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. PRICING / PACKAGES SECTION */}
      <section className="py-12 md:py-20 bg-slate-50/60 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-2 mb-12">
            <span className="text-[10px] uppercase font-bold text-indigo-600 tracking-widest block">
              {lang === "ar" ? "باقات الاشتراك والمحاضرات" : "AVAILABLE PACKAGES & COURSES"}
            </span>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-slate-900 tracking-tight">
              {lang === "ar" ? "استثمر في مستقبلك العلمي بأسعار مناسبة" : "Unlock High-Quality Curriculum & Learning Material"}
            </h2>
          </div>

          {coursesLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : courses.length === 0 ? (
            <div className="bg-white border border-slate-200 text-center p-8 rounded-2xl max-w-md mx-auto">
              <p className="text-slate-500 font-medium text-xs">
                {lang === "ar" ? "لا توجد كورسات أو باقات متاحة حالياً." : "No courses or packages are published yet."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.map((course) => {
                const approximateEgp = Math.round(course.price_points * content.points_to_egp_rate);
                
                return (
                  <div key={course.id} className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
                    
                    {/* Cover image if available */}
                    {course.cover_image_url && (
                      <div className="aspect-video w-full bg-slate-100 relative">
                        <RobustImage
                          src={course.cover_image_url}
                          alt={course.title}
                          fallbackType="course"
                          aspectRatio="aspect-video"
                        />
                      </div>
                    )}

                    <div className="p-6 space-y-5 flex-1 flex flex-col justify-between">
                      <div className="space-y-3">
                        <h3 className="font-display font-bold text-slate-800 text-sm sm:text-base leading-snug">{course.title}</h3>
                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed font-medium">{course.description}</p>
                        
                        {/* Course stats */}
                        <div className="flex items-center gap-4 text-[10px] font-bold text-indigo-600 uppercase tracking-wider bg-slate-50 p-2.5 rounded-xl">
                          <span>📚 {course.lessons_count} {lang === "ar" ? "محاضرة" : "Lessons"}</span>
                          <span>📝 {course.quizzes_count} {lang === "ar" ? "اختبار" : "Exercises"}</span>
                        </div>
                      </div>

                      <div className="space-y-4 pt-4 border-t border-slate-100">
                        {/* Pricing details in points & EGP */}
                        <div className="flex items-baseline justify-between">
                          <div className="space-y-0.5">
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                              {lang === "ar" ? "سعر الكورس بالنقاط" : "Price in Points"}
                            </span>
                            <span className="font-black text-2xl text-slate-900">{course.price_points} </span>
                            <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">{lang === "ar" ? "نقطة" : "Pts"}</span>
                          </div>

                          {content.points_to_egp_rate > 0 && (
                            <div className="text-right">
                              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">
                                {lang === "ar" ? "يعادل تقريباً" : "Approx. Reference"}
                              </span>
                              <span className="font-bold text-slate-700 text-sm">{approximateEgp} EGP</span>
                            </div>
                          )}
                        </div>

                        <button 
                          onClick={onRegister}
                          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-sm text-xs uppercase tracking-wider cursor-pointer"
                        >
                          {lang === "ar" ? "اشترك وافتح الكورس" : "Subscribe & Unlock"}
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* 7. DEMO VIDEO SECTION */}
      <section id="demo-video" className="py-12 md:py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-2">
            <span className="text-[10px] uppercase font-bold text-indigo-600 tracking-widest block">
              {lang === "ar" ? "فيديو تعريفي مجاني" : "FREE DEMO LECTURE"}
            </span>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-slate-900 tracking-tight">
              {lang === "ar" ? "شاهد أسلوب الشرح والتفاعل الرائع" : "Experience Our Advanced Instruction Method"}
            </h2>
          </div>

          <div className="bg-slate-950 rounded-3xl overflow-hidden aspect-video shadow-xl border border-slate-800">
            <iframe
              src={`https://www.youtube.com/embed/${content.demo_video_id}`}
              title="Platform Demo Video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full border-0"
            ></iframe>
          </div>
        </div>
      </section>

      {/* 8. FOOTER & SUPPORT CONTACT */}
      <footer className="bg-slate-900 text-slate-400 pt-16 pb-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-12 gap-8 pb-12 border-b border-slate-800">
          
          {/* Column 1: App Info */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-2 text-white">
              <span className="text-2xl">{THEME_CONFIG.logoSymbol}</span>
              <span className="font-display font-black text-lg sm:text-xl tracking-tight">
                {getBrandName()}
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed font-semibold max-w-sm">
              {lang === "ar" 
                ? "منصة تعليمية مخصصة ومصممة لمساعدة طلاب الثانوية العامة على التفوق في المناهج الدراسية وحصد أعلى الدرجات عبر الشرح التفاعلي والتقييم الذكي."
                : "Personalized branded platform built exclusively to help students master High-School curriculum via interactive lectures and AI-graded mock examinations."}
            </p>
            {/* Social Links Row (Render only if filled) */}
            <div className="flex items-center gap-3 pt-2">
              {content.facebook_url && (
                <a href={content.facebook_url} target="_blank" rel="noreferrer" className="w-9 h-9 rounded-xl bg-slate-800 text-slate-300 hover:bg-indigo-600 hover:text-white flex items-center justify-center transition-all cursor-pointer">
                  <Facebook size={16} />
                </a>
              )}
              {content.youtube_url && (
                <a href={content.youtube_url} target="_blank" rel="noreferrer" className="w-9 h-9 rounded-xl bg-slate-800 text-slate-300 hover:bg-rose-600 hover:text-white flex items-center justify-center transition-all cursor-pointer">
                  <Youtube size={16} />
                </a>
              )}
              {content.instagram_url && (
                <a href={content.instagram_url} target="_blank" rel="noreferrer" className="w-9 h-9 rounded-xl bg-slate-800 text-slate-300 hover:bg-pink-600 hover:text-white flex items-center justify-center transition-all cursor-pointer">
                  <Instagram size={16} />
                </a>
              )}
              {content.tiktok_url && (
                <a href={content.tiktok_url} target="_blank" rel="noreferrer" className="w-9 h-9 rounded-xl bg-slate-800 text-slate-300 hover:bg-black hover:text-white flex items-center justify-center transition-all cursor-pointer">
                  <span className="text-xs font-black">TikTok</span>
                </a>
              )}
              {content.telegram_url && (
                <a href={content.telegram_url} target="_blank" rel="noreferrer" className="w-9 h-9 rounded-xl bg-slate-800 text-slate-300 hover:bg-sky-600 hover:text-white flex items-center justify-center transition-all cursor-pointer">
                  <Send size={16} />
                </a>
              )}
            </div>
          </div>

          {/* Column 2: Legal Pages List */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="font-bold text-white text-xs uppercase tracking-widest">
              {lang === "ar" ? "الصفحات القانونية" : "LEGAL & POLICIES"}
            </h4>
            <div className="flex flex-col gap-2.5 text-xs font-semibold">
              <button 
                onClick={() => setActiveModal("terms")} 
                className="text-left text-slate-400 hover:text-white transition-colors cursor-pointer block"
              >
                {lang === "ar" ? "شروط الاستخدام والأمان" : "Terms & Safety Regulations"}
              </button>
              <button 
                onClick={() => setActiveModal("privacy")} 
                className="text-left text-slate-400 hover:text-white transition-colors cursor-pointer block"
              >
                {lang === "ar" ? "سياسة الخصوصية والبيانات" : "Privacy Policy & Telemetry"}
              </button>
              <button 
                onClick={() => setActiveModal("refund")} 
                className="text-left text-slate-400 hover:text-white transition-colors cursor-pointer block"
              >
                {lang === "ar" ? "سياسة الاسترجاع والشحن" : "Refund & Purchase Policy"}
              </button>
            </div>
          </div>

          {/* Column 3: Contact & Support */}
          <div className="md:col-span-4 space-y-4">
            <h4 className="font-bold text-white text-xs uppercase tracking-widest">
              {lang === "ar" ? "الدعم والمساعدة" : "SUBSCRIBER SUPPORT"}
            </h4>
            <div className="space-y-3 text-xs leading-relaxed font-semibold">
              <p className="text-slate-500">
                {lang === "ar" ? "لأي مشاكل تتعلق بالدفع، شحن المحفظة أو تفعيل الأكواد، تواصل فوراً:" : "For payment validation, points issues, or activation, contact subscriber support:"}
              </p>
              <div className="bg-slate-800/40 border border-slate-800/80 p-3 rounded-xl space-y-1.5 text-slate-300">
                <p className="flex items-center gap-1.5 font-mono text-[11px]">
                  <Phone size={13} className="text-indigo-400" />
                  <span>{lang === "ar" ? "فودافون كاش" : "Vodafone Cash"}: {content.points_to_egp_rate > 0 ? localStorage.getItem("platform_vodafone") || "01012345678" : ""}</span>
                </p>
                <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider block">
                  {lang === "ar" ? "دعم عمليات شحن النقاط" : "SUPPORT REF: POINTS CHARGING"}
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Powered by & Brand Credit Line */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
          <span>&copy; {new Date().getFullYear()} {getBrandName()}. All Rights Reserved.</span>
          <span>Powered by Integrated Teacher Platform</span>
        </div>
      </footer>

      {/* 9. LEGAL POPUP MODAL SCREEN */}
      {activeModal && (() => {
        let title = "";
        let bodyText = "";
        if (activeModal === "terms") {
          title = lang === "ar" ? "شروط الاستخدام والأمان" : "Terms & Safety Regulations";
          bodyText = lang === "ar" ? content.terms_text_ar : content.terms_text_en;
        } else if (activeModal === "privacy") {
          title = lang === "ar" ? "سياسة الخصوصية والبيانات" : "Privacy Policy & Telemetry";
          bodyText = lang === "ar" ? content.privacy_text_ar : content.privacy_text_en;
        } else {
          title = lang === "ar" ? "سياسة الاسترجاع والشحن" : "Refund & Purchase Policy";
          bodyText = lang === "ar" ? content.refund_text_ar : content.refund_text_en;
        }

        return (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-100"
            >
              <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                <h3 className="font-display font-bold text-slate-800 text-sm sm:text-base">{title}</h3>
                <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-100 rounded-xl cursor-pointer">
                  <X size={16} />
                </button>
              </div>
              <p className="text-slate-500 text-xs leading-relaxed font-semibold whitespace-pre-line p-1">
                {bodyText}
              </p>
              <div className="flex justify-end pt-2">
                <button 
                  onClick={() => setActiveModal(null)} 
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  {lang === "ar" ? "فهمت وموافق" : "I Understand"}
                </button>
              </div>
            </motion.div>
          </div>
        );
      })()}

    </div>
  );
};
