import { useNavigate } from "react-router-dom";
import { UploadCloud, BookOpen } from "lucide-react";

interface DashboardHeroProps {
  onUpload: () => void;
  uploadCard: React.ReactNode;
}

export function DashboardHero({ onUpload, uploadCard }: DashboardHeroProps) {
  const navigate = useNavigate();

  return (
    <section
      className="relative overflow-hidden mb-5"
      style={{
        background: "linear-gradient(135deg, #191A1D 0%, #1A1B1F 50%, #181920 100%)",
        border: "1px solid #28292E",
        borderRadius: "14px",
      }}
    >
      {/* ── Subtle ambient tones (very restrained) ── */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top-right: very faint purple warmth */}
        <div
          className="absolute -top-24 right-[-60px] h-[300px] w-[300px] rounded-full blur-[100px]"
          style={{ background: "radial-gradient(circle, rgba(124,92,252,0.07) 0%, transparent 70%)" }}
        />
        {/* Bottom-left: very faint indigo */}
        <div
          className="absolute bottom-[-60px] left-[-40px] h-[200px] w-[200px] rounded-full blur-[80px]"
          style={{ background: "radial-gradient(circle, rgba(80,70,255,0.04) 0%, transparent 70%)" }}
        />
      </div>

      {/* Decorative data analytics visualization */}
      <div className="absolute right-0 top-0 bottom-0 w-[35%] opacity-[0.15] pointer-events-none hidden lg:block overflow-hidden rounded-r-[14px]">
        <svg width="100%" height="100%" viewBox="0 0 400 200" fill="none" preserveAspectRatio="xMaxYMid slice">
          {/* Subtle grid */}
          <path d="M0 40h400 M0 80h400 M0 120h400 M0 160h400" stroke="#E8E9ED" strokeOpacity="0.06" strokeWidth="1" strokeDasharray="4 4" />
          <path d="M50 0v200 M125 0v200 M200 0v200 M275 0v200 M350 0v200" stroke="#E8E9ED" strokeOpacity="0.06" strokeWidth="1" strokeDasharray="4 4" />
          
          {/* Abstract area chart */}
          <path d="M-20 170 Q60 110 160 130 T310 70 T420 90 L420 220 L-20 220 Z" fill="url(#dataGradient)" />
          
          {/* Main trendline */}
          <path d="M-20 170 Q60 110 160 130 T310 70 T420 90" stroke="#7C5CFC" strokeOpacity="0.4" strokeWidth="2" />
          
          {/* Data points */}
          <circle cx="60" cy="138" r="4" fill="#7C5CFC" opacity="0.4" />
          <circle cx="160" cy="130" r="4.5" fill="#7C5CFC" opacity="0.6" />
          <circle cx="235" cy="98" r="4" fill="#7C5CFC" opacity="0.4" />
          <circle cx="310" cy="70" r="5.5" fill="#7C5CFC" opacity="0.8" />
          <circle cx="385" cy="83" r="4" fill="#7C5CFC" opacity="0.4" />

          {/* Bar-like indicators */}
          <rect x="140" y="150" width="8" height="50" fill="#E8E9ED" opacity="0.1" rx="2" />
          <rect x="152" y="165" width="8" height="35" fill="#E8E9ED" opacity="0.1" rx="2" />
          <rect x="290" y="110" width="8" height="90" fill="#7C5CFC" opacity="0.2" rx="2" />
          <rect x="302" y="140" width="8" height="60" fill="#E8E9ED" opacity="0.1" rx="2" />

          <defs>
            <linearGradient id="dataGradient" x1="0" y1="0" x2="0" y2="200" gradientUnits="userSpaceOnUse">
              <stop stopColor="#7C5CFC" stopOpacity="0.15" />
              <stop offset="1" stopColor="#7C5CFC" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* ── Content ── */}
      <div className="relative z-10 px-8 sm:px-10 pt-7 pb-6">

        {/* Row 1: Text left + Buttons right */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5">

          {/* LEFT: Greeting + Title + Subtitle */}
          <div className="flex flex-col">
            {/* Good Morning */}
            <p
              style={{
                fontSize: "16px",
                fontWeight: 500,
                color: "#9DA0A8",
                lineHeight: 1.4,
                marginBottom: "4px",
              }}
            >
              Good Morning, 👋
            </p>

            {/* DataSense AI */}
            <h1
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 800,
                fontSize: "clamp(38px, 4.5vw, 52px)",
                lineHeight: 1.05,
                letterSpacing: "-0.02em",
                color: "#E8E9ED",
                margin: "0",
                whiteSpace: "nowrap",
              }}
            >
              DataSense{" "}
              <span style={{ color: "#7C5CFC" }}>AI</span>
            </h1>

            {/* Subtitle */}
            <p
              style={{
                fontSize: "16px",
                color: "#9DA0A8",
                maxWidth: "540px",
                marginTop: "8px",
                lineHeight: 1.6,
              }}
            >
              Understand your dataset before building machine learning models.
            </p>
          </div>

          {/* RIGHT: Action buttons */}
          <div className="flex items-center gap-3 flex-shrink-0 sm:pt-2">
            {/* Primary */}
            <button
              onClick={onUpload}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                height: "44px",
                padding: "0 22px",
                fontSize: "14.5px",
                fontWeight: 600,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                background: "#7C5CFC",
                color: "#FFFFFF",
                border: "1px solid rgba(124,92,252,0.5)",
                borderRadius: "10px",
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "background 150ms ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "#6B4AEE";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "#7C5CFC";
              }}
            >
              <UploadCloud size={18} />
              Upload Dataset
            </button>

            {/* Secondary */}
            <button
              onClick={() => navigate("/profile")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                height: "44px",
                padding: "0 22px",
                fontSize: "14.5px",
                fontWeight: 600,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                background: "#25262A",
                color: "#E8E9ED",
                border: "1px solid #323338",
                borderRadius: "10px",
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "background 150ms ease, border-color 150ms ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "#2D2E33";
                (e.currentTarget as HTMLButtonElement).style.borderColor = "#454750";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "#25262A";
                (e.currentTarget as HTMLButtonElement).style.borderColor = "#323338";
              }}
            >
              <BookOpen size={18} />
              View Documentation
            </button>
          </div>
        </div>

        {/* Row 2: Upload card (only rendered when uploadCard is truthy) */}
        {uploadCard && (
          <div className="mt-5">
            {uploadCard}
          </div>
        )}
      </div>
    </section>
  );
}