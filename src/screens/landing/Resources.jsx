import { useEffect, useState } from 'react';
import Navbar from '../../components/landing/Navbar';
import Footer from '../../components/landing/Footer';
import useSmoothScroll from '../../utils/useSmoothScroll';
import { BookOpen, Search, Clock, ArrowRight, User } from 'lucide-react';

export default function Resources() {
  useSmoothScroll(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  const articles = [
    {
      category: "tenants",
      readTime: "5 min read",
      title: "The Ultimate PG Moving Checklist: Every Essential Audited",
      desc: "Ensure you don't miss key amenities during inspection. Learn how to verify electricity backups, water logging, and standard safety ratings.",
      author: "Aditi Sharma",
      date: "June 15, 2026"
    },
    {
      category: "landlords",
      readTime: "8 min read",
      title: "PG Compliance Guidelines & Fire Safety Stencils",
      desc: "A exhaustive walk-through of the documentation, fire certificates, and occupancy certificates required to legally operate paying guest stays.",
      author: "Rohan Verma",
      date: "May 28, 2026"
    },
    {
      category: "legal",
      readTime: "6 min read",
      title: "Understanding Local Rent Control Laws & Security Cap",
      desc: "Learn about state limits on security deposits, refund timescales, and standard notification constraints for lease termination.",
      author: "Siddharth Sen",
      date: "April 12, 2026"
    },
    {
      category: "tenants",
      readTime: "4 min read",
      title: "Roommate Vetting: 5 Questions to Ask at Social Mixer Meetups",
      desc: "Make sure you align on sleeping schedules, cleanliness thresholds, and sharing styles before signing a double occupancy lease.",
      author: "Priya Nair",
      date: "March 05, 2026"
    },
    {
      category: "landlords",
      readTime: "7 min read",
      title: "How to Optimize Your PG Listings to Double Leads",
      desc: "Learn how listing physical audit flags, uploading high-quality photos, and responding immediately to visit requests maximizes occupancy.",
      author: "Amit Patel",
      date: "Feb 18, 2026"
    }
  ];

  const filtered = articles.filter(a => {
    const matchesSearch = a.title.toLowerCase().includes(search.toLowerCase()) || a.desc.toLowerCase().includes(search.toLowerCase());
    const matchesTab = activeTab === 'all' || a.category === activeTab;
    return matchesSearch && matchesTab;
  });

  return (
    <div className="bg-brand-dark min-h-screen text-white select-none">
      <Navbar />

      {/* Hero Header */}
      <section className="pt-32 pb-16 relative overflow-hidden bg-brand-dark-deep border-b border-white/5">
        <div className="absolute inset-0 bg-radial-gradient from-brand-primary/10 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-5xl mx-auto px-6 text-center space-y-6 relative z-10">
          <span className="text-xs font-bold text-brand-accent uppercase tracking-widest bg-brand-accent/10 px-4 py-1.5 rounded-full border border-brand-accent/20">
            Resource Hub
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
            Knowledge and Guides for <br />
            <span className="bg-gradient-to-r from-brand-primary to-brand-accent bg-clip-text text-transparent">Better PG Stays</span>
          </h1>
          <p className="text-base sm:text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Stay up to date with compliance directives, roommate selection frameworks, and tips on managing digital PG portfolios.
          </p>

          {/* Search bar */}
          <div className="max-w-md mx-auto relative pt-4">
            <input 
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search guides, articles..."
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-brand-primary placeholder:text-gray-500"
            />
            <Search className="absolute left-4 top-[29px] text-gray-500" size={18} />
          </div>
        </div>
      </section>

      {/* Articles & Filtering */}
      <section className="py-16 max-w-7xl mx-auto px-6 space-y-12">
        {/* Tabs */}
        <div className="flex gap-2 border-b border-white/10 pb-4 overflow-x-auto text-sm">
          {['all', 'tenants', 'landlords', 'legal'].map((t) => (
            <button 
              key={t}
              onClick={() => setActiveTab(t)}
              className={`px-4 py-2 rounded-lg font-bold capitalize transition-colors cursor-pointer shrink-0 ${
                activeTab === t 
                  ? 'bg-brand-primary text-white shadow-md' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Grid List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.length > 0 ? (
            filtered.map((a, i) => (
              <div 
                key={i} 
                className="p-8 rounded-2xl bg-brand-dark-soft/30 border border-white/5 flex flex-col justify-between gap-6 hover:border-brand-accent/20 transition-all hover:shadow-xl hover:translate-y-[-2px] text-left"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span className="px-2.5 py-0.5 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-accent uppercase font-bold tracking-wider">
                      {a.category}
                    </span>
                    <span className="flex items-center gap-1"><Clock size={12} /> {a.readTime}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white leading-snug hover:text-brand-accent transition-colors">
                    {a.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                    {a.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-gray-300">
                    <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-brand-accent">
                      <User size={12} />
                    </div>
                    <span>{a.author}</span>
                  </div>
                  <button className="text-brand-accent hover:text-white transition-colors flex items-center gap-1 text-xs font-bold">
                    Read Post <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-16 text-center text-gray-500">
              <BookOpen size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-sm font-semibold">No resource articles match your search parameters.</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
