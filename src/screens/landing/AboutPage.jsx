import { useEffect } from 'react';
import Navbar from '../../components/landing/Navbar';
import AboutUs from '../../components/landing/AboutUs';
import Footer from '../../components/landing/Footer';
import useSmoothScroll from '../../utils/useSmoothScroll';

export default function AboutPage() {
  useSmoothScroll(true);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  return (
    <div className="bg-white min-h-screen text-brand-text-dark select-none">
      <Navbar />
      <div className="pt-100">
        <AboutUs />
      </div>
      <Footer />
    </div>
  );
}
