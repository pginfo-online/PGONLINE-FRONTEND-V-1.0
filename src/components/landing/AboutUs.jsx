import { Link } from 'react-router-dom';
import { ArrowRight, Users, CheckCircle, Flame, Building } from 'lucide-react';
import useScrollReveal from '../../utils/useScrollReveal';

export default function AboutUs() {
  const [revealRef, isRevealed] = useScrollReveal();

  const stats = [
    { icon: Users, label: "Active Tenants", count: "10,000+", colorClass: "text-brand-primary" },
    { icon: CheckCircle, label: "Audited Listings", count: "4,800+", colorClass: "text-brand-accent" },
    { icon: Flame, label: "Successful Matches", count: "99.2%", colorClass: "text-brand-gold" },
    { icon: Building, label: "Metro Cities", count: "15+", colorClass: "text-rose-500" }
  ];

  return (
    <section 
      id="about" 
      ref={revealRef}
      className={`py-24 bg-brand-dark relative overflow-hidden transition-all duration-1000 transform ${
        isRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
      }`}
    >
      {/* Decorative Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-brand-primary/5 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left: Content */}
        <div className="space-y-6 text-left">
          <span className="text-xs font-bold text-brand-accent uppercase tracking-widest bg-brand-accent/10 px-4 py-1.5 rounded-full border border-brand-accent/20">
            About Our Mission
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
            We are Redefining how Students & Professionals Discover Homes
          </h2>
          <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
            Finding a PG shouldn't feel like navigating a maze of fake listings, high deposits, and brokerage fees. At PGinfo.online, we built a modern direct connection marketplace.
          </p>
          <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
            Every property listed on our web portal undergoes visual auditing, physical validation, and standard safety screenings. We bridge the gap between properties seeking premium occupants and professionals seeking high-quality stays.
          </p>
          
          <div className="pt-4">
            <Link to="/careers" className="inline-flex items-center gap-2 text-sm font-semibold text-brand-accent hover:text-white transition-colors group">
              Join our growing team <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Right: Stat blocks grid */}
        <div className="grid grid-cols-2 gap-6 relative">
          {stats.map((s, i) => {
            const Icon = s.icon;
            return (
              <div 
                key={i} 
                className="p-6 rounded-2xl bg-brand-dark-soft/40 border border-white/5 flex flex-col items-center justify-center text-center gap-4 hover:border-brand-primary/20 transition-all duration-300 group shadow-lg"
              >
                <div className={`p-3 rounded-xl bg-white/5 border border-white/10 ${s.colorClass} group-hover:scale-110 transition-transform duration-300`}>
                  <Icon size={22} />
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{s.count}</div>
                  <div className="text-xs text-gray-400 font-medium mt-1 uppercase tracking-wider">{s.label}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
