import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, MessageSquare, Calendar, Eye, TrendingUp, Plus } from 'lucide-react';
import PageWrapper from '../../components/layout/PageWrapper';
import pgService from '../../services/pg.service';
import { leadService, visitService } from '../../services/lead.service';
import toast from 'react-hot-toast';

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="stat-card">
    <div className="stat-icon" style={{ background: color + '1a' }}>
      <Icon size={22} color={color} />
    </div>
    <div>
      <div style={{ fontSize: '1.75rem', fontWeight: 700, lineHeight: 1 }}>{value ?? '—'}</div>
      <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>{label}</div>
    </div>
  </div>
);

export default function OwnerDashboard() {
  const [pgs, setPGs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    pgService.getMy()
      .then(setPGs)
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, []);

  const totalViews = pgs.reduce((s, p) => s + (p.views || 0), 0);
  const totalInquiries = pgs.reduce((s, p) => s + (p.inquiries || 0), 0);
  const approved = pgs.filter((p) => p.status === 'approved').length;

  return (
    <PageWrapper title="Dashboard" subtitle="Welcome back! Here's your overview">
      <div className="grid-4" style={{ marginBottom: '2rem' }}>
        <StatCard icon={Building2} label="My Listings" value={pgs.length} color="#4f46e5" />
        <StatCard icon={Eye} label="Total Views" value={totalViews} color="#3b82f6" />
        <StatCard icon={TrendingUp} label="Inquiries" value={totalInquiries} color="#10b981" />
        <StatCard icon={Building2} label="Approved" value={approved} color="#8b5cf6" />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Recent Listings</h3>
        <button className="btn btn-primary btn-sm" onClick={() => navigate('/owner/listings/add')}>
          <Plus size={16} /> Add PG
        </button>
      </div>

      {loading ? (
        <div className="grid-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card">
              <div className="skeleton" style={{ height: 140, marginBottom: 12, borderRadius: 8 }} />
              <div className="skeleton" style={{ height: 18, width: '60%', marginBottom: 8 }} />
              <div className="skeleton" style={{ height: 14, width: '80%' }} />
            </div>
          ))}
        </div>
      ) : pgs.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <Building2 size={40} color="#9ca3af" style={{ margin: '0 auto 1rem' }} />
          <p style={{ color: '#6b7280' }}>No listings yet. Add your first PG!</p>
          <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => navigate('/owner/listings/add')}>
            <Plus size={16} /> Add PG Listing
          </button>
        </div>
      ) : (
        <div className="grid-3">
          {pgs.slice(0, 6).map((pg) => (
            <div key={pg._id} className="pg-card" onClick={() => navigate(`/owner/listings/${pg._id}/edit`)} style={{ cursor: 'pointer' }}>
              <img className="pg-card-img" src={pg.photos?.[0]?.url || 'https://via.placeholder.com/400x180?text=No+Photo'} alt={pg.name} />
              <div className="pg-card-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div className="pg-card-title">{pg.name}</div>
                    <div className="pg-card-location">{pg.area}, {pg.city}</div>
                  </div>
                  <span className={`badge badge-${pg.status}`}>{pg.status}</span>
                </div>
                {pg.rent?.single && <div className="pg-card-rent" style={{ marginTop: '0.5rem' }}>₹{pg.rent.single.toLocaleString()}/mo</div>}
                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', fontSize: '0.75rem', color: '#9ca3af' }}>
                  <span>{pg.views} views</span>
                  <span>{pg.inquiries} inquiries</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageWrapper>
  );
}
