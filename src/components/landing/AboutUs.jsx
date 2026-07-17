import { Link } from 'react-router-dom';
import { ArrowRight, Users, CheckCircle, Flame, Building, ShieldCheck, Sparkles } from 'lucide-react';
import useScrollReveal from '../../utils/useScrollReveal';

export default function AboutUs() {
  const [revealRef, isRevealed] = useScrollReveal();

  const stats = [
    { icon: Users, label: 'Active Tenants', count: '10,000+', accent: 'text-brand-primary' },
    { icon: CheckCircle, label: 'Audited Listings', count: '4,800+', accent: 'text-brand-accent' },
    { icon: Flame, label: 'Successful Matches', count: '99.2%', accent: 'text-brand-gold' },
    { icon: Building, label: 'Metro Cities', count: '15+', accent: 'text-rose-400' },
  ];

  const highlights = [
    'Verified listing screening',
    'Direct owner-tenant trust flow',
    'Premium city coverage',
  ];

  return (
    <section
      id="about"
      ref={revealRef}
      className={`relative overflow-hidden bg-slate-950 py-16 sm:py-20 lg:py-24 transition-all duration-1000 ${
        isRevealed ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
      }`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.16),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(6,182,212,0.12),transparent_40%)]" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-primary/5 blur-[130px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
          <div className="space-y-6 text-left">
            <span className="inline-flex items-center rounded-full border border-brand-accent/20 bg-brand-accent/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.28em] text-brand-accent">
              About Our Mission
            </span>

            <div className="space-y-4">
              <h2 className="max-w-2xl text-3xl font-extrabold leading-tight text-white sm:text-4xl lg:text-5xl">
                We’re redefining how students and professionals discover homes.
              </h2>

              <p className="max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                Finding a PG should never feel like a maze of fake listings, hidden brokerage pressure, or unclear terms.
                PGinfo.online is built to connect verified homes with genuine tenants through a direct and transparent experience.
              </p>

              <p className="max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
                Every listing is validated through visual inspection, safety screening, and owner trust checks so tenants can move faster with confidence.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {highlights.map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-slate-200"
                >
                  <Sparkles size={12} className="text-brand-accent" />
                  {item}
                </span>
              ))}
            </div>

            <div className="pt-2">
              <Link
                to="/careers"
                className="group inline-flex items-center gap-2 rounded-full border border-brand-accent/30 bg-brand-accent/10 px-4 py-2.5 text-sm font-semibold text-brand-accent transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand-accent hover:text-slate-950"
              >
                Join our growing team
                <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {stats.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={index}
                  className="group rounded-[24px] border border-white/10 bg-white/5 p-5 shadow-[0_20px_55px_rgba(15,23,42,0.28)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand-primary/30"
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-white/5 ${item.accent} transition-transform duration-300 group-hover:scale-110`}>
                      <Icon size={20} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">{item.count}</div>
                      <div className="mt-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">{item.label}</div>
                    </div>
                  </div>
                </div>
              );
            })}

            <div className="sm:col-span-2 rounded-[24px] border border-brand-accent/20 bg-gradient-to-br from-brand-accent/10 to-brand-primary/10 p-5 shadow-[0_20px_55px_rgba(15,23,42,0.28)]">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/5 text-brand-accent">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Trusted by modern renters</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    Premium occupancy matching, stronger owner confidence, and faster decision-making for every move.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
