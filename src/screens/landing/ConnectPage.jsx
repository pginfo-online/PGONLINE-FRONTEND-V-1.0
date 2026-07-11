import { useEffect } from 'react';
import Navbar from '../../components/landing/Navbar';
import Connect from '../../components/landing/Connect';
import Footer from '../../components/landing/Footer';
import useSmoothScroll from '../../utils/useSmoothScroll';

export default function ConnectPage() {
  useSmoothScroll(true);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  return (
    <div className="bg-white min-h-screen text-brand-text-dark select-none">
      <Navbar />
      <div className="pt-20">
        <Connect />
      </div>
      <Footer />
    </div>
  );
}
