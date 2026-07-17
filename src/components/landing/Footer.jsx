import { Link } from 'react-router-dom';
import { Building2, ArrowUp, Mail } from 'lucide-react';

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-slate-950 text-slate-400">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.18),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.15),transparent_38%)]" />

      <button
        onClick={scrollToTop}
        className="absolute right-8 -top-6 flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/25 transition-transform duration-300 hover:scale-110"
        aria-label="Scroll to top"
      >
        <ArrowUp size={20} />
      </button>

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-14 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-5">
          <div className="space-y-5 md:col-span-2">
            <Link to="/" className="group flex items-center gap-3 text-white">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400">
                <Building2 size={20} />
              </div>
              <span className="text-xl font-bold tracking-tight">
                PGinfo<span className="text-cyan-400">.online</span>
              </span>
            </Link>
            <p className="max-w-sm text-sm leading-7 text-slate-300">
              Discover, visit, and move into premium verified PG accommodations. No broker commissions, no hidden agendas.
              Connecting property owners and tenants directly with refined dashboards and community-first experiences.
            </p>
            <div className="flex gap-3">
              <a href="#" className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-white transition-colors hover:bg-white/10" aria-label="Twitter">𝕏</a>
              <a href="#" className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-white transition-colors hover:bg-white/10" aria-label="LinkedIn">in</a>
              <a href="#" className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-white transition-colors hover:bg-white/10" aria-label="Facebook">f</a>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-white">Product</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#features" className="transition-colors hover:text-white">Key Features</a></li>
              <li><a href="#services" className="transition-colors hover:text-white">Portal Services</a></li>
              <li><a href="#why-us" className="transition-colors hover:text-white">Why Choose Us</a></li>
              <li><Link to="/login" className="transition-colors hover:text-white">Sign In Portal</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-white">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/resources" className="border-b border-transparent transition-colors hover:border-white hover:text-white">Articles & Guides</Link></li>
              <li><Link to="/help" className="border-b border-transparent transition-colors hover:border-white hover:text-white">Help Center / FAQs</Link></li>
              <li><Link to="/careers" className="border-b border-transparent transition-colors hover:border-white hover:text-white">Careers</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-white">Newsletter</h4>
            <p className="text-xs leading-6 text-slate-300">Stay updated with fresh properties and tenant guides.</p>
            <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="your@email.com"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-blue-400 focus:outline-none"
              />
              <button className="flex items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 px-3 py-2 text-white transition-colors hover:brightness-110">
                <Mail size={16} />
              </button>
            </form>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-6 text-xs md:flex-row">
          <p>© {new Date().getFullYear()} PGinfo.online. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="/terms" className="transition-colors hover:text-white">Terms & Conditions</Link>
            <Link to="/privacy" className="transition-colors hover:text-white">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
