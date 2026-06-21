import { useEffect, useState } from 'react';
import { BarChart3, Building2, Users, CheckCircle, Clock, XCircle, TrendingUp } from 'lucide-react';
import PageWrapper from '../../components/layout/PageWrapper';
import adminService from '../../services/admin.service';

const StatCard = ({ icon: Icon, label, value, sub, color }) => (
  <div className="stat-card">
    <div className="stat-icon" style={{ background: color + '1a' }}>
      <Icon size={22} color={color} />
    </div>
    <div>
      <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#111827', lineHeight: 1 }}>{value ?? '—'}</div>
      <div style={{ fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginTop: '0.25rem' }}>{label}</div>
      {sub && <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.125rem' }}>{sub}</div>}
    </div>
  </div>
);

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getAnalytics()
      .then(setAnalytics)
      .finally(() => setLoading(false));
  }, []);

  const stats = analytics ? [
    { icon: Building2, label: 'Total Listings', value: analytics.pgs.total, sub: `${analytics.pgs.approved} approved`, color: '#4f46e5' },
    { icon: CheckCircle, label: 'Verified PGs', value: analytics.pgs.verified, sub: `${analytics.pgs.pending} pending`, color: '#10b981' },
    { icon: Clock, label: 'Pending Approval', value: analytics.pgs.pending, sub: 'Needs action', color: '#f59e0b' },
    { icon: Users, label: 'Total Users', value: analytics.users.total, sub: `${analytics.users.tenants} tenants, ${analytics.users.owners} owners`, color: '#3b82f6' },
    { icon: TrendingUp, label: 'Total Inquiries', value: analytics.activity.leads, sub: 'From tenants', color: '#8b5cf6' },
    { icon: BarChart3, label: 'Visit Requests', value: analytics.activity.visits, sub: 'All time', color: '#ec4899' },
  ] : [];

  return (
    <PageWrapper title="Admin Dashboard" subtitle="Platform overview and analytics">
      {loading ? (
        <div className="grid-3" style={{ marginBottom: '2rem' }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} className="stat-card">
              <div className="skeleton" style={{ width: 48, height: 48, borderRadius: 12 }} />
              <div style={{ flex: 1 }}>
                <div className="skeleton" style={{ height: 32, width: '60%', marginBottom: 8 }} />
                <div className="skeleton" style={{ height: 16, width: '80%' }} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid-3" style={{ marginBottom: '2rem' }}>
          {stats.map((s) => <StatCard key={s.label} {...s} />)}
        </div>
      )}

      {/* City Stats */}
      {analytics?.cityStats && (
        <div className="card">
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Listings by City</h3>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {analytics.cityStats.map((c) => (
              <div key={c._id} style={{
                flex: 1, minWidth: 120, padding: '1rem', borderRadius: 10,
                background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: 'white', textAlign: 'center',
              }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{c.count}</div>
                <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>{c._id}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </PageWrapper>
  );
}
