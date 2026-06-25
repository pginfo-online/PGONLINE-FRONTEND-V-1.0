import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Building2, Users, BarChart3,
  Home, ListPlus, MessageSquare, Calendar,
  ShieldCheck, LogOut, CheckCircle
} from 'lucide-react';
import useAuthStore from '../../store/authStore';

const adminNavItems = [
  { label: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'PG Approvals', to: '/admin/approvals', icon: CheckCircle },
  { label: 'PG Updates', to: '/admin/pg-updates', icon: ShieldCheck },
  { label: 'Meetup Management', to: '/admin/meetups', icon: Calendar },
  { label: 'User Management', to: '/admin/users', icon: Users },
  { label: 'Analytics', to: '/admin/analytics', icon: BarChart3 },
];

const ownerNavItems = [
  { label: 'Dashboard', to: '/owner/dashboard', icon: Home },
  { label: 'My Listings', to: '/owner/listings', icon: Building2 },
  { label: 'Add PG', to: '/owner/listings/add', icon: ListPlus },
  { label: 'Meetups', to: '/owner/meetups', icon: Users },
  { label: 'Leads', to: '/owner/leads', icon: MessageSquare },
  { label: 'Visits', to: '/owner/visits', icon: Calendar },
];

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const navItems = user?.role === 'admin' ? adminNavItems : ownerNavItems;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg, #818cf8, #a78bfa)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Building2 size={18} color="white" />
          </div>
          <h1>PGinfo.online</h1>
        </div>
        <span>{user?.role === 'admin' ? 'Admin Panel' : 'Owner Dashboard'}</span>
      </div>

      <nav className="sidebar-nav">
        <p className="nav-section-label">Navigation</p>
        {navItems.map(({ label, to, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div style={{ marginBottom: '0.75rem', padding: '0.625rem 0.75rem', borderRadius: 8, background: 'rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'linear-gradient(135deg, #818cf8, #a78bfa)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 600, color: 'white', flexShrink: 0
            }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.name}
              </div>
              <div style={{ fontSize: '0.6875rem', color: 'rgba(255,255,255,0.5)', textTransform: 'capitalize' }}>{user?.role}</div>
            </div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="nav-link"
          style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', color: '#f87171' }}
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
