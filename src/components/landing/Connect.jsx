import { Smartphone, Download, QrCode, CheckCircle2 } from 'lucide-react';
import homesImg from '../../assets/homes.jpg';
import heroImg from '../../assets/hero.png';
import useScrollReveal from '../../utils/useScrollReveal';

export default function Connect() {
  const [revealRef, isRevealed] = useScrollReveal();

  const benefits = [
    "Integrated dynamic map searches",
    "Filter by AC, WiFi, Food and Sharing Type",
    "Physical safety audit checks",
    "Brokerage-free direct lease signings",
    "Organize community mixers with roommates"
  ];

  return (
    <section 
      id="connect" 
      ref={revealRef}
      className={`py-24 bg-brand-dark-deep border-t border-b border-white/5 relative overflow-hidden transition-all duration-1000 transform ${
        isRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
      }`}
    >
      {/* Decorative Blur */}
      <div className="absolute top-1/2 left-0 w-72 h-72 rounded-full bg-brand-accent/5 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left: Device Mockup */}
        <div className="relative flex justify-center lg:justify-start order-2 lg:order-1">
          {/* Smartphone container */}
          <div className="w-[300px] h-[600px] rounded-[48px] border-[12px] border-gray-800 bg-brand-dark shadow-2xl relative overflow-hidden z-10">
            {/* Speaker & Camera notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-800 rounded-b-2xl z-30 flex items-center justify-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-gray-600" />
              <div className="w-8 h-1 bg-gray-600 rounded-full" />
            </div>

            {/* Screen Wallpaper / App Mockup */}
            <div className="w-full h-full relative">
              <img 
                src={homesImg} 
                alt="App Interface Listings" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-dark-deep via-brand-dark/20 to-transparent" />
              
              {/* Floating UI Elements on the phone screen */}
              <div className="absolute bottom-8 left-4 right-4 p-4 rounded-2xl bg-brand-dark-soft/90 border border-white/10 space-y-2">
                <span className="text-[10px] font-bold text-brand-accent uppercase tracking-wider">Top Verified Listing</span>
                <h4 className="text-white text-xs font-bold">Heritage Comfort PG Stays</h4>
                <div className="flex items-center justify-between text-[10px] text-gray-300">
                  <span>Double Sharing AC</span>
                  <span className="text-brand-accent font-bold">₹8,500/mo</span>
                </div>
              </div>
            </div>
          </div>

          {/* Floating visual support */}
          <div className="absolute bottom-12 -right-4 bg-brand-dark-soft/90 border border-white/10 rounded-2xl p-5 shadow-xl hidden sm:flex items-center gap-4 z-20 max-w-[200px] text-left">
            <div className="w-10 h-10 rounded-xl bg-brand-accent/25 border border-brand-accent/20 flex items-center justify-center shrink-0">
              <img src={heroImg} alt="Vite Icon" className="w-6 h-6 object-contain" />
            </div>
            <div>
              <div className="text-xs text-gray-400">Tenant Portal</div>
              <div className="text-sm font-bold text-white">Direct Connect</div>
            </div>
          </div>
        </div>

        {/* Right: Copy & Downloads */}
        <div className="space-y-8 text-left order-1 lg:order-2">
          <span className="text-xs font-bold text-brand-accent uppercase tracking-widest bg-brand-accent/10 px-4 py-1.5 rounded-full border border-brand-accent/20">
            Tenant Companion
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
            Connecting You Directly with Stays on the Mobile App
          </h2>
          <p className="text-base text-gray-300 leading-relaxed">
            Download our companion app on iOS and Android to find paying guest rooms. Search verified properties, book immediate visits, and finalize agreements directly.
          </p>

          {/* Bullet points */}
          <ul className="space-y-3.5 text-sm text-gray-300">
            {benefits.map((b, i) => (
              <li key={i} className="flex items-center gap-3">
                <CheckCircle2 size={16} className="text-brand-accent shrink-0" />
                <span>{b}</span>
              </li>
            ))}
          </ul>

          {/* App download section */}
          <div className="pt-4 flex flex-col sm:flex-row items-center gap-6 border-t border-white/5">
            {/* Playstore Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <a href="#" className="px-5 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-semibold text-xs flex items-center gap-3 justify-center transition-colors">
                <Smartphone size={20} />
                <div className="text-left leading-none">
                  <span className="text-[10px] text-gray-400 block font-normal">GET IT ON</span>
                  <span className="text-sm font-bold block mt-0.5">Google Play</span>
                </div>
              </a>
              <a href="#" className="px-5 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-semibold text-xs flex items-center gap-3 justify-center transition-colors">
                <Smartphone size={20} />
                <div className="text-left leading-none">
                  <span className="text-[10px] text-gray-400 block font-normal">DOWNLOAD ON THE</span>
                  <span className="text-sm font-bold block mt-0.5">App Store</span>
                </div>
              </a>
            </div>

            {/* Simulated QR Code */}
            <div className="hidden md:flex items-center gap-4 bg-white/5 border border-white/10 p-3 rounded-xl">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center text-brand-dark-deep">
                <QrCode size={36} />
              </div>
              <p className="text-xs text-gray-300 max-w-[100px] leading-tight font-medium">Scan to download app immediately</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
