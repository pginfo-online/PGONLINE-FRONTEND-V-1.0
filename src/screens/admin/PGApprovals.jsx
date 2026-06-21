import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle, Shield, ShieldOff, Eye, MapPin, Phone, Trash2 } from 'lucide-react';
import PageWrapper from '../../components/layout/PageWrapper';
import adminService from '../../services/admin.service';

const STATUS_TABS = ['all', 'pending', 'approved', 'rejected'];

export default function PGApprovals() {
  const [pgs, setPGs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const data = await adminService.getAllPGs({ status: activeTab === 'all' ? undefined : activeTab, limit: 50 });
      setPGs(data.pgs);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [activeTab]);

  const handleApprove = async (id) => {
    try {
      const pg = await adminService.approvePG(id);
      setPGs((prev) => prev.map((p) => (p._id === id ? pg : p)));
      toast.success('PG approved!');
    } catch (err) { toast.error(err.message); }
  };

  const handleReject = async () => {
    try {
      const pg = await adminService.rejectPG(rejectModal, rejectReason);
      setPGs((prev) => prev.map((p) => (p._id === rejectModal ? pg : p)));
      toast.success('PG rejected');
      setRejectModal(null);
      setRejectReason('');
    } catch (err) { toast.error(err.message); }
  };

  const handleVerify = async (id) => {
    try {
      const pg = await adminService.toggleVerify(id);
      setPGs((prev) => prev.map((p) => (p._id === id ? pg : p)));
      toast.success(pg.isVerified ? 'Verified badge added' : 'Verification removed');
    } catch (err) { toast.error(err.message); }
  };

  const handleRemove = async (id) => {
    if (!confirm('Permanently delete this listing?')) return;
    try {
      await adminService.removePG(id);
      setPGs((prev) => prev.filter((p) => p._id !== id));
      toast.success('Listing removed');
    } catch (err) { toast.error(err.message); }
  };

  const StatusBadge = ({ status }) => (
    <span className={`badge badge-${status}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );

  return (
    <PageWrapper title="PG Approvals" subtitle="Review and manage PG listing submissions">
      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0' }}>
        {STATUS_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '0.5rem 1.25rem', border: 'none', background: 'none', cursor: 'pointer',
              fontSize: '0.875rem', fontWeight: 500, textTransform: 'capitalize',
              borderBottom: activeTab === tab ? '2px solid #4f46e5' : '2px solid transparent',
              color: activeTab === tab ? '#4f46e5' : '#6b7280',
              transition: 'all 0.15s',
            }}
          >
            {tab === 'all' ? 'All' : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div className="skeleton" style={{ width: 80, height: 60, borderRadius: 8, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div className="skeleton" style={{ height: 20, width: '40%', marginBottom: 8 }} />
                <div className="skeleton" style={{ height: 14, width: '60%' }} />
              </div>
            </div>
          ))}
        </div>
      ) : pgs.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>
          <CheckCircle size={40} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
          <p>No {activeTab === 'all' ? '' : activeTab} listings found</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {pgs.map((pg) => (
            <div key={pg._id} className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              {/* Photo */}
              <img
                src={pg.photos?.[0]?.url || 'https://via.placeholder.com/80x60?text=No+Photo'}
                alt={pg.name}
                style={{ width: 90, height: 68, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }}
              />

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{pg.name}</span>
                  <StatusBadge status={pg.status} />
                  {pg.isVerified && <span className="badge badge-verified">✓ Verified</span>}
                </div>
                <div style={{ fontSize: '0.8125rem', color: '#6b7280', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <MapPin size={13} />{pg.area}, {pg.city}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Phone size={13} />+91 {pg.contactPhone}
                  </span>
                  <span>Owner: {pg.owner?.name}</span>
                </div>
                {pg.rent?.single && (
                  <div style={{ fontSize: '0.8125rem', color: '#4f46e5', fontWeight: 600, marginTop: '0.25rem' }}>
                    ₹{pg.rent.single}/mo (single)
                  </div>
                )}
                {pg.rejectionReason && (
                  <div style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '0.25rem' }}>
                    Rejection: {pg.rejectionReason}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0, flexWrap: 'wrap' }}>
                {pg.status === 'pending' && (
                  <button className="btn btn-success btn-sm" onClick={() => handleApprove(pg._id)}>
                    <CheckCircle size={14} /> Approve
                  </button>
                )}
                {pg.status !== 'rejected' && (
                  <button className="btn btn-sm" style={{ background: '#fee2e2', color: '#991b1b', border: 'none' }}
                    onClick={() => setRejectModal(pg._id)}>
                    <XCircle size={14} /> Reject
                  </button>
                )}
                {pg.status === 'approved' && (
                  <button className="btn btn-sm"
                    style={{ background: pg.isVerified ? '#f3f4f6' : '#ede9fe', color: pg.isVerified ? '#374151' : '#5b21b6', border: 'none' }}
                    onClick={() => handleVerify(pg._id)}>
                    {pg.isVerified ? <ShieldOff size={14} /> : <Shield size={14} />}
                    {pg.isVerified ? 'Unverify' : 'Verify'}
                  </button>
                )}
                <button className="btn btn-sm" style={{ background: '#fff1f2', color: '#be123c', border: 'none' }}
                  onClick={() => handleRemove(pg._id)}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <div className="modal-overlay" onClick={() => setRejectModal(null)}>
          <div className="modal" style={{ maxWidth: 420 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontWeight: 600 }}>Reject Listing</h3>
              <button onClick={() => setRejectModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem' }}>×</button>
            </div>
            <div className="modal-body">
              <label className="label">Reason for rejection</label>
              <textarea
                className="input"
                rows={3}
                placeholder="e.g. Photos are missing, incomplete information..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setRejectModal(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleReject}>Reject Listing</button>
            </div>
          </div>
        </div>
      )}
    </PageWrapper>
  );
}
