import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ShieldCheck, Star, MapPin, Users } from 'lucide-react';
import heroIllustration from '../../assets/hero-illustration.png';

const reveal = {
  hidden: { opacity: 0, y: 20 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      delay,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

export default function Hero() {
  return (
    <section id="hero" className="hero-section">
      <div className="hero-bg-grid" aria-hidden="true" />
      <div className="hero-bg-blob hero-bg-blob-1" aria-hidden="true" />
      <div className="hero-bg-blob hero-bg-blob-2" aria-hidden="true" />

      <div className="hero-container">
        <motion.div
          className="hero-left"
          initial="hidden"
          animate="visible"
          custom={0.05}
          variants={reveal}
        >
          <div className="hero-subtitle">
            <span className="hero-subtitle-dot" />
            PG Accommodation Platform — Since 2024
          </div>

          <h1 className="hero-headline">
            Find Your Perfect PG
            <br />
            Accommodation in{' '}
            <span className="hero-headline-accent">
              Seconds
              <svg className="hero-headline-underline" viewBox="0 0 240 12" fill="none" aria-hidden="true">
                <path d="M2 9 Q60 2 120 6 Q180 10 238 3" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" fill="none" />
              </svg>
            </span>
          </h1>

          <p className="hero-description">
            Discover verified paying guest accommodations across India's top cities.
            Connect directly with owners, schedule visits instantly, and join a
            real tenant community — all without paying a single broker fee.
          </p>

          <div className="hero-cta-group">
            <Link to="/services" className="hero-cta-primary">
              Explore Listings
              <ArrowUpRight size={18} />
            </Link>
            <Link to="/connect" className="hero-cta-secondary">
              Get the App
            </Link>
          </div>

          <div className="hero-trust-bar">
            <div className="hero-trust-item">
              <div className="hero-trust-icon hero-trust-icon-blue">
                <ShieldCheck size={16} />
              </div>
              <div>
                <span className="hero-trust-value">100%</span>
                <span className="hero-trust-label">Verified PGs</span>
              </div>
            </div>

            <div className="hero-trust-divider" />

            <div className="hero-trust-item">
              <div className="hero-trust-icon hero-trust-icon-amber">
                <Star size={16} />
              </div>
              <div>
                <span className="hero-trust-value">4.9/5</span>
                <span className="hero-trust-label">User Rating</span>
              </div>
            </div>

            <div className="hero-trust-divider" />

            <div className="hero-trust-item">
              <div className="hero-trust-icon hero-trust-icon-emerald">
                <Users size={16} />
              </div>
              <div>
                <span className="hero-trust-value">10K+</span>
                <span className="hero-trust-label">Happy Tenants</span>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="hero-right"
          initial="hidden"
          animate="visible"
          custom={0.18}
          variants={reveal}
        >
          <div className="hero-image-wrapper">
            <div className="hero-image-glow" aria-hidden="true" />

            <motion.img
              src={heroIllustration}
              alt="PGinfo.online app showcase — smart PG finder with map search and verified listings"
              className="hero-image"
              whileHover={{ scale: 1.02, rotate: -0.35 }}
              transition={{ type: 'spring', stiffness: 150, damping: 14 }}
            />

            <div className="hero-float-card hero-float-stats">
              <div className="hero-float-stats-icon">
                <MapPin size={16} />
              </div>
              <div>
                <p className="hero-float-stats-label">Cities Covered</p>
                <p className="hero-float-stats-value">25+ Cities</p>
              </div>
            </div>

            <div className="hero-float-card hero-float-brokerage">
              <div className="hero-float-brokerage-badge">₹0</div>
              <div>
                <p className="hero-float-brokerage-title">Zero Brokerage</p>
                <p className="hero-float-brokerage-desc">No hidden charges</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="hero-scroll-indicator" aria-hidden="true">
        <span className="hero-scroll-text">Scroll to explore</span>
        <div className="hero-scroll-mouse">
          <div className="hero-scroll-dot" />
        </div>
      </div>
    </section>
  );
}
