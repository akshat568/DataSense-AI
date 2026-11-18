type HeroSectionProps = {
  onAnalyzeClick: () => void;
};

export function HeroSection({ onAnalyzeClick }: HeroSectionProps) {
  return (
    <section className="bg-white border border-[#E5E9E2] rounded-2xl px-8 py-7 shadow-[0_1px_3px_rgba(38,51,45,0.03)]">
      <div className="max-w-4xl">
        {/* Welcome Badge */}
        <div className="inline-flex items-center rounded-full border border-[#E5E9E2] bg-[#F1F5EF] px-3 py-1 mb-3">
          <span className="text-[12.5px] font-bold text-[#26332D]">
            👋 Welcome to DataSense AI
          </span>
        </div>

        {/* Heading */}
        <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-[#26332D] leading-tight">
          Dataset Intelligence &amp; Analytics Platform
        </h1>

        {/* Subtitle */}
        <p className="mt-3 text-[14.5px] leading-relaxed text-[#64736A]">
          Analyze datasets with AI-powered statistical profiling, intelligent preprocessing recommendations,
          baseline model evaluation, SHAP explainability, and automated reports.
        </p>

        {/* Buttons */}
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={onAnalyzeClick}
            className="btn btn-primary"
            style={{ height: "42px", paddingInline: "20px" }}
          >
            Analyze Dataset
          </button>
          <button
            className="btn btn-secondary"
            style={{ height: "42px", paddingInline: "18px" }}
          >
            Documentation
          </button>
        </div>

        {/* Trust Indicators */}
        <div className="mt-6 flex flex-wrap items-center gap-5 text-[12.5px] text-[#64736A] pt-4 border-t border-[#EEF2EB]">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-[#2A7E4F]" />
            <span>CSV Support</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-[#2A7E4F]" />
            <span>Up to 100 MB</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-[#2A7E4F]" />
            <span>Memory Safe</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-[#B8F34A]" />
            <span>SHAP Explainability</span>
          </div>
        </div>
      </div>
    </section>
  );
}
