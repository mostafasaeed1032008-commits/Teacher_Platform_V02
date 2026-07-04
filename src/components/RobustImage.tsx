import React, { useState } from "react";
import { User, Award, BookOpen, Star, Sparkles } from "lucide-react";

interface RobustImageProps {
  src?: string;
  alt: string;
  className?: string;
  fallbackType?: "student" | "teacher" | "course" | "avatar";
  aspectRatio?: string; // e.g. "aspect-[3/4]" or "aspect-square"
  initials?: string;
}

export const RobustImage: React.FC<RobustImageProps> = ({
  src,
  alt,
  className = "",
  fallbackType = "student",
  aspectRatio = "aspect-square",
  initials = "",
}) => {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  const handleImageError = () => {
    setError(true);
    setLoading(false);
  };

  const handleImageLoad = () => {
    setLoading(false);
  };

  // Get initials if not provided
  const getInitials = (name: string) => {
    if (!name) return "S";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const displayInitials = initials || getInitials(alt);

  // Vector / SVG / CSS gradient fallback when the image fails to load or is not provided
  const renderFallback = () => {
    if (fallbackType === "student") {
      return (
        <div className={`w-full h-full bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 flex flex-col items-center justify-center relative overflow-hidden px-4 text-center ${aspectRatio}`}>
          {/* Subtle background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-indigo-500/20 blur-2xl rounded-full"></div>
          
          {/* Laurel Wreath Graphic around Initials */}
          <div className="relative flex flex-col items-center justify-center z-10 space-y-2">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-amber-400/30 flex items-center justify-center bg-indigo-950/80 shadow-inner">
              {/* Star on top of circle */}
              <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 bg-amber-400 text-slate-950 rounded-full p-0.5 shadow-sm">
                <Star size={10} fill="currentColor" className="text-slate-950" />
              </div>
              <span className="text-xl sm:text-2xl font-black text-amber-300 font-mono tracking-wider">
                {displayInitials}
              </span>
            </div>
            
            {/* Laurel Ribbon */}
            <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 rounded-full mt-2">
              <Award size={10} className="text-amber-400" />
              <span className="text-[9px] font-black tracking-wider text-amber-300 uppercase">HERO</span>
            </div>
          </div>
        </div>
      );
    }

    if (fallbackType === "teacher") {
      return (
        <div className={`w-full h-full bg-gradient-to-tr from-slate-900 via-slate-950 to-indigo-950 flex flex-col items-center justify-center relative overflow-hidden px-6 text-center ${aspectRatio}`}>
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]"></div>
          <div className="relative z-10 flex flex-col items-center space-y-3">
            <div className="w-20 h-20 rounded-2xl border border-indigo-500/30 bg-slate-900/90 flex items-center justify-center shadow-lg">
              <span className="text-3xl font-black text-indigo-400">🎓</span>
            </div>
            <div>
              <p className="text-sm font-black text-white font-display tracking-tight">{alt}</p>
              <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest mt-0.5">PLATFORM LECTURER</p>
            </div>
          </div>
        </div>
      );
    }

    if (fallbackType === "course") {
      return (
        <div className={`w-full h-full bg-gradient-to-br from-slate-800 to-indigo-950 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden ${aspectRatio}`}>
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-indigo-600/10 rounded-full blur-2xl"></div>
          <div className="relative z-10 flex flex-col items-center space-y-2">
            <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center">
              <BookOpen size={24} />
            </div>
            <p className="text-xs font-bold text-slate-200 line-clamp-2 max-w-[160px]">{alt}</p>
          </div>
        </div>
      );
    }

    // Default Avatar (Circular)
    return (
      <div className={`w-full h-full bg-slate-100 border border-slate-200/60 flex items-center justify-center text-slate-500 font-bold ${aspectRatio}`}>
        <span className="text-sm tracking-tight">{displayInitials}</span>
      </div>
    );
  };

  return (
    <div className={`relative overflow-hidden w-full ${aspectRatio} ${className}`}>
      {/* Loading Shimmer */}
      {loading && !error && (
        <div className="absolute inset-0 bg-slate-200 animate-pulse flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Render the image if source is valid and no error occurred */}
      {src && !error ? (
        <img
          src={src}
          alt={alt}
          onError={handleImageError}
          onLoad={handleImageLoad}
          className={`w-full h-full object-cover transition-all duration-500 ${loading ? "opacity-0 scale-95" : "opacity-100 scale-100"}`}
          referrerPolicy="no-referrer"
        />
      ) : (
        renderFallback()
      )}
    </div>
  );
};
