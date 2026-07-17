import { useEffect } from 'react';
import Navbar from '../../components/landing/Navbar';
import Features from '../../components/landing/Features';
import Footer from '../../components/landing/Footer';
import useSmoothScroll from '../../utils/useSmoothScroll';

export default function FeaturesPage() {
  useSmoothScroll(true);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  return (
    <div className="min-h-screen bg-white text-brand-text-dark select-none">
      <Navbar />
      <div className="pt-16 sm:pt-18 lg:pt-20">
        <Features />
      </div>
      <Footer />
    </div>
  );
}
