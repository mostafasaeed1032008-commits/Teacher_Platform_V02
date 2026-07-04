export interface Achiever {
  id: string;
  name: string;
  result_line: string;
  photo_url: string;
}

export interface FeatureCard {
  icon: string;
  title: string;
  description: string;
}

export interface HomepageContent {
  authority_statement_en: string;
  authority_statement_ar: string;
  teacher_image_url: string;
  bio_en: string;
  bio_ar: string;
  bio_image_url: string;
  demo_video_id: string;
  points_to_egp_rate: number; // e.g. 1 point = 1.2 EGP or 1 EGP
  facebook_url: string;
  youtube_url: string;
  instagram_url: string;
  tiktok_url: string;
  telegram_url: string;
  terms_text_en: string;
  terms_text_ar: string;
  privacy_text_en: string;
  privacy_text_ar: string;
  refund_text_en: string;
  refund_text_ar: string;
  achievers: Achiever[];
  features: FeatureCard[];
}

const DEFAULT_ACHIEVERS: Achiever[] = [
  {
    id: "1",
    name: "Omar Ahmed",
    result_line: "99.4% - Rank #3 National Secondary Stage",
    photo_url: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200"
  },
  {
    id: "2",
    name: "Yasmine Aly",
    result_line: "98.8% - Rank #12 Giza Governorate",
    photo_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200"
  }
];

const DEFAULT_FEATURES: FeatureCard[] = [
  {
    icon: "Video",
    title: "Recorded HD Lessons",
    description: "Stream crystal-clear lessons anytime with resuming capabilities."
  },
  {
    icon: "HelpCircle",
    title: "Hardened MCQ Quizzes",
    description: "Test your comprehension with timing constraints & automatic grading."
  },
  {
    icon: "FileText",
    title: "Printable Summaries",
    description: "Download exhaustive reference sheets, homework files, and notes."
  },
  {
    icon: "TrendingUp",
    title: "Intelligent Performance",
    description: "Follow your historical quiz marks and course completion percentages."
  },
  {
    icon: "Award",
    title: "Branded Certificates",
    description: "Earn custom verification certificates once courses hit 100% completion."
  },
  {
    icon: "Wallet",
    title: "Points Wallet",
    description: "Top up your wallet easily via Vodafone Cash and unlock premium chapters."
  }
];

const DEFAULT_FEATURES_AR: FeatureCard[] = [
  {
    icon: "Video",
    title: "دروس مسجلة بجودة عالية",
    description: "شاهد المحاضرات في أي وقت مع خاصية استكمال المشاهدة من حيث توقفت."
  },
  {
    icon: "HelpCircle",
    title: "اختبارات تفاعلية ذكية",
    description: "قيّم مستواك من خلال اختبارات محددة بوقت وتصحيح تلقائي فوري."
  },
  {
    icon: "FileText",
    title: "ملخصات وملفات قابلة للطباعة",
    description: "حمّل أوراق الشرح، الواجبات المنزلية، والكتب الخارجية لكل محاضرة."
  },
  {
    icon: "TrendingUp",
    title: "تحليلات الأداء المتقدمة",
    description: "تابع درجاتك السابقة ونسب إنجازك للمناهج التعليمية أولاً بأول."
  },
  {
    icon: "Award",
    title: "شهادات إتمام معتمدة",
    description: "احصل على شهادات تكريم مخصصة فور إتمامك للمحاضرات بنسبة 100%."
  },
  {
    icon: "Wallet",
    title: "محفظة النقاط الرقمية",
    description: "اشحن رصيد محفظتك بسهولة عبر فودافون كاش لفتح الأبواب والدروس."
  }
];

export const getHomepageContent = (): HomepageContent => {
  const data = localStorage.getItem("homepage_content");
  if (!data) {
    return {
      authority_statement_en: "Mastering Secondary-Stage Physics with Scientific Rigor",
      authority_statement_ar: "التميز في الفيزياء للمرحلة الثانوية بأسلوب علمي مبسط",
      teacher_image_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=600",
      bio_en: "With over 12 years of specialized experience in high school curriculum instruction, we focus on deep cognitive comprehension rather than rote memorization. Our students consistently rank among the top national percentiles.",
      bio_ar: "خبرة أكثر من 12 عاماً في تدريس مناهج الثانوية العامة. نركز على الفهم العميق والتحليل الرياضي بعيداً عن الحفظ والتلقين. طلابنا يحققون دائماً أعلى الدرجات على مستوى الجمهورية.",
      bio_image_url: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=600",
      demo_video_id: "dQw4w9WgXcQ", // Default fallback YouTube video ID
      points_to_egp_rate: 1, // 1 point = 1 EGP
      facebook_url: "https://facebook.com",
      youtube_url: "https://youtube.com",
      instagram_url: "https://instagram.com",
      tiktok_url: "https://tiktok.com",
      telegram_url: "https://telegram.org",
      terms_text_en: "All curriculum resources, videos, and worksheets are owned and protected. Sharing or distributing student access is strictly prohibited and leads to immediate suspension.",
      terms_text_ar: "جميع المواد العلمية والفيديوهات والملخصات ملكية فكرية محمية للمنصة. يمنع منعاً باتاً مشاركة حساب الطالب أو توزيعه، ويعرض الحساب للإيقاف الفوري.",
      privacy_text_en: "We store only name, email, and progress telemetry to evaluate and showcase performance levels safely.",
      privacy_text_ar: "نحن نحتفظ فقط بالاسم والبريد الإلكتروني وإحصائيات تقدم الطالب لتحليل وتقييم الأداء العلمي بشكل آمن.",
      refund_text_en: "Points top-ups are manually validated. Unlocked courses cannot be refunded or exchanged.",
      refund_text_ar: "عمليات شحن النقاط تتم مراجعتها يدوياً بدقة. لا يمكن استرجاع النقاط بعد تفعيل الدروس والمناهج.",
      achievers: DEFAULT_ACHIEVERS,
      features: DEFAULT_FEATURES
    };
  }

  try {
    const parsed = JSON.parse(data);
    return {
      ...parsed,
      achievers: parsed.achievers || DEFAULT_ACHIEVERS,
      features: parsed.features || DEFAULT_FEATURES
    };
  } catch (e) {
    console.error("Failed to parse homepage content", e);
    // return defaults
    return {
      authority_statement_en: "Mastering Secondary-Stage Physics with Scientific Rigor",
      authority_statement_ar: "التميز في الفيزياء للمرحلة الثانوية بأسلوب علمي مبسط",
      teacher_image_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=600",
      bio_en: "With over 12 years of specialized experience in high school curriculum instruction, we focus on deep cognitive comprehension rather than rote memorization. Our students consistently rank among the top national percentiles.",
      bio_ar: "خبرة أكثر من 12 عاماً في تدريس مناهج الثانوية العامة. نركز على الفهم العميق والتحليل الرياضي بعيداً عن الحفظ والتلقين. طلابنا يحققون دائماً أعلى الدرجات على مستوى الجمهورية.",
      bio_image_url: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=600",
      demo_video_id: "dQw4w9WgXcQ",
      points_to_egp_rate: 1,
      facebook_url: "https://facebook.com",
      youtube_url: "https://youtube.com",
      instagram_url: "https://instagram.com",
      tiktok_url: "https://tiktok.com",
      telegram_url: "https://telegram.org",
      terms_text_en: "All curriculum resources, videos, and worksheets are owned and protected. Sharing or distributing student access is strictly prohibited and leads to immediate suspension.",
      terms_text_ar: "جميع المواد العلمية والفيديوهات والملخصات ملكية فكرية محمية للمنصة. يمنع منعاً باتاً مشاركة حساب الطالب أو توزيعه، ويعرض الحساب للإيقاف الفوري.",
      privacy_text_en: "We store only name, email, and progress telemetry to evaluate and showcase performance levels safely.",
      privacy_text_ar: "نحن نحتفظ فقط بالاسم والبريد الإلكتروني وإحصائيات تقدم الطالب لتحليل وتقييم الأداء العلمي بشكل آمن.",
      refund_text_en: "Points top-ups are manually validated. Unlocked courses cannot be refunded or exchanged.",
      refund_text_ar: "عمليات شحن النقاط تتم مراجعتها يدوياً بدقة. لا يمكن استرجاع النقاط بعد تفعيل الدروس والمناهج.",
      achievers: DEFAULT_ACHIEVERS,
      features: DEFAULT_FEATURES
    };
  }
};

export const saveHomepageContent = (content: HomepageContent) => {
  localStorage.setItem("homepage_content", JSON.stringify(content));
};
