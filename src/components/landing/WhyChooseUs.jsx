import { Check, X, ShieldAlert, Award } from 'lucide-react';
import useScrollReveal from '../../utils/useScrollReveal';

export default function WhyChooseUs() {
  const [revealRef, isRevealed] = useScrollReveal();

  const comparisons = [
    {
      feature: "Brokerage Commission",
      traditional: "1-month rent equivalent",
      traditionalOk: false,
      pginfo: "₹0 Commission (Direct Owner)",
      pginfoOk: true
    },
    {
      feature: "Listing Verifications",
      traditional: "Self-uploaded, untested photos",
      traditionalOk: false,
      pginfo: "Physically audited & approved",
      pginfoOk: true
    },
    {
      feature: "Communication Speed",
      traditional: "Middleman lag / phone tag",
      traditionalOk: false,
      pginfo: "Real-time alerts & direct calls",
      pginfoOk: true
    },
    {
      feature: "Security Deposits",
      traditional: "3 to 6 months advance rent",
      traditionalOk: false,
      pginfo: "Capped at 1 to 2 months rent",
      pginfoOk: true
    },
    {
      feature: "Roommate Vetting",
      traditional: "No prior interaction possible",
      traditionalOk: false,
      pginfo: "Social mixers & smart meetups",
      pginfoOk: true
    }
  ];

  return (
    <section 
      id="why-us" 
      ref={revealRef}
      className={`py-24 bg-brand-dark transition-all duration-1000 transform ${
        isRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 space-y-16">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <span className="text-xs font-bold text-brand-accent uppercase tracking-widest bg-brand-accent/10 px-4 py-1.5 rounded-full border border-brand-accent/20">
            Market Comparison
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Why PGinfo.online is the Best Rental Solution
          </h2>
          <p className="text-base text-gray-400 leading-relaxed">
            Compare our verified direct platform features against standard renting systems and local listing sites.
          </p>
        </div>

        {/* Comparison Board */}
        <div className="rounded-3xl border border-white/10 bg-brand-dark-soft/20 backdrop-blur-md overflow-hidden shadow-2xl">
          {/* Table Header */}
          <div className="grid grid-cols-1 md:grid-cols-3 border-b border-white/10 bg-white/5 font-bold text-sm sm:text-base text-white p-5 text-left gap-4">
            <div>Market Feature</div>
            <div className="flex items-center gap-2 text-rose-400">
              <ShieldAlert size={18} /> Traditional Brokers / Sites
            </div>
            <div className="flex items-center gap-2 text-brand-accent">
              <Award size={18} /> PGinfo.online Marketplace
            </div>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-white/5 text-left">
            {comparisons.map((row, idx) => (
              <div key={idx} className="grid grid-cols-1 md:grid-cols-3 p-5 items-center gap-4 text-sm hover:bg-white/2">
                <div className="font-semibold text-white">{row.feature}</div>
                
                {/* Traditional */}
                <div className="flex items-center gap-2.5 text-gray-400">
                  {row.traditionalOk ? (
                    <Check size={16} className="text-emerald-500 shrink-0" />
                  ) : (
                    <X size={16} className="text-rose-500 shrink-0" />
                  )}
                  <span>{row.traditional}</span>
                </div>

                {/* PGinfo */}
                <div className="flex items-center gap-2.5 text-white font-medium">
                  {row.pginfoOk ? (
                    <Check size={16} className="text-brand-accent shrink-0" />
                  ) : (
                    <X size={16} className="text-rose-500 shrink-0" />
                  )}
                  <span>{row.pginfo}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
