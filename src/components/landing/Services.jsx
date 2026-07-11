import { Link } from 'react-router-dom';
import { Smartphone, LayoutGrid, CheckCircle, ArrowRight } from 'lucide-react';
import useScrollReveal from '../../utils/useScrollReveal';

export default function Services() {
  const [revealRef, isRevealed] = useScrollReveal();

  const tenantServices = [
    "No middleman brokerage fees",
    "Verified listings with physical audit labels",
    "Interactive map integrations for local search",
    "Direct visit booking and chat logs with owners",
    "Participate in local community meetups"
  ];

  const ownerServices = [
    "Modular property listing and photos panel",
    "Real-time lead alerts via mail and SMS",
    "Physical audit request dashboard",
    "Organize and register community meetup events",
    "Detailed inquiry analytics and conversion reports"
  ];

  return (
    <section 
      id="services" 
      ref={revealRef}
      className={`py-24 bg-brand-dark-deep border-t border-b border-white/5 transition-all duration-1000 transform ${
        isRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 space-y-16">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <span className="text-xs font-bold text-brand-accent uppercase tracking-widest bg-brand-accent/10 px-4 py-1.5 rounded-full border border-brand-accent/20">
            Tailored Experiences
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Comprehensive Support Across All Platforms
          </h2>
          <p className="text-base text-gray-400 leading-relaxed">
            We provide custom interfaces optimized for both tenants searching for properties and owners managing their real estate operations.
          </p>
        </div>

        {/* Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Tenant App Support */}
          <div className="p-8 rounded-3xl bg-brand-dark-soft/30 border border-white/5 hover:border-brand-accent/20 transition-all duration-300 flex flex-col justify-between text-left relative overflow-hidden group shadow-xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-accent/5 rounded-full blur-2xl pointer-events-none group-hover:bg-brand-accent/10 transition-colors" />
            <div className="space-y-6">
              <div className="w-14 h-14 rounded-2xl bg-brand-accent/15 border border-brand-accent/20 flex items-center justify-center text-brand-accent shadow-md">
                <Smartphone size={24} />
              </div>
              <div className="space-y-2">
                <span className="text-xs font-bold text-brand-accent uppercase tracking-wider">Tenant Companion App</span>
                <h3 className="text-2xl font-extrabold text-white">Mobile Application Support</h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Discover clean spaces directly on the go. The PGinfo.online mobile app lets you search dynamically, chat with owners, request visual audits, and attend social mixers.
                </p>
              </div>
              
              <ul className="space-y-3 text-sm text-gray-300">
                {tenantServices.map((s, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle size={16} className="text-brand-accent shrink-0" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="pt-8">
              <a href="#connect" className="px-6 py-3.5 rounded-xl bg-brand-accent hover:bg-brand-accent/95 text-brand-dark font-bold text-sm inline-flex items-center gap-2 hover:shadow-lg hover:shadow-brand-accent/20 transition-all">
                Download Mobile App <ArrowRight size={16} />
              </a>
            </div>
          </div>

          {/* Owner Web Support */}
          <div className="p-8 rounded-3xl bg-brand-dark-soft/30 border border-white/5 hover:border-brand-primary/20 transition-all duration-300 flex flex-col justify-between text-left relative overflow-hidden group shadow-xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-full blur-2xl pointer-events-none group-hover:bg-brand-primary/10 transition-colors" />
            <div className="space-y-6">
              <div className="w-14 h-14 rounded-2xl bg-brand-primary/15 border border-brand-primary/20 flex items-center justify-center text-brand-primary shadow-md">
                <LayoutGrid size={24} />
              </div>
              <div className="space-y-2">
                <span className="text-xs font-bold text-brand-primary uppercase tracking-wider">Owner Portal</span>
                <h3 className="text-2xl font-extrabold text-white">Web Application Support</h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Manage inquiries and bookings effortlessly. The web dashboard provides properties list moderation, update request tools, visit requests logging, and meetup configuration.
                </p>
              </div>
              
              <ul className="space-y-3 text-sm text-gray-300">
                {ownerServices.map((s, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle size={16} className="text-brand-primary shrink-0" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="pt-8">
              <Link to="/login" className="px-6 py-3.5 rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-white font-bold text-sm inline-flex items-center gap-2 hover:shadow-lg hover:shadow-brand-primary/20 transition-all">
                Open Web Portal <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
