import { useEffect } from 'react';
import Navbar from '../../components/landing/Navbar';
import Footer from '../../components/landing/Footer';
import useSmoothScroll from '../../utils/useSmoothScroll';
import { FileText, ShieldAlert } from 'lucide-react';

export default function Terms() {
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
            <FileText size={24} />
            <span className="text-xs font-bold uppercase tracking-wider">Legal Framework</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Terms & Conditions</h1>
          <p className="text-xs text-gray-400">Last updated: June 26, 2026</p>
        </div>
      </section>

      {/* Main Text Content */}
      <section className="py-16 max-w-4xl mx-auto px-6 text-left space-y-10 text-gray-300 leading-relaxed text-sm sm:text-base">
        
        {/* Warning Alert */}
        <div className="p-5 rounded-2xl bg-brand-primary/5 border border-brand-primary/20 flex gap-4 items-start">
          <ShieldAlert size={24} className="text-brand-accent shrink-0 mt-0.5" />
          <p className="text-xs sm:text-sm text-gray-300">
            Please read these terms carefully before utilizing our services. By accessing PGinfo.online or using our mobile application, you agree to comply with and be bound by these platform terms.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white border-l-4 border-brand-primary pl-3">1. Nature of the Platform</h2>
          <p>
            PGinfo.online is a direct connection marketplace. We provide property owners with tools to list accommodations and capture tenant inquiries, and we provide tenants with tools to browse paying guest accommodations. We do not act as real estate brokers, agents, or underwriters. All agreements and transactions are concluded directly between the parties.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white border-l-4 border-brand-primary pl-3">2. User Representations & Compliance</h2>
          <ul className="list-disc list-inside space-y-2 pl-2">
            <li><strong>Owners:</strong> You represent that all property details, pricing, photographs, and amenity disclosures are accurate. You agree to submit proper safety and compliance certificates.</li>
            <li><strong>Tenants:</strong> You agree to provide true identification parameters (KYC details) when requesting visits or executing lease agreements with owners.</li>
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white border-l-4 border-brand-primary pl-3">3. Physical Auditing Disclaimer</h2>
          <p>
            While PGinfo.online conducts physical verification audits on properties carrying the verification badge, this audit represents a visual check of parameters at a specific timestamp. We are not responsible for subsequent deterioration of services, utility failures, or alterations made by owners post-verification.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white border-l-4 border-brand-primary pl-3">4. Limitation of Liability</h2>
          <p>
            PGinfo.online is not liable for rental disputes, deposit refund delays, property damage, roommate conflicts, or personal incidents arising during occupancy. Users are advised to exercise standard due diligence prior to executing agreements.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white border-l-4 border-brand-primary pl-3">5. Platform Moderation</h2>
          <p>
            We reserve the right to remove listings, suspend user accounts, or reject verification requests that violate safety standards, carry spam contents, or receive multiple validated complaints from tenants.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
