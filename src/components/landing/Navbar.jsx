import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Building2, Menu, X, Phone, ChevronDown } from 'lucide-react';
import pgLogo from '../../assets/pgLogo.png';

const navLinks = [
  { label: 'Home', path: '/' },
  {
    label: 'Features',
    path: '/features',
    hasDropdown: true,
    children: [
      { label: 'Zero Brokerage', path: '/features', desc: 'No hidden charges' },
      { label: 'Verified Listings', path: '/features', desc: 'Audited properties' },
      { label: 'Direct Owner Chat', path: '/features', desc: 'Talk without brokers' },
    ],
  },
  {
    label: 'Services',
    path: '/services',
    hasDropdown: true,
    children: [
      { label: 'List Your PG', path: '/services', desc: 'For PG owners' },
      { label: 'Tenant App', path: '/connect', desc: 'Find accommodations' },
      { label: 'PG Management', path: '/services', desc: 'End-to-end solutions' },
    ],
  },
  { label: 'Why Choose Us', path: '/why-us' },
  { label: 'About', path: '/about' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [mobileExpanded, setMobileExpanded] = useState(null);
  const location = useLocation();
  const dropdownTimeout = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
    setActiveDropdown(null);
    setMobileExpanded(null);
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [location.pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  const handleDropdownEnter = (label) => {
    clearTimeout(dropdownTimeout.current);
    setActiveDropdown(label);
  };

  const handleDropdownLeave = () => {
    dropdownTimeout.current = setTimeout(() => setActiveDropdown(null), 150);
  };

  return (
    <>
      {/* ── Main Navigation Bar ── */}
      <nav
        className={`navbar-landing ${scrolled ? 'navbar-scrolled' : ''}`}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="navbar-inner">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center"
          >
            <img
              src={pgLogo}
              alt="PGinfo.online"
              className="h-16 w-auto object-contain"
            />
          </Link>
          {/* <Link to="/" className="navbar-logo" aria-label="PGinfo.online home">
            <div className="navbar-logo-icon">
              <Building2 size={18} />
            </div>
           
              <img src={pgLogo} alt="PGinfo.online Logo" />
            <span className="navbar-logo-text">
              PGinfo<span className="navbar-logo-accent">.online</span>
            </span>
          </Link> */}

          {/* ── Desktop Navigation Links ── */}
          <div className="navbar-links-desktop">
            {navLinks.map((link) => (
              <div
                key={link.label}
                className="navbar-link-wrapper"
                onMouseEnter={() => link.hasDropdown && handleDropdownEnter(link.label)}
                onMouseLeave={() => link.hasDropdown && handleDropdownLeave()}
              >
                <Link
                  to={link.path}
                  className={`navbar-link ${isActive(link.path) ? 'navbar-link-active' : ''}`}
                >
                  {link.label}
                  {link.hasDropdown && (
                    <ChevronDown
                      size={14}
                      className={`navbar-chevron ${activeDropdown === link.label ? 'navbar-chevron-open' : ''}`}
                    />
                  )}
                </Link>

                {/* Dropdown Panel */}
                {link.hasDropdown && (
                  <div
                    className={`navbar-dropdown ${activeDropdown === link.label ? 'navbar-dropdown-open' : ''}`}
                    onMouseEnter={() => handleDropdownEnter(link.label)}
                    onMouseLeave={handleDropdownLeave}
                  >
                    <div className="navbar-dropdown-inner">
                      {link.children.map((child) => (
                        <Link
                          key={child.label}
                          to={child.path}
                          className="navbar-dropdown-item"
                        >
                          <span className="navbar-dropdown-item-title">{child.label}</span>
                          <span className="navbar-dropdown-item-desc">{child.desc}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* ── Desktop Right Actions ── */}
          <div className="navbar-actions-desktop">
            <Link to="/login" className="navbar-contact-btn">
              <Phone size={15} />
              <span>Login</span>
            </Link>
          </div>

          {/* ── Mobile Hamburger Button ── */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="navbar-mobile-toggle"
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isOpen}
          >
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* ── Mobile Overlay ── */}
      <div
        className={`navbar-mobile-overlay ${isOpen ? 'navbar-mobile-overlay-open' : ''}`}
        onClick={() => setIsOpen(false)}
      />

      {/* ── Mobile Drawer ── */}
      <div className={`navbar-mobile-drawer ${isOpen ? 'navbar-mobile-drawer-open' : ''}`}>
        <div className="navbar-mobile-drawer-content">
          {navLinks.map((link) => (
            <div key={link.label}>
              {link.hasDropdown ? (
                <>
                  <button
                    onClick={() => setMobileExpanded(mobileExpanded === link.label ? null : link.label)}
                    className={`navbar-mobile-link ${isActive(link.path) ? 'navbar-mobile-link-active' : ''}`}
                  >
                    {link.label}
                    <ChevronDown
                      size={16}
                      className={`navbar-mobile-chevron ${mobileExpanded === link.label ? 'navbar-mobile-chevron-open' : ''}`}
                    />
                  </button>
                  <div
                    className={`navbar-mobile-submenu ${mobileExpanded === link.label ? 'navbar-mobile-submenu-open' : ''}`}
                  >
                    {link.children.map((child) => (
                      <Link
                        key={child.label}
                        to={child.path}
                        className="navbar-mobile-submenu-link"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </>
              ) : (
                <Link
                  to={link.path}
                  className={`navbar-mobile-link ${isActive(link.path) ? 'navbar-mobile-link-active' : ''}`}
                >
                  {link.label}
                </Link>
              )}
            </div>
          ))}

          {/* Mobile CTA */}
          <div className="navbar-mobile-cta">
            <Link to="/contact" className="navbar-mobile-cta-btn">
              <Phone size={16} />
              Contact Us
            </Link>
            <Link to="/login" className="navbar-mobile-signin-btn">
              Sign In →
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
