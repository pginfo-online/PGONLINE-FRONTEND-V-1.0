import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../../components/landing/Navbar';
import Hero from '../../components/landing/Hero';
import Features from '../../components/landing/Features';
import AboutUs from '../../components/landing/AboutUs';
import Services from '../../components/landing/Services';
import WhyChooseUs from '../../components/landing/WhyChooseUs';
import Connect from '../../components/landing/Connect';
import ContactUs from '../../components/landing/ContactUs';
import Footer from '../../components/landing/Footer';
import useSmoothScroll from '../../utils/useSmoothScroll';

export default function LandingPage() {
  const location = useLocation();
  
  // Enable custom kinetic smooth scrolling on the main landing experience
  useSmoothScroll(true);

  useEffect(() => {
    // Check if redirect state indicates we need to scroll to a specific section
    if (location.state?.scrollTo) {
      setTimeout(() => {
        const el = document.getElementById(location.state.scrollTo);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 150);
      // Clean state
      window.history.replaceState({}, document.title);
    } else {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, [location]);

  return (
    <div className="min-h-screen bg-slate-950 text-white select-none">
      <Navbar />
      <main className="overflow-x-hidden">
        <Hero />
        <Features />
        <AboutUs />
        <Services />
        {/* <WhyChooseUs /> */}
        {/* <Connect /> */}
        {/* <ContactUs /> */}
      </main>
      <Footer />
    </div>
  );
}
