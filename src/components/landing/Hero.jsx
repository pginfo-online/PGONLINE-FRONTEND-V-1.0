import { Link } from 'react-router-dom';
import { ArrowUpRight, ShieldCheck, Star, MapPin, Users } from 'lucide-react';
import heroIllustration from '../../assets/hero-illustration.png';

export default function Hero() {
  return (
    <section id="hero" className="hero-section">
      {/* Background decorations */}
      <div className="hero-bg-grid" aria-hidden="true" />
      <div className="hero-bg-blob hero-bg-blob-1" aria-hidden="true" />
      <div className="hero-bg-blob hero-bg-blob-2" aria-hidden="true" />

      <div className="hero-container">
        {/* ── Left Column ── */}
        <div className="hero-left">
          {/* Subtitle Badge */}
          <div className="hero-subtitle">
            <span className="hero-subtitle-dot" />
            PG Accommodation Platform — Since 2024
          </div>

          {/* Main Headline */}
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

          {/* Description */}
          <p className="hero-description">
            Discover verified paying guest accommodations across India's top cities. 
            Connect directly with owners, schedule visits instantly, and join a 
            real tenant community — all without paying a single broker fee.
          </p>

          {/* CTA Button */}
          <div className="hero-cta-group">
            <Link to="/services" className="hero-cta-primary">
              Explore Listings
              <ArrowUpRight size={18} />
            </Link>
            <Link to="/connect" className="hero-cta-secondary">
              Get the App
            </Link>
          </div>

          {/* Trust Indicators */}
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
        </div>

        {/* ── Right Column ── */}
        <div className="hero-right">
          <div className="hero-image-wrapper">
            {/* Subtle glow behind image */}
            <div className="hero-image-glow" aria-hidden="true" />

            {/* Main illustration */}
            <img
              src={heroIllustration}
              alt="PGinfo.online app showcase — smart PG finder with map search and verified listings"
              className="hero-image"
            />

            {/* Floating Card: Stats */}
            <div className="hero-float-card hero-float-stats">
              <div className="hero-float-stats-icon">
                <MapPin size={16} />
              </div>
              <div>
                <p className="hero-float-stats-label">Cities Covered</p>
                <p className="hero-float-stats-value">25+ Cities</p>
              </div>
            </div>

            {/* Floating Card: Zero Brokerage */}
            <div className="hero-float-card hero-float-brokerage">
              <div className="hero-float-brokerage-badge">₹0</div>
              <div>
                <p className="hero-float-brokerage-title">Zero Brokerage</p>
                <p className="hero-float-brokerage-desc">No hidden charges</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="hero-scroll-indicator" aria-hidden="true">
        <span className="hero-scroll-text">Scroll to explore</span>
        <div className="hero-scroll-mouse">
          <div className="hero-scroll-dot" />
        </div>
      </div>
    </section>
  );
}
