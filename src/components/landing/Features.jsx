import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, MessageSquareCode, CalendarDays, Zap, ArrowRight } from 'lucide-react';
import useScrollReveal from '../../utils/useScrollReveal';

const features = [
  {
    icon: ShieldCheck,
    title: 'Physical Auditing & Badges',
    description:
      'Our team physically visits accommodations to verify rent, cleanliness, safety exits, WiFi, and meals quality. Verified listings carry a gold audit badge.',
    color: 'text-blue-600 bg-blue-50 ring-1 ring-blue-100',
    hoverText: 'group-hover:text-blue-600',
  },
  {
    icon: MessageSquareCode,
    title: 'Direct Owner Interaction',
    description:
      'Cut out middlemen completely. Chat with owners in real-time, negotiate terms, and get everything in writing — no broker, no delay.',
    color: 'text-cyan-600 bg-cyan-50 ring-1 ring-cyan-100',
    hoverText: 'group-hover:text-cyan-600',
  },
  {
    icon: CalendarDays,
    title: 'Community Meetup System',
    description:
      'Owners organize social events for prospective and current tenants. Meet potential roommates before you sign anything.',
    color: 'text-violet-600 bg-violet-50 ring-1 ring-violet-100',
    hoverText: 'group-hover:text-violet-600',
  },
  {
    icon: Zap,
    title: 'Instant Lead Notifications',
    description:
      'Owners receive dashboard alerts and email notifications the moment a tenant expresses interest or schedules a visit.',
    color: 'text-amber-600 bg-amber-50 ring-1 ring-amber-100',
    hoverText: 'group-hover:text-amber-600',
  },
];

const FeatureCard = ({ icon: Icon, title, description, color, hoverText, index, isRevealed }) => (
  <div
    className={`group flex flex-col h-full bg-white rounded-[2rem] border border-slate-200/60 p-8 sm:p-10 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.08)] hover:border-slate-300 transition-all duration-500 hover:-translate-y-2 z-10 ${
      isRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
    }`}
    style={{ transitionDelay: `${index * 100}ms` }}
  >
    {/* Icon Container */}
    <div className={`w-14 h-14 mb-8 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-500 group-hover:scale-110 group-hover:shadow-sm ${color}`}>
      <Icon size={26} strokeWidth={1.75} />
    </div>
    
    {/* Text Content */}
    <div className="flex-grow flex flex-col text-left">
      <h3 className="font-bold text-slate-900 text-xl tracking-tight mb-4">
        {title}
      </h3>
      <p className="text-base text-slate-500 leading-relaxed font-medium mb-8">
        {description}
      </p>
    </div>
    
    {/* Footer Link */}
    <div className={`mt-auto flex items-center gap-2 text-sm font-bold text-slate-400 ${hoverText} transition-colors duration-300`}>
      <span>Learn more</span>
      <ArrowRight 
        size={18} 
        className="transform -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300 ease-out" 
      />
    </div>
  </div>
);

export default function Features() {
  const [revealRef, isRevealed] = useScrollReveal({ threshold: 0.15 });

  return (
    <section
      id="features"
      className="py-24 md:py-32 bg-[#F8FAFC] relative overflow-hidden"
    >
      <div className="max-w-[90rem] mx-auto px-6 lg:px-12 space-y-16 md:space-y-24 relative z-10">
        
        {/* Header Section (Perfectly Centered) */}
        <div 
          ref={revealRef}
          className={`flex flex-col items-center text-center space-y-6 transition-all duration-700 ease-out ${
            isRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <span className="inline-block py-1.5 px-4 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-widest shadow-sm">
            Platform Capabilities
          </span>
          
          {/* Using text-balance ensures the text wraps beautifully and symmetrically */}
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15] text-balance max-w-4xl">
            High-Performance Features Built for Direct Deals
          </h2>
          
          <p className="text-lg md:text-xl text-slate-500 leading-relaxed max-w-3xl font-medium text-balance">
            We provide premium tools that help tenants discover verified PGs and help owners grow their rental portfolio efficiently.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <FeatureCard 
              key={index} 
              {...feature} 
              index={index} 
              isRevealed={isRevealed} 
            />
          ))}
        </div>

        {/* CTA Footer */}
        <div 
          className={`flex justify-center pt-4 transition-all duration-700 delay-500 ease-out ${
            isRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <Link
            to="/features"
            className="group inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-slate-900 text-white font-bold text-base hover:bg-blue-600 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/20 w-full sm:w-auto"
          >
            View All Platform Features 
            <ArrowRight size={20} className="transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
        
      </div>
    </section>
  );
}