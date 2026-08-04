import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Building2, Heart, Calendar, Users, LogOut, ChevronDown, User, LayoutDashboard, Menu, X } from 'lucide-react';
import useAuthStore from '../../store/authStore';

export default function TenantNavbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    setMenuOpen(false);
    navigate('/', { replace: true });
  };

  const activeClass = ({ isActive }) =>
    `flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-all ${
      isActive
        ? 'text-brand-primary bg-blue-50/50 dark:bg-blue-950/20'
        : 'text-brand-text-muted hover:text-brand-text-dark hover:bg-slate-50'
    }`;

  const mobileActiveClass = ({ isActive }) =>
    `flex items-center gap-2 px-4 py-3 text-base font-semibold rounded-xl transition-all ${
      isActive
        ? 'text-white bg-brand-primary'
        : 'text-brand-text-muted hover:text-brand-text-dark hover:bg-slate-50'
    }`;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-brand-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-primary to-brand-accent flex items-center justify-center shadow-md shadow-blue-500/20">
              <Building2 size={20} color="white" />
            </div>
            <span className="text-lg font-extrabold text-slate-900 tracking-tight">
              PGinfo<span className="text-brand-primary">.online</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <NavLink to="/explore" className={activeClass}>
              Explore PGs
            </NavLink>
            <NavLink to="/meetups" className={activeClass}>
              <Users size={16} />
              Meetups
            </NavLink>
            {isAuthenticated && user?.role === 'tenant' && (
              <>
                <NavLink to="/visits" className={activeClass}>
                  <Calendar size={16} />
                  My Visits
                </NavLink>
                <NavLink to="/wishlist" className={activeClass}>
                  <Heart size={16} />
                  Wishlist
                </NavLink>
              </>
            )}
          </nav>

          {/* User Auth Buttons / Avatar */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-brand-border bg-slate-50 hover:bg-slate-100 transition-all focus:outline-none"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                    {user?.name?.[0]?.toUpperCase()}
                  </div>
                  <span className="text-sm font-semibold text-slate-700 max-w-[100px] truncate">
                    {user?.name?.split(' ')[0]}
                  </span>
                  <ChevronDown size={14} className={`text-slate-500 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {dropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white border border-brand-border shadow-xl py-2 z-20 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-4 py-2 border-b border-brand-border">
                        <p className="text-sm font-bold text-slate-900 truncate">{user?.name}</p>
                        <p className="text-xs text-brand-text-muted truncate capitalize">{user?.role}</p>
                      </div>
                      
                      {/* Dashboard Link for Owner / Admin */}
                      {(user?.role === 'owner' || user?.role === 'admin') && (
                        <Link
                          to={user.role === 'admin' ? '/admin/dashboard' : '/owner/dashboard'}
                          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-brand-primary"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <LayoutDashboard size={16} />
                          Go to Dashboard
                        </Link>
                      )}

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 text-left"
                      >
                        <LogOut size={16} />
                        Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="btn btn-primary shadow-lg shadow-blue-500/25"
                style={{ borderRadius: 20, padding: '0.5rem 1.25rem', fontSize: '0.875rem' }}
              >
                Login / Join
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle menu"
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {menuOpen && (
        <div className="md:hidden bg-white border-b border-brand-border py-4 px-4 space-y-2 animate-in slide-in-from-top duration-200">
          <nav className="flex flex-col gap-1">
            <NavLink
              to="/explore"
              className={mobileActiveClass}
              onClick={() => setMenuOpen(false)}
            >
              Explore PGs
            </NavLink>
            <NavLink
              to="/meetups"
              className={mobileActiveClass}
              onClick={() => setMenuOpen(false)}
            >
              Meetups
            </NavLink>
            {isAuthenticated && user?.role === 'tenant' && (
              <>
                <NavLink
                  to="/visits"
                  className={mobileActiveClass}
                  onClick={() => setMenuOpen(false)}
                >
                  My Visits
                </NavLink>
                <NavLink
                  to="/wishlist"
                  className={mobileActiveClass}
                  onClick={() => setMenuOpen(false)}
                >
                  Wishlist
                </NavLink>
              </>
            )}
          </nav>

          <div className="pt-4 border-t border-brand-border flex flex-col gap-3">
            {isAuthenticated ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 px-2">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                    {user?.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{user?.name}</p>
                    <p className="text-xs text-brand-text-muted capitalize">{user?.role}</p>
                  </div>
                </div>

                {(user?.role === 'owner' || user?.role === 'admin') && (
                  <Link
                    to={user.role === 'admin' ? '/admin/dashboard' : '/owner/dashboard'}
                    className="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl text-base font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100"
                    onClick={() => setMenuOpen(false)}
                  >
                    <LayoutDashboard size={18} />
                    Go to Dashboard
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl text-base font-bold text-red-600 bg-red-50 hover:bg-red-100 text-left"
                >
                  <LogOut size={18} />
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="w-full btn btn-primary justify-center py-3 text-center"
                style={{ borderRadius: 12 }}
                onClick={() => setMenuOpen(false)}
              >
                Login / Join
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
