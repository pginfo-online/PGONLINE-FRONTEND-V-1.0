import { useEffect } from 'react';
import Navbar from '../../components/landing/Navbar';
import Footer from '../../components/landing/Footer';
import useSmoothScroll from '../../utils/useSmoothScroll';
import { ShieldCheck, Eye } from 'lucide-react';

export default function Privacy() {
  useSmoothScroll(true);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  return (
    <div className="bg-brand-dark min-h-screen text-white select-none">
      <Navbar />

      {/* Header */}
      <section className="pt-32 pb-12 bg-brand-dark-deep border-b border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-radial-gradient from-brand-primary/10 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-4xl mx-auto px-6 text-left space-y-4 relative z-10">
          <div className="flex items-center gap-3 text-brand-accent">
            <Eye size={24} />
            <span className="text-xs font-bold uppercase tracking-wider">Privacy Guidelines</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Privacy Policy</h1>
          <p className="text-xs text-gray-400">Last updated: June 26, 2026</p>
        </div>
      </section>

      {/* Main Text Content */}
      <section className="py-16 max-w-4xl mx-auto px-6 text-left space-y-10 text-gray-300 leading-relaxed text-sm sm:text-base">
        
        {/* Verification Check */}
        <div className="p-5 rounded-2xl bg-brand-accent/5 border border-brand-accent/20 flex gap-4 items-start">
          <ShieldCheck size={24} className="text-brand-accent shrink-0 mt-0.5" />
          <p className="text-xs sm:text-sm text-gray-300">
            We value your security and privacy. We implement high-grade encryption and secure access layers to guarantee that your profile data and compliance uploads remain safe.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white border-l-4 border-brand-accent pl-3">1. Information Collection</h2>
          <p>
            When utilizing PGinfo.online or our mobile app, we collect specific categories of data:
          </p>
          <ul className="list-disc list-inside space-y-2 pl-2">
            <li><strong>Identity & Account Details:</strong> Name, contact numbers, email, password hashes, and profile roles (owner, tenant).</li>
            <li><strong>KYC Documents:</strong> Stated ID credentials uploaded for verification checks when scheduling direct visits.</li>
            <li><strong>Location Metrics:</strong> Approximated GPS locations to search PGs nearby (only with explicit system prompt permission).</li>
            <li><strong>Listing Records:</strong> Images, address parameters, rent values, and amenities checklists uploaded by property owners.</li>
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white border-l-4 border-brand-accent pl-3">2. Data Utilization</h2>
          <p>
            Your details are processed to optimize platform services: to display relevant properties nearby, connect owners and tenants directly upon approval, verify listing authenticity, alert owners of inquiries, and manage social meetup logs.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white border-l-4 border-brand-accent pl-3">3. Sharing & Disclosures</h2>
          <p>
            We enforce strict sharing limitations. Phone numbers and email coordinates are shared between tenants and owners *only* when a visit request is approved or when contact details are explicitly requested by a registered user. We never sell profile databases to third-party marketing companies.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white border-l-4 border-brand-accent pl-3">4. Security Measures</h2>
          <p>
            Database connections are secured using Mongoose SSL encryptions, JWT authorization headers, and rate limit protections to prevent unauthorized scraping or security compromise. Media files are hosted on Cloudinary secure nodes.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white border-l-4 border-brand-accent pl-3">5. User Control & Deletion</h2>
          <p>
            Users can access, edit, or request complete deletion of their account databases at any time. Simply submit a deletion ticket in our support portal or email details directly to support@pginfo.online.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
