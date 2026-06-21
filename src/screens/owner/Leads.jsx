import { useEffect, useState } from 'react';
import { MessageSquare, Phone, Mail, Eye } from 'lucide-react';
import PageWrapper from '../../components/layout/PageWrapper';
import pgService from '../../services/pg.service';
import { leadService } from '../../services/lead.service';
import toast from 'react-hot-toast';

export default function Leads() {
  const [pgs, setPGs] = useState([]);
  const [selectedPG, setSelectedPG] = useState(null);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    pgService.getMy().then((data) => {
      setPGs(data);
      if (data.length > 0) {
        setSelectedPG(data[0]._id);
        loadLeads(data[0]._id);
      } else {
        setLoading(false);
      }
    }).catch((e) => { toast.error(e.message); setLoading(false); });
  }, []);

  const loadLeads = async (pgId) => {
    setLoading(true);
    try {
      const data = await leadService.getPGLeads(pgId);
      setLeads(data);
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  const handlePGChange = (pgId) => {
    setSelectedPG(pgId);
    loadLeads(pgId);
  };

  return (
    <PageWrapper title="Leads" subtitle="Tenant inquiries for your PGs">
      {pgs.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <label className="label">Select PG</label>
          <select className="input" style={{ maxWidth: 400 }} value={selectedPG || ''} onChange={(e) => handlePGChange(e.target.value)}>
            {pgs.map((pg) => (
              <option key={pg._id} value={pg._id}>{pg.name} — {pg.area}</option>
            ))}
          </select>
        </div>
      )}

      {loading ? (
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card" style={{ display: 'flex', gap: '1rem' }}>
              <div className="skeleton" style={{ width: 40, height: 40, borderRadius: '50%' }} />
              <div style={{ flex: 1 }}>
                <div className="skeleton" style={{ height: 16, width: '40%', marginBottom: 8 }} />
                <div className="skeleton" style={{ height: 14, width: '60%' }} />
              </div>
            </div>
          ))}
        </div>
      ) : leads.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>
          <MessageSquare size={40} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
          <p>No leads yet for this PG</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          {leads.map((lead) => (
            <div key={lead._id} className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%',
                background: lead.type === 'inquiry' ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : 'linear-gradient(135deg, #f59e0b, #d97706)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}>
                {lead.type === 'inquiry' ? <MessageSquare size={18} /> : <Eye size={18} />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{lead.tenant?.name}</div>
                <div style={{ fontSize: '0.8125rem', color: '#6b7280', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Mail size={12} />{lead.tenant?.email}</span>
                  {lead.tenant?.phone && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Phone size={12} />{lead.tenant.phone}</span>}
                </div>
                {lead.message && <p style={{ fontSize: '0.8125rem', color: '#374151', marginTop: '0.25rem' }}>"{lead.message}"</p>}
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <span className={`badge badge-${lead.type === 'inquiry' ? 'primary' : 'pending'}`}>{lead.type}</span>
                <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>
                  {new Date(lead.createdAt).toLocaleDateString('en-IN')}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageWrapper>
  );
}
