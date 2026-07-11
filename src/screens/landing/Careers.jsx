import { useEffect } from 'react';
import Navbar from '../../components/landing/Navbar';
import Footer from '../../components/landing/Footer';
import useSmoothScroll from '../../utils/useSmoothScroll';
import { Briefcase, MapPin, Clock, ArrowRight, Heart, Globe, Award, Sparkles } from 'lucide-react';

export default function Careers() {
  useSmoothScroll(true);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  const perks = [
    { icon: Globe, title: "Remote-First Work", desc: "Work from anywhere in the country. We optimize for results, not face time." },
    { icon: Heart, title: "Comprehensive Health", desc: "Premium health insurance, mental wellness support, and annual fitness credits." },
    { icon: Award, title: "Career Progression", desc: "Personal development budgets, mentorship networks, and rapid growth tracks." },
    { icon: Sparkles, title: "Equity & Ownership", desc: "Competitive base packages coupled with meaningful stock options/equity." }
  ];

  const jobs = [
    { title: "Senior React Developer", dept: "Engineering", type: "Full-Time", loc: "Remote / Bangalore", desc: "Own the development of our premium landlord dashboard. Experience with Tailwind and React Router is highly desired." },
    { title: "Backend Systems Engineer", dept: "Engineering", type: "Full-Time", loc: "Bangalore", desc: "Optimize databases, secure auth flows, and write high-throughput routes using Node, Express, and Mongoose." },
    { title: "Community & Events Lead", dept: "Operations", type: "Part-Time", loc: "Pune", desc: "Coordinate local tenant mixer programs and meetups. Maintain host quality guidelines and PG verification schedules." },
    { title: "Marketing Strategy Head", dept: "Marketing", type: "Full-Time", loc: "Remote", desc: "Drive growth campaigns across universities. Scale organic search performance and coordinate social assets." }
  ];

  return (
    <div className="bg-brand-dark min-h-screen text-white select-none">
      <Navbar />
      
      {/* Hero Header */}
      <section className="pt-32 pb-16 relative overflow-hidden bg-brand-dark-deep border-b border-white/5">
        <div className="absolute inset-0 bg-radial-gradient from-brand-primary/10 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-5xl mx-auto px-6 text-center space-y-6 relative z-10">
          <span className="text-xs font-bold text-brand-accent uppercase tracking-widest bg-brand-accent/10 px-4 py-1.5 rounded-full border border-brand-accent/20">
            Work with Us
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
            Build the Future of <br />
            <span className="bg-gradient-to-r from-brand-primary to-brand-accent bg-clip-text text-transparent">Broker-Free Living</span>
          </h1>
          <p className="text-base sm:text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Join a remote-first team of developers, operators, and designers working to bring safety, trust, and community to paying guest accommodation discovery.
          </p>
        </div>
      </section>

      {/* Perks Grid */}
      <section className="py-20 max-w-7xl mx-auto px-6 space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Why You'll Love It Here</h2>
          <p className="text-sm text-gray-400 max-w-xl mx-auto">We provide the benefits and flexibility needed to do your absolute best work.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {perks.map((p, i) => {
            const Icon = p.icon;
            return (
              <div key={i} className="p-6 rounded-2xl bg-brand-dark-soft/30 border border-white/5 space-y-4 text-left hover:border-brand-primary/20 transition-all">
                <div className="w-12 h-12 rounded-xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-accent shadow-md">
                  <Icon size={22} />
                </div>
                <h3 className="font-bold text-white text-base">{p.title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{p.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Job Openings */}
      <section className="py-20 bg-brand-dark-deep border-t border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Current Open Opportunities</h2>
            <p className="text-sm text-gray-400 max-w-xl mx-auto">If you don't see a fit, write to us anyway at careers@pginfo.online.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            {jobs.map((j, i) => (
              <div key={i} className="p-8 rounded-2xl bg-brand-dark-soft/20 border border-white/5 hover:border-brand-accent/20 transition-all flex flex-col justify-between gap-6 hover:shadow-xl">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-xs font-semibold text-brand-accent">
                      {j.dept}
                    </span>
                    <div className="flex gap-4 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><MapPin size={12} /> {j.loc}</span>
                      <span className="flex items-center gap-1"><Clock size={12} /> {j.type}</span>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-white">{j.title}</h3>
                  <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">{j.desc}</p>
                </div>
                
                <a href="mailto:careers@pginfo.online" className="inline-flex items-center gap-2 text-xs font-bold text-brand-accent hover:text-white transition-colors">
                  Apply Now <ArrowRight size={14} />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer Info */}
      <section className="py-20 max-w-5xl mx-auto px-6 text-center space-y-6">
        <Briefcase size={40} className="mx-auto text-brand-primary" />
        <h2 className="text-2xl font-bold text-white">Join the Revolution</h2>
        <p className="text-sm text-gray-400 max-w-lg mx-auto">
          Send your CV along with a short statement highlighting why you'd like to join PGinfo.online. We evaluate applications on a rolling basis.
        </p>
        <a href="mailto:careers@pginfo.online" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-white font-bold text-sm shadow-lg">
          Email CV to careers@pginfo.online
        </a>
      </section>

      <Footer />
    </div>
  );
}
