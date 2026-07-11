import { Link } from 'react-router-dom';
import { Building2, ArrowUp, Mail } from 'lucide-react';

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-brand-dark-deep border-t border-white/10 text-gray-400 relative">
      {/* Scroll to Top */}
      <button 
        onClick={scrollToTop}
        className="absolute right-8 -top-6 w-12 h-12 rounded-full bg-brand-primary hover:bg-brand-primary-hover text-white flex items-center justify-center shadow-lg transition-transform duration-300 hover:scale-110 cursor-pointer"
        aria-label="Scroll to top"
      >
        <ArrowUp size={20} />
      </button>

      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-6">
            <Link to="/" className="flex items-center gap-3 text-white group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-primary to-brand-accent flex items-center justify-center">
                <Building2 size={20} />
              </div>
              <span className="text-xl font-bold tracking-tight">
                PGinfo<span className="text-brand-accent">.online</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed max-w-sm">
              Discover, visit, and move into premium verified PG accommodations. No broker commissions, no hidden agendas. Connecting property owners and tenants directly, with custom dashboards and smart meetup communities.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition-colors" aria-label="Twitter">𝕏</a>
              <a href="#" className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition-colors" aria-label="LinkedIn">in</a>
              <a href="#" className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition-colors" aria-label="Facebook">f</a>
            </div>
          </div>

          {/* Directory Links */}
          <div className="space-y-4">
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider">Product</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#features" className="hover:text-white transition-colors">Key Features</a></li>
              <li><a href="#services" className="hover:text-white transition-colors">Portal Services</a></li>
              <li><a href="#why-us" className="hover:text-white transition-colors">Why Choose Us</a></li>
              <li><Link to="/login" className="hover:text-white transition-colors">Sign In Portal</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/resources" className="hover:text-white transition-colors border-b border-transparent hover:border-white">Articles & Guides</Link></li>
              <li><Link to="/help" className="hover:text-white transition-colors border-b border-transparent hover:border-white">Help Center / FAQs</Link></li>
              <li><Link to="/careers" className="hover:text-white transition-colors border-b border-transparent hover:border-white">Careers</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider">Newsletter</h4>
            <p className="text-xs leading-relaxed">Stay updated with fresh properties and tenant guides.</p>
            <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email" 
                placeholder="your@email.com" 
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-brand-primary placeholder:text-gray-500"
              />
              <button className="px-3 py-2 rounded-lg bg-brand-primary hover:bg-brand-primary-hover text-white flex items-center justify-center transition-colors">
                <Mail size={16} />
              </button>
            </form>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-white/5 mt-16 pt-8 flex flex-col md:flex-row items-center justify-between text-xs gap-4">
          <p>© {new Date().getFullYear()} PGinfo.online. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="/terms" className="hover:text-white transition-colors">Terms & Conditions</Link>
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
