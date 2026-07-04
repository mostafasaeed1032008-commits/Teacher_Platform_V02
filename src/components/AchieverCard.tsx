import React from "react";
import { motion } from "motion/react";
import { Award, Star, Sparkles, TrendingUp } from "lucide-react";
import { RobustImage } from "./RobustImage";
import { getPlatformLanguage } from "../locales";

interface AchieverCardProps {
  id: string;
  name: string;
  result_line: string;
  photo_url: string;
  index: number;
}

export const AchieverCard: React.FC<AchieverCardProps> = ({
  id,
  name,
  result_line,
  photo_url,
  index,
}) => {
  const lang = getPlatformLanguage() as "en" | "ar";
  const isRtl = lang === "ar";

  // Determine if it's top rank based on the index or results string
  const isFirstTier = index === 0 || result_line.includes("الأول") || result_line.toLowerCase().includes("rank #1") || result_line.includes("99");
  const isSecondTier = index === 1 || result_line.includes("الثاني") || result_line.toLowerCase().includes("rank #2") || result_line.includes("98");

  // Parse percentage or scores from results string to show on the golden tag
  const matchPercentage = result_line.match(/(\d+(\.\d+)?%)/);
  const percentageStr = matchPercentage ? matchPercentage[0] : "";

  // Filter out the percentage from the main text to prevent redundancy if needed
  const cleanedResultLine = result_line;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.08, 0.4) }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="group relative flex flex-col bg-white border border-slate-100 hover:border-amber-300 rounded-2xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300"
    >
      {/* Golden Highlight Border for top achievers */}
      {isFirstTier && (
        <div className="absolute inset-0 border-2 border-amber-400/70 rounded-2xl pointer-events-none z-20 animate-pulse-slow"></div>
      )}
      {!isFirstTier && isSecondTier && (
        <div className="absolute inset-0 border border-slate-300/60 rounded-2xl pointer-events-none z-20"></div>
      )}

      {/* Ribbon/Badge overlay on the top corner */}
      <div className={`absolute top-3 z-10 ${isRtl ? "left-3" : "right-3"} flex flex-col items-end gap-1.5`}>
        {/* Tier Medal */}
        <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full shadow-md text-[10px] font-black uppercase tracking-wider backdrop-blur-md ${
          isFirstTier 
            ? "bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 border border-yellow-300" 
            : isSecondTier 
              ? "bg-slate-200 text-slate-800 border border-slate-300" 
              : "bg-indigo-600 text-white border border-indigo-500"
        }`}>
          {isFirstTier ? (
            <Sparkles size={11} className="animate-spin-slow text-slate-950" />
          ) : (
            <Award size={11} />
          )}
          <span>{isFirstTier ? (isRtl ? "نخبة" : "TOP") : (isRtl ? "بطل" : "HERO")}</span>
        </div>

        {/* Score Percentage Tag */}
        {percentageStr && (
          <div className="bg-slate-900/80 backdrop-blur-xs border border-slate-700/50 text-amber-300 px-2 py-0.5 rounded-lg text-[10px] font-bold font-mono shadow-xs">
            {percentageStr}
          </div>
        )}
      </div>

      {/* Professional Portrait Image Frame (3:4 ratio) */}
      <div className="relative aspect-[3/4] overflow-hidden bg-slate-950 shrink-0">
        <RobustImage
          src={photo_url}
          alt={name}
          fallbackType="student"
          aspectRatio="aspect-[3/4]"
          className="transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Dark bottom vignette overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/10 to-transparent opacity-60"></div>

        {/* Floating laurel icon at the bottom of the photo */}
        <div className={`absolute bottom-3 ${isRtl ? "left-3" : "right-3"} text-amber-400 z-10`}>
          {isFirstTier && (
            <div className="bg-amber-400/10 backdrop-blur-xs p-1.5 rounded-full border border-amber-400/20">
              <Star size={14} fill="currentColor" />
            </div>
          )}
        </div>
      </div>

      {/* Caption Content Block with clean typography & consistent spacing */}
      <div className="p-4 flex-1 flex flex-col justify-between text-center bg-white space-y-2">
        <div className="space-y-1">
          <h4 className="font-display font-extrabold text-slate-800 group-hover:text-indigo-600 transition-colors text-sm sm:text-base leading-tight line-clamp-1">
            {name}
          </h4>
          <p className="text-[11px] leading-relaxed font-semibold text-slate-500 min-h-[32px] line-clamp-2" dir={isRtl ? "rtl" : "ltr"}>
            {cleanedResultLine}
          </p>
        </div>

        {/* Decorative Divider */}
        <div className="w-8 h-0.5 bg-slate-100 mx-auto rounded-full group-hover:w-16 transition-all duration-300"></div>

        {/* Secondary support indicator badge */}
        <div className="flex items-center justify-center gap-1 text-[9px] font-black uppercase tracking-wider text-indigo-500">
          <TrendingUp size={10} />
          <span>{isRtl ? "عضو لوحة الشرف" : "Honor Roll Member"}</span>
        </div>
      </div>
    </motion.div>
  );
};
