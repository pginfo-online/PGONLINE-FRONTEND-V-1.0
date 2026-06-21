import { useEffect, useState } from 'react';
import { Calendar, CheckCircle, XCircle, Clock, User, Phone } from 'lucide-react';
import PageWrapper from '../../components/layout/PageWrapper';
import pgService from '../../services/pg.service';
import { visitService } from '../../services/lead.service';
import toast from 'react-hot-toast';

export default function Visits() {
  const [pgs, setPGs] = useState([]);
  const [selectedPG, setSelectedPG] = useState(null);
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    pgService.getMy().then((data) => {
      setPGs(data);
      if (data.length > 0) {
        setSelectedPG(data[0]._id);
        loadVisits(data[0]._id);
      } else setLoading(false);
    }).catch((e) => { toast.error(e.message); setLoading(false); });
  }, []);

  const loadVisits = async (pgId) => {
    setLoading(true);
    try {
      const data = await visitService.getPGVisits(pgId);
      setVisits(data);
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  const handleStatus = async (id, status) => {
    try {
      const updated = await visitService.updateStatus(id, status);
      setVisits((prev) => prev.map((v) => (v._id === id ? updated : v)));
      toast.success(`Visit ${status}`);
    } catch (err) { toast.error(err.message); }
  };

  const statusIcon = { pending: Clock, confirmed: CheckCircle, cancelled: XCircle, completed: CheckCircle };

  return (
    <PageWrapper title="Visit Requests" subtitle="Manage tenant visit schedules">
      {pgs.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <label className="label">Select PG</label>
          <select className="input" style={{ maxWidth: 400 }} value={selectedPG || ''}
            onChange={(e) => { setSelectedPG(e.target.value); loadVisits(e.target.value); }}>
            {pgs.map((pg) => <option key={pg._id} value={pg._id}>{pg.name} — {pg.area}</option>)}
          </select>
        </div>
      )}

      {loading ? (
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          {[...Array(3)].map((_, i) => <div key={i} className="card"><div className="skeleton" style={{ height: 60 }} /></div>)}
        </div>
      ) : visits.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>
          <Calendar size={40} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
          <p>No visit requests yet</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          {visits.map((v) => {
            const Icon = statusIcon[v.status] || Clock;
            return (
              <div key={v._id} className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ width: 44, height: 44, borderRadius: 10,
                  background: v.status === 'confirmed' ? '#d1fae5' : v.status === 'cancelled' ? '#fee2e2' : '#fef3c7',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={20} color={v.status === 'confirmed' ? '#059669' : v.status === 'cancelled' ? '#dc2626' : '#d97706'} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{v.tenant?.name}</div>
                  <div style={{ fontSize: '0.8125rem', color: '#6b7280', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <span><Calendar size={12} style={{ marginRight: 4 }} />{new Date(v.scheduledDate).toLocaleDateString('en-IN')} at {v.scheduledTime}</span>
                    {v.tenant?.phone && <span><Phone size={12} style={{ marginRight: 4 }} />{v.tenant.phone}</span>}
                  </div>
                  {v.message && <p style={{ fontSize: '0.8125rem', color: '#374151', marginTop: 4 }}>"{v.message}"</p>}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                  {v.status === 'pending' && (
                    <>
                      <button className="btn btn-success btn-sm" onClick={() => handleStatus(v._id, 'confirmed')}>
                        <CheckCircle size={14} /> Confirm
                      </button>
                      <button className="btn btn-sm" style={{ background: '#fee2e2', color: '#991b1b', border: 'none' }}
                        onClick={() => handleStatus(v._id, 'cancelled')}>
                        <XCircle size={14} /> Cancel
                      </button>
                    </>
                  )}
                  {v.status !== 'pending' && (
                    <span className={`badge badge-${v.status === 'confirmed' ? 'approved' : 'rejected'}`}>{v.status}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </PageWrapper>
  );
}
