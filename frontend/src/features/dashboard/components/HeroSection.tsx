type HeroSectionProps = {
  onAnalyzeClick: () => void;
};

export function HeroSection({ onAnalyzeClick }: HeroSectionProps) {
  return (
    <section className="bg-[#1B2433] border border-[#2E3A4E] rounded-2xl px-10 py-8 shadow-sm">
      <div className="max-w-5xl">

        {/* Welcome Badge */}
        <div className="inline-flex items-center rounded-full border border-[#2E3A4E] bg-[#111827] px-3 py-1 mb-4">
          <span className="text-sm font-medium text-[#6488C8]">
            👋 Welcome to DataSense AI
          </span>
        </div>

        {/* Heading */}
        <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-[#F8FAFC] leading-tight max-w-4xl">
          Enterprise Dataset Intelligence Platform
        </h1>

        {/* Subtitle */}
        <p className="mt-5 max-w-3xl text-base lg:text-lg leading-8 text-[#94A3B8]">
          Analyze datasets with AI-powered profiling, intelligent recommendations,
          baseline model training, explainable AI, and professional reports —
          all from a single unified platform.
        </p>

        {/* Buttons */}
        <div className="mt-8 flex flex-wrap gap-4">

          <button
            onClick={onAnalyzeClick}
            className="rounded-xl bg-[#5B7FFF] px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-[#6C8CFF] hover:scale-[1.02]"
          >
            Analyze Dataset
          </button>

          <button
            className="rounded-xl border border-[#374151] bg-[#111827] px-6 py-3 text-sm font-semibold text-[#E5E7EB] transition-all duration-200 hover:border-[#6488C8] hover:text-white"
          >
            Documentation
          </button>

        </div>

        {/* Trust Indicators */}
        <div className="mt-8 flex flex-wrap items-center gap-6 text-sm text-[#94A3B8]">

          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-[#5A9D7C]" />
            <span>CSV Support</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-[#5A9D7C]" />
            <span>Up to 100 MB</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-[#5A9D7C]" />
            <span>Secure Processing</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-[#5A9D7C]" />
            <span>AI Powered</span>
          </div>

        </div>

      </div>
    </section>
  );
}