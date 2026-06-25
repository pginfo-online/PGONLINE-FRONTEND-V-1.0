import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Clock,
  User,
  Building2,
  MessageSquare,
  RefreshCw,
} from 'lucide-react';
import PageWrapper from '../../components/layout/PageWrapper';
import adminService from '../../services/admin.service';

const STATUS_TABS = ['pending', 'approved', 'rejected', 'correction_required', 'cancelled'];

export default function PGUpdateRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [activeTab, setActiveTab] = useState('pending');
  const [expandedRequestId, setExpandedRequestId] = useState(null);
  
  // Modal states
  const [actionModal, setActionModal] = useState(null); // { type: 'reject' | 'correction', id: string }
  const [actionComment, setActionComment] = useState('');

  const loadRequests = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await adminService.getAllUpdateRequests({ status: activeTab, limit: 50 });
      setRequests(Array.isArray(data.requests) ? data.requests : []);
    } catch (err) {
      const message = err.message || 'Unable to load update requests';
      setLoadError(message);
      setRequests([]);
      toast.error('Failed to load update requests: ' + message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [activeTab]);

  const toggleExpand = (id) => {
    setExpandedRequestId(expandedRequestId === id ? null : id);
  };

  const handleApprove = async (id) => {
    if (!confirm('Are you sure you want to approve these changes? They will go live immediately.')) return;
    try {
      await adminService.approveUpdateRequest(id);
      toast.success('Changes approved and applied to listing!');
      loadRequests();
    } catch (err) {
      toast.error('Failed to approve: ' + err.message);
    }
  };

  const handleActionSubmit = async () => {
    if (!actionComment.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    try {
      if (actionModal.type === 'reject') {
        await adminService.rejectUpdateRequest(actionModal.id, actionComment);
        toast.success('Request rejected');
      } else {
        await adminService.requestCorrection(actionModal.id, actionComment);
        toast.success('Correction requested');
      }
      setActionModal(null);
      setActionComment('');
      loadRequests();
    } catch (err) {
      toast.error('Failed to update request: ' + err.message);
    }
  };

  // Helper to check if value is empty or not
  const isEmptyVal = (val) => val === undefined || val === null || val === '';

  // Function to render diff details between original snapshot and proposed changes
  const renderDiff = (originalSnapshot = {}, proposedChanges = {}) => {
    const original = originalSnapshot || {};
    const proposed = proposedChanges || {};

    const diffs = [];

    // Find all changed keys
    Object.keys(proposed).forEach((key) => {
      // Skip internal fields
      if (['_id', 'id', 'owner', 'createdAt', 'updatedAt', '__v', 'photos'].includes(key)) return;

      const origVal = original[key];
      const propVal = proposed[key];

      // Deep compare rent
      if (key === 'rent') {
        const oRent = origVal || {};
        const pRent = propVal || {};
        const rentDiffs = [];

        ['single', 'double', 'triple'].forEach((type) => {
          if (String(oRent[type] || '') !== String(pRent[type] || '')) {
            rentDiffs.push({
              type: `${type.toUpperCase()} Sharing Rent`,
              orig: oRent[type] ? `₹${oRent[type].toLocaleString()}/mo` : 'Not Set',
              prop: pRent[type] ? `₹${pRent[type].toLocaleString()}/mo` : 'Removed',
            });
          }
        });

        if (rentDiffs.length > 0) {
          diffs.push({ key: 'rent', nested: rentDiffs });
        }
        return;
      }

      // Compare facilities array
      if (key === 'facilities') {
        const oArr = Array.isArray(origVal) ? origVal : [];
        const pArr = Array.isArray(propVal) ? propVal : [];

        const added = pArr.filter((x) => !oArr.includes(x));
        const removed = oArr.filter((x) => !pArr.includes(x));

        if (added.length > 0 || removed.length > 0) {
          diffs.push({
            key: 'Facilities / Amenities',
            added,
            removed,
            isArray: true,
          });
        }
        return;
      }

      // Simple values
      if (String(origVal || '') !== String(propVal || '')) {
        let displayOrig = isEmptyVal(origVal) ? 'Not Set' : String(origVal);
        let displayProp = isEmptyVal(propVal) ? 'Removed' : String(propVal);

        if (typeof origVal === 'boolean') displayOrig = origVal ? 'Yes' : 'No';
        if (typeof propVal === 'boolean') displayProp = propVal ? 'Yes' : 'No';

        // Prettier labels
        let label = key.charAt(0).toUpperCase() + key.slice(1);
        if (key === 'ac') label = 'Air Conditioning (AC)';
        if (key === 'foodIncluded') label = 'Food Included';
        if (key === 'availableRooms') label = 'Available Rooms';
        if (key === 'contactPhone') label = 'Contact Phone';
        if (key === 'contactWhatsapp') label = 'WhatsApp Number';
        if (key === 'isAvailable') label = 'Available for Booking';
        if (key === 'mapsLink') label = 'Google Maps Link';

        diffs.push({
          key: label,
          orig: displayOrig,
          prop: displayProp,
        });
      }
    });

    // Check photos separately
    const origPhotos = original.photos || [];
    const propPhotos = proposed.photos || [];
    const origUrls = origPhotos.map((p) => p.url).join(',');
    const propUrls = propPhotos.map((p) => p.url).join(',');

    if (origUrls !== propUrls) {
      diffs.push({
        key: 'Photos / Images',
        orig: `${origPhotos.length} Photos`,
        prop: `${propPhotos.length} Photos (updated)`,
      });
    }

    if (diffs.length === 0) {
      return <div style={{ padding: '0.5rem', color: '#6b7280', fontStyle: 'italic' }}>No changes detected in key fields.</div>;
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '0.5rem 0' }}>
        {diffs.map((d, index) => {
          if (d.nested) {
            return (
              <div key={index} style={{ borderBottom: '1px dashed #e5e7eb', paddingBottom: '0.5rem' }}>
                <strong style={{ fontSize: '0.85rem', color: '#4b5563' }}>Rent Rates</strong>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.25rem', paddingLeft: '1rem' }}>
                  {d.nested.map((n, i) => (
                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '0.5rem', fontSize: '0.85rem' }}>
                      <span style={{ color: '#6b7280' }}>{n.type}:</span>
                      <span style={{ textDecoration: 'line-through', color: '#dc2626' }}>{n.orig}</span>
                      <span style={{ color: '#16a34a', fontWeight: 600 }}>{n.prop}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          }

          if (d.isArray) {
            return (
              <div key={index} style={{ borderBottom: '1px dashed #e5e7eb', paddingBottom: '0.5rem', fontSize: '0.85rem' }}>
                <strong style={{ fontSize: '0.85rem', color: '#4b5563' }}>{d.key}</strong>
                <div style={{ marginTop: '0.25rem', display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                  {d.removed.map((r, i) => (
                    <span key={`rem-${i}`} style={{ background: '#fee2e2', color: '#991b1b', textDecoration: 'line-through', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem' }}>
                      -{r}
                    </span>
                  ))}
                  {d.added.map((a, i) => (
                    <span key={`add-${i}`} style={{ background: '#dcfce7', color: '#15803d', fontWeight: 600, padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem' }}>
                      +{a}
                    </span>
                  ))}
                </div>
              </div>
            );
          }

          return (
            <div key={index} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '0.5rem', borderBottom: '1px dashed #e5e7eb', paddingBottom: '0.5rem', fontSize: '0.85rem' }}>
              <strong style={{ color: '#4b5563' }}>{d.key}</strong>
              <span style={{ textDecoration: 'line-through', color: '#dc2626', wordBreak: 'break-all' }}>{d.orig}</span>
              <span style={{ color: '#16a34a', fontWeight: 600, wordBreak: 'break-all' }}>{d.prop}</span>
            </div>
          );
        })}
      </div>
    );
  };

  const getChangedCount = (originalSnapshot = {}, proposedChanges = {}) => {
    const original = originalSnapshot || {};
    const proposed = proposedChanges || {};
    let count = 0;
    
    Object.keys(proposed).forEach((key) => {
      if (['_id', 'id', 'owner', 'createdAt', 'updatedAt', '__v', 'photos'].includes(key)) return;
      if (key === 'rent') {
        const oRent = original.rent || {};
        const pRent = proposed.rent || {};
        ['single', 'double', 'triple'].forEach((t) => {
          if (String(oRent[t] || '') !== String(pRent[t] || '')) count++;
        });
        return;
      }
      if (key === 'facilities') {
        const oArr = original.facilities || [];
        const pArr = proposed.facilities || [];
        const diff = pArr.filter(x => !oArr.includes(x)).length + oArr.filter(x => !pArr.includes(x)).length;
        if (diff > 0) count++;
        return;
      }
      if (String(original[key] || '') !== String(proposed[key] || '')) count++;
    });

    const origPhotos = original.photos || [];
    const propPhotos = proposed.photos || [];
    if (origPhotos.map((p) => p.url).join(',') !== propPhotos.map((p) => p.url).join(',')) count++;

    return count;
  };

  return (
    <PageWrapper title="PG Update Requests" subtitle="Review edits proposed by owners before they go live">
      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid #e5e7eb' }}>
        {STATUS_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '0.5rem 1.25rem',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: 500,
              textTransform: 'capitalize',
              borderBottom: activeTab === tab ? '2px solid #4f46e5' : '2px solid transparent',
              color: activeTab === tab ? '#4f46e5' : '#6b7280',
              transition: 'all 0.15s',
            }}
          >
            {tab.replace('_', ' ')}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card" style={{ height: 100, display: 'flex', alignItems: 'center' }}>
              <div className="skeleton" style={{ width: '40%', height: 20 }} />
              <div className="skeleton" style={{ width: '20%', height: 20, marginLeft: 'auto' }} />
            </div>
          ))}
        </div>
      ) : loadError ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
          <Building2 size={48} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
          <p style={{ marginBottom: '1rem', color: '#b91c1c' }}>{loadError}</p>
          <button className="btn btn-primary" onClick={loadRequests}>Retry</button>
        </div>
      ) : requests.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
          <Building2 size={48} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
          <p>No update requests found in this tab.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {requests.map((req) => {
            const isExpanded = expandedRequestId === req._id;
            const changedFieldsCount = getChangedCount(req.originalSnapshot, req.proposedChanges);

            return (
              <div key={req._id} className="card" style={{ padding: '1.25rem', border: isExpanded ? '1.5px solid #4f46e5' : '1px solid #e5e7eb' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '8px', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                      {req.pg?.photos?.[0]?.url ? (
                        <img src={req.pg.photos[0].url} alt="PG" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <Building2 size={24} color="#9ca3af" />
                      )}
                    </div>
                    <div>
                      <h4 style={{ fontWeight: 600, fontSize: '1rem', color: '#1f2937' }}>{req.pg?.name || 'Unknown PG'}</h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#6b7280', marginTop: '0.125rem' }}>
                        <User size={12} />
                        <span>Owner: {req.owner?.name} ({req.owner?.email})</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span className="badge" style={{ background: '#f3f4f6', color: '#4b5563', border: '1px solid #e5e7eb', margin: 0 }}>
                      {changedFieldsCount} changes
                    </span>
                    <span className={`badge badge-${req.status}`} style={{ margin: 0 }}>
                      {req.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', borderTop: '1px solid #f3f4f6', paddingTop: '0.75rem', fontSize: '0.85rem', color: '#6b7280' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Clock size={14} />
                    <span>Submitted {new Date(req.submittedAt).toLocaleDateString()}</span>
                  </div>

                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => toggleExpand(req._id)}
                    style={{ padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Eye size={13} /> {isExpanded ? 'Hide Changes' : 'View Changes'}
                    {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                  </button>
                </div>

                {isExpanded && (
                  <div style={{ marginTop: '1rem', background: '#f9fafb', borderRadius: '8px', padding: '1rem', border: '1px solid #f3f4f6' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '0.5rem', fontSize: '0.8rem', fontWeight: 600, color: '#4b5563', borderBottom: '2px solid #e5e7eb', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
                      <span>Field Name</span>
                      <span style={{ color: '#b91c1c' }}>Original Value</span>
                      <span style={{ color: '#15803d' }}>Proposed Value</span>
                    </div>

                    {renderDiff(req.originalSnapshot, req.proposedChanges)}

                    {req.adminComment && (
                      <div style={{ marginTop: '1rem', background: '#fff', borderLeft: '4px solid #f59e0b', padding: '0.5rem 0.75rem', borderRadius: '4px', fontSize: '0.85rem' }}>
                        <strong>Comment/Reason:</strong> {req.adminComment}
                      </div>
                    )}

                    {req.status === 'pending' && (
                      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.25rem', borderTop: '1px solid #e5e7eb', paddingTop: '1rem' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => setActionModal({ type: 'correction', id: req._id })}
                          style={{ borderColor: '#d97706', color: '#d97706', background: 'transparent' }}
                        >
                          <AlertCircle size={14} style={{ marginRight: 4 }} /> Request Correction
                        </button>
                        <button
                          className="btn btn-sm"
                          onClick={() => setActionModal({ type: 'reject', id: req._id })}
                          style={{ background: '#fee2e2', color: '#991b1b', border: 'none' }}
                        >
                          <XCircle size={14} style={{ marginRight: 4 }} /> Reject
                        </button>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleApprove(req._id)}
                        >
                          <CheckCircle size={14} style={{ marginRight: 4 }} /> Approve & Apply
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Reject / Correction Modal */}
      {actionModal && (
        <div className="modal-overlay" onClick={() => setActionModal(null)}>
          <div className="modal" style={{ maxWidth: 450 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontWeight: 600, color: '#1f2937' }}>
                {actionModal.type === 'reject' ? 'Reject Proposed Changes' : 'Request Correction / Info'}
              </h3>
              <button onClick={() => setActionModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem' }}>×</button>
            </div>
            <div className="modal-body">
              <label className="label">
                {actionModal.type === 'reject'
                  ? 'Reason for rejection (this will be shown to the owner)'
                  : 'What corrections or missing details are required?'}
              </label>
              <textarea
                className="input"
                rows={4}
                placeholder="Write your comments here..."
                value={actionComment}
                onChange={(e) => setActionComment(e.target.value)}
              />
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setActionModal(null)}>Cancel</button>
              <button
                className={`btn ${actionModal.type === 'reject' ? 'btn-danger' : 'btn-primary'}`}
                style={actionModal.type === 'correction' ? { background: '#f59e0b', border: 'none' } : {}}
                onClick={handleActionSubmit}
              >
                Submit Action
              </button>
            </div>
          </div>
        </div>
      )}
    </PageWrapper>
  );
}
