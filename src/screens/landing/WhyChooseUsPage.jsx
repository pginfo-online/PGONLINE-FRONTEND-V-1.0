import { useEffect } from 'react';
import Navbar from '../../components/landing/Navbar';
import WhyChooseUs from '../../components/landing/WhyChooseUs';
import Footer from '../../components/landing/Footer';
import useSmoothScroll from '../../utils/useSmoothScroll';

export default function WhyChooseUsPage() {
  useSmoothScroll(true);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  return (
    <div className="bg-white min-h-screen text-brand-text-dark select-none">
      <Navbar />
      <div className="pt-20">
        <WhyChooseUs />
      </div>
      <Footer />
    </div>
  );
}
