import { useEffect, useState } from 'react';
import Navbar from '../../components/landing/Navbar';
import Footer from '../../components/landing/Footer';
import useSmoothScroll from '../../utils/useSmoothScroll';
import { HelpCircle, ChevronDown, ChevronUp, Search, MessageSquare } from 'lucide-react';

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-white/10 rounded-2xl bg-brand-dark-soft/20 overflow-hidden transition-all duration-200">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-5 flex items-center justify-between text-left font-bold text-white text-base sm:text-lg focus:outline-none hover:bg-white/2 cursor-pointer"
      >
        <span>{question}</span>
        <span className="text-brand-accent ml-4 shrink-0">
          {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </span>
      </button>
      
      <div className={`transition-all duration-300 ease-in-out ${
        isOpen ? 'max-h-[500px] border-t border-white/5 opacity-100 p-6' : 'max-h-0 opacity-0 overflow-hidden'
      }`}>
        <p className="text-sm sm:text-base text-gray-300 leading-relaxed">{answer}</p>
      </div>
    </div>
  );
};

export default function HelpCenter() {
  useSmoothScroll(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  const faqs = [
    {
      q: "What does it mean for a PG listing to be verified?",
      a: "A verified listing carries a physical audit certificate. Our operations team physically visits the PG accommodation to audit its parameters, such as rent accuracy, room square footage, hygiene levels, fire exits, WiFi connectivity, and meals quality. This ensures 100% truthfulness."
    },
    {
      q: "Is there any hidden brokerage commission?",
      a: "None at all. PGinfo.online is a direct-to-owner marketplace. We do not participate in negotiations or charge transaction percentages. Owners list directly, and tenants contact them directly using the mobile app, ensuring a transparent brokerage-free transition."
    },
    {
      q: "How do I schedule an in-person visit?",
      a: "Download the PGinfo.online mobile app, browse properties, and select any listing. Click the 'Schedule Visit' button, select your preferred date/time slot, and submit. The owner receives an instant dashboard alert to verify and confirm your slot."
    },
    {
      q: "How can I register as a PG Owner?",
      a: "Click 'Sign In' at the top right, navigate to the signup portal, and select the 'Owner' role. Once registered, you will unlock a portal dashboard to list properties, check lead details, log visits, and configure local tenant meetups."
    },
    {
      q: "What are Smart Meetup events?",
      a: "Smart meetups are local social gatherings organized by PG owners (approved by platform administrators). They allow potential and existing tenants to mingle, assess roommate compatibility, view the property's social culture, and finalize agreements in a friendly setting."
    },
    {
      q: "How do I request edit updates for my active listing?",
      a: "Owners can modify property details in their web dashboard. If the listing is already verified, the update request is routed to an admin moderation queue to verify accuracy. It gets published immediately upon approval without resetting audit badges."
    }
  ];

  const filtered = faqs.filter(f => 
    f.q.toLowerCase().includes(search.toLowerCase()) || 
    f.a.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-brand-dark min-h-screen text-white select-none">
      <Navbar />

      {/* Hero Header */}
      <section className="pt-32 pb-16 relative overflow-hidden bg-brand-dark-deep border-b border-white/5">
        <div className="absolute inset-0 bg-radial-gradient from-brand-primary/10 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-5xl mx-auto px-6 text-center space-y-6 relative z-10">
          <span className="text-xs font-bold text-brand-accent uppercase tracking-widest bg-brand-accent/10 px-4 py-1.5 rounded-full border border-brand-accent/20">
            Support Desk
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
            How Can We Assist You?
          </h1>
          <p className="text-base sm:text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Find immediate answers regarding PG audits, lead configurations, user roles, and platform procedures.
          </p>

          {/* Search bar */}
          <div className="max-w-md mx-auto relative pt-4">
            <input 
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search help topics, FAQs..."
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-brand-primary placeholder:text-gray-500"
            />
            <Search className="absolute left-4 top-[29px] text-gray-500" size={18} />
          </div>
        </div>
      </section>

      {/* FAQs Panel */}
      <section className="py-20 max-w-4xl mx-auto px-6 space-y-8">
        {filtered.length > 0 ? (
          filtered.map((item, idx) => (
            <FAQItem key={idx} question={item.q} answer={item.a} />
          ))
        ) : (
          <div className="py-16 text-center text-gray-500">
            <HelpCircle size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-sm font-semibold">No questions match your query. Try searching general terms like 'broker' or 'verification'.</p>
          </div>
        )}
      </section>

      {/* Call Support CTA */}
      <section className="py-20 bg-brand-dark-deep border-t border-white/5 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-brand-accent/10 border border-brand-accent/20 flex items-center justify-center text-brand-accent mx-auto">
          <MessageSquare size={26} />
        </div>
        <h2 className="text-2xl font-bold text-white">Still Have Unanswered Questions?</h2>
        <p className="text-sm text-gray-400 max-w-md mx-auto">
          Our friendly support agents are ready to assist. Shoot an email or get in touch on the hotlines.
        </p>
        <a href="#contact" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-white font-bold text-sm shadow-lg transition-transform hover:-translate-y-0.5">
          Contact Customer Service
        </a>
      </section>

      <Footer />
    </div>
  );
}
