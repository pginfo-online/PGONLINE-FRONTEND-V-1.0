import { useState } from 'react';
import { Phone, Mail, MapPin, Send, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import useScrollReveal from '../../utils/useScrollReveal';

export default function ContactUs() {
  const [revealRef, isRevealed] = useScrollReveal();
  const [form, setForm] = useState({ name: '', email: '', phone: '', role: 'tenant', message: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error('Please enter name, email, and message.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      toast.success('Your message has been received! Our team will contact you shortly.');
      setForm({ name: '', email: '', phone: '', role: 'tenant', message: '' });
      setTimeout(() => setSuccess(false), 5000);
    }, 1500);
  };

  return (
    <section 
      id="contact" 
      ref={revealRef}
      className={`py-24 bg-brand-dark relative overflow-hidden transition-all duration-1000 transform ${
        isRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
        {/* Left Column: Info */}
        <div className="lg:col-span-5 space-y-8 text-left">
          <div className="space-y-4">
            <span className="text-xs font-bold text-brand-accent uppercase tracking-widest bg-brand-accent/10 px-4 py-1.5 rounded-full border border-brand-accent/20">
              Get In Touch
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Connect With Our Support Team
            </h2>
            <p className="text-base text-gray-400 leading-relaxed">
              Have questions about physical audits, listing verification, or user account setups? Drop us a note or call our support lines.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-brand-accent shrink-0">
                <Phone size={20} />
              </div>
              <div>
                <h4 className="text-white font-bold text-sm">Call Support</h4>
                <p className="text-sm text-gray-400 mt-1">+91 (800) 555-0199</p>
                <p className="text-xs text-gray-500">Mon - Sat: 9:00 AM - 6:00 PM</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-brand-accent shrink-0">
                <Mail size={20} />
              </div>
              <div>
                <h4 className="text-white font-bold text-sm">Email Address</h4>
                <p className="text-sm text-gray-400 mt-1">support@pginfo.online</p>
                <p className="text-xs text-gray-500">Expect a response within 24 hours</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-brand-accent shrink-0">
                <MapPin size={20} />
              </div>
              <div>
                <h4 className="text-white font-bold text-sm">Global Headquarters</h4>
                <p className="text-sm text-gray-400 mt-1">
                  PGinfo Online HQ, Block C, Tech Park Phase 2,<br />
                  Electronic City, Bangalore, KA, India - 560100
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Form */}
        <div className="lg:col-span-7 bg-brand-dark-soft/20 border border-white/10 rounded-3xl p-8 shadow-2xl relative">
          {success && (
            <div className="absolute inset-0 bg-brand-dark-deep/95 backdrop-blur-sm z-30 rounded-3xl flex flex-col items-center justify-center p-8 text-center animate-fade-in">
              <CheckCircle2 size={64} className="text-brand-accent mb-4" />
              <h3 className="text-2xl font-bold text-white">Message Sent Successfully!</h3>
              <p className="text-sm text-gray-400 mt-2 max-w-sm">
                Thank you for reaching out. A representative will contact you shortly using your registered details.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 text-left">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-300">Your Name</label>
                <input 
                  type="text" 
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="John Doe"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-brand-primary placeholder:text-gray-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-300">Email Address</label>
                <input 
                  type="email" 
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="john@example.com"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-brand-primary placeholder:text-gray-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-300">Phone Number (Optional)</label>
                <input 
                  type="tel" 
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-brand-primary placeholder:text-gray-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-300">Interested in</label>
                <select 
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full px-4 py-3 bg-brand-dark-soft border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-brand-primary"
                >
                  <option value="tenant">Finding a PG (Tenant)</option>
                  <option value="owner">Listing a PG (Owner)</option>
                  <option value="partner">Corporate Partnerships</option>
                  <option value="support">Technical Support</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-300">Message / Inquiry</label>
              <textarea 
                rows={4}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="How can our support team help you?"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-brand-primary placeholder:text-gray-500 resize-none"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-4 rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-white font-bold text-sm flex items-center justify-center gap-2 hover:shadow-xl hover:shadow-brand-primary/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? 'Sending Request...' : (
                <>Submit Inquiry <Send size={16} /></>
              )}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
