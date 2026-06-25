import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, MapPin } from 'lucide-react';
import PageWrapper from '../../components/layout/PageWrapper';
import pgService from '../../services/pg.service';
import toast from 'react-hot-toast';

export default function MyListings() {
  const [pgs, setPGs] = useState([]);
  const [updateRequests, setUpdateRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      pgService.getMy(),
      pgService.getMyUpdateRequests()
    ])
      .then(([listingsData, requestsData]) => {
        setPGs(listingsData);
        setUpdateRequests(requestsData);
      })
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this listing?')) return;
    try {
      await pgService.remove(id);
      setPGs((p) => p.filter((pg) => pg._id !== id));
      toast.success('Listing deleted');
    } catch (err) { toast.error(err.message); }
  };

  const action = (
    <button className="btn btn-primary" onClick={() => navigate('/owner/listings/add')}>
      <Plus size={16} /> Add New PG
    </button>
  );

  return (
    <PageWrapper title="My Listings" subtitle="Manage your PG listings" action={action}>
      {loading ? (
        <div className="grid-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card">
              <div className="skeleton" style={{ height: 160, marginBottom: 12, borderRadius: 8 }} />
              <div className="skeleton" style={{ height: 18, width: '60%', marginBottom: 8 }} />
              <div className="skeleton" style={{ height: 14, width: '80%' }} />
            </div>
          ))}
        </div>
      ) : pgs.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: '#6b7280', marginBottom: '1rem' }}>No listings yet</p>
          <button className="btn btn-primary" onClick={() => navigate('/owner/listings/add')}>
            <Plus size={16} /> Add Your First PG
          </button>
        </div>
      ) : (
        <div className="grid-3">
          {pgs.map((pg) => {
            const req = updateRequests.find(
              (r) => r.pg?._id === pg._id && ['pending', 'correction_required'].includes(r.status)
            );
            
            return (
              <div key={pg._id} className="pg-card">
                <img className="pg-card-img" src={pg.photos?.[0]?.url || 'https://via.placeholder.com/400x180?text=No+Photo'} alt={pg.name} />
                <div className="pg-card-body">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <div>
                      <div className="pg-card-title">{pg.name}</div>
                      <div className="pg-card-location" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <MapPin size={12} />{pg.area}, {pg.city}
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                      <span className={`badge badge-${pg.status}`}>{pg.status}</span>
                      {req && (
                        <span className="badge" style={{
                          background: req.status === 'pending' ? '#fffbeb' : '#fee2e2',
                          color: req.status === 'pending' ? '#d97706' : '#dc2626',
                          border: `1px solid ${req.status === 'pending' ? '#fef3c7' : '#fca5a5'}`,
                          margin: 0,
                          fontSize: '0.7rem',
                          padding: '2px 6px'
                        }}>
                          {req.status === 'pending' ? '🕐 Pending' : '⚠️ Correct'}
                        </span>
                      )}
                    </div>
                  </div>
                  {req?.status === 'correction_required' && req?.adminComment && (
                    <div style={{
                      fontSize: '0.75rem',
                      color: '#b91c1c',
                      background: '#fef2f2',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      marginBottom: '0.5rem',
                      fontStyle: 'italic'
                    }}>
                      Fix needed: "{req.adminComment}"
                    </div>
                  )}
                  {pg.rent?.single && <div className="pg-card-rent">₹{pg.rent.single.toLocaleString()}/mo</div>}
                  {pg.isVerified && <span className="badge badge-verified" style={{ marginTop: 6 }}>✓ Verified</span>}
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                    <button className="btn btn-secondary btn-sm" style={{ flex: 1 }}
                      onClick={() => navigate(`/owner/listings/${pg._id}/edit`)}>
                      <Pencil size={13} /> Edit
                    </button>
                    <button className="btn btn-sm" style={{ background: '#fee2e2', color: '#991b1b', border: 'none' }}
                      onClick={() => handleDelete(pg._id)}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </PageWrapper>
  );
}
