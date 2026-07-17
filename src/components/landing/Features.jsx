import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  MessageSquareCode,
  CalendarDays,
  Zap,
  ArrowRight,
} from 'lucide-react';
import useScrollReveal from '../../utils/useScrollReveal';

const features = [
  {
    icon: ShieldCheck,
    title: 'Physical Auditing & Badges',
    description:
      'Every listed PG is physically inspected by our verification team before an official badge is assigned.',
    color: 'bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600 border border-blue-200',
    hover: 'group-hover:text-blue-600',
  },
  {
    icon: MessageSquareCode,
    title: 'Direct Owner Interaction',
    description:
      'Negotiate rent, clarify facilities, and finalize agreements without broker friction or hidden commissions.',
    color: 'bg-gradient-to-br from-cyan-50 to-cyan-100 text-cyan-600 border border-cyan-200',
    hover: 'group-hover:text-cyan-600',
  },
  {
    icon: CalendarDays,
    title: 'Community Meetup System',
    description:
      'Preview the environment, meet fellow tenants, and build confidence before making the final move.',
    color: 'bg-gradient-to-br from-violet-50 to-violet-100 text-violet-600 border border-violet-200',
    hover: 'group-hover:text-violet-600',
  },
  {
    icon: Zap,
    title: 'Instant Lead Notifications',
    description:
      'Owners instantly receive alerts whenever a prospective tenant expresses interest or books a visit.',
    color: 'bg-gradient-to-br from-amber-50 to-orange-100 text-amber-600 border border-amber-200',
    hover: 'group-hover:text-amber-600',
  },
];

const FeatureCard = ({ icon: Icon, title, description, color, hover, index, isRevealed }) => {
  return (
    <motion.article
      initial={false}
      animate={isRevealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      whileHover={{ y: -6 }}
      className="group relative flex h-full min-h-[250px] flex-col overflow-hidden rounded-[24px] border border-slate-200 bg-white/95 p-5 shadow-[0_12px_32px_rgba(15,23,42,0.06)] backdrop-blur sm:p-6"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.12),transparent_45%)] opacity-80" />
      <div className="absolute left-0 top-0 h-1 w-full origin-left scale-x-0 bg-gradient-to-r from-blue-600 via-cyan-500 to-orange-500 transition-transform duration-500 group-hover:scale-x-100" />

      <div className="relative z-10 flex items-start gap-3">
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${color} sm:h-14 sm:w-14`}>
          <Icon size={22} strokeWidth={1.8} />
        </div>
        <div className="max-w-[calc(100%-3.5rem)]">
          <h3 className="text-base font-bold leading-tight text-slate-900 sm:text-lg">{title}</h3>
        </div>
      </div>

      <p className="relative z-10 mt-4 text-sm leading-6 text-slate-600 sm:leading-7">{description}</p>

      <div className="relative z-10 mt-5 h-px bg-slate-200" />

      <div className={`relative z-10 mt-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 ${hover}`}>
        <span>Learn more</span>
        <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
      </div>
    </motion.article>
  );
};

export default function Features() {
  const [revealRef, isRevealed] = useScrollReveal({ threshold: 0.15 });

  return (
    <section id="features" className="relative overflow-hidden bg-slate-50 py-16 sm:py-20 lg:py-24">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-blue-100/50 blur-3xl" />
        <div className="absolute top-1/3 -right-32 h-96 w-96 rounded-full bg-cyan-100/40 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-orange-100/40 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f020_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f020_1px,transparent_1px)] bg-[size:70px_70px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-5 lg:px-8">
        <div
          ref={revealRef}
          className={`mx-auto max-w-4xl text-center transition-all duration-700 ${
            isRevealed ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}
        >
          <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.26em] text-blue-700 shadow-sm">
            Platform Capabilities
          </span>
          <h2 className="mt-6 text-4xl font-black leading-tight tracking-tight text-slate-900 sm:text-5xl">
            High-Performance Features
            <br />
            Built for Direct Deals
          </h2>
          <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-slate-600 lg:text-lg">
            Discover verified PGs, connect directly with trusted owners, participate in community meetups,
            and manage your accommodation journey through a modern platform designed for transparency, trust,
            and speed.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} index={index} isRevealed={isRevealed} />
          ))}
        </div>

        <div
          className={`mt-12 flex justify-center transition-all duration-700 delay-300 ${
            isRevealed ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}
        >
          <Link
            to="/features"
            className="group inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/30"
          >
            View All Platform Features
            <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}