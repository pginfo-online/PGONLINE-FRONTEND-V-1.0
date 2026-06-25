import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Calendar, Trash2, ShieldCheck, ShieldAlert, User, MapPin, ImageIcon } from 'lucide-react';
import PageWrapper from '../../components/layout/PageWrapper';
import meetupService from '../../services/meetup.service';
import { getMeetupCoverUrl, MIN_MEETUP_IMAGES } from '../../utils/meetupHelpers';

const CATEGORY_COLORS = {
  career: '#4f46e5',
  business: '#10b981',
  community: '#f59e0b',
  educational: '#3b82f6',
  health: '#ef4444',
  social: '#8b5cf6',
  other: '#6b7280',
};

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'pending_approval', label: 'Pending Approval' },
  { key: 'published', label: 'Live' },
  { key: 'draft', label: 'Drafts' },
];

export default function MeetupManagement() {
  const [meetups, setMeetups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [approvingId, setApprovingId] = useState(null);
  const [activeTab, setActiveTab] = useState('pending_approval');

  const loadMeetups = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await meetupService.adminGetAll({
        status: activeTab === 'all' ? undefined : activeTab,
        limit: 50,
      });
      setMeetups(Array.isArray(data.meetups) ? data.meetups : []);
    } catch (err) {
      const message = err.message || 'Unable to load meetups';
      setLoadError(message);
      setMeetups([]);
      toast.error('Failed to load meetups: ' + message);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    loadMeetups();
  }, [loadMeetups]);

  const handleToggleApproval = async (meetup, approve) => {
    if (approve && (meetup.images?.length || 0) < MIN_MEETUP_IMAGES) {
      toast.error(`Meetup needs at least ${MIN_MEETUP_IMAGES} photos before approval`);
      return;
    }

    setApprovingId(meetup._id);
    try {
      const res = await meetupService.adminToggleApproval(meetup._id, approve);
      toast.success(res.isAdminApproved ? 'Meetup approved and is now live!' : 'Meetup approval revoked');
      setMeetups((prev) => prev.map((m) => (m._id === meetup._id ? res : m)));
    } catch (err) {
      toast.error(err.message || 'Failed to update approval');
    } finally {
      setApprovingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to permanently delete this meetup?')) return;
    try {
      await meetupService.adminDelete(id);
      toast.success('Meetup deleted successfully');
      setMeetups((prev) => prev.filter((m) => m._id !== id));
    } catch (err) {
      toast.error('Failed to delete meetup: ' + err.message);
    }
  };

  return (
    <PageWrapper title="Meetup Management" subtitle="Review and approve community meetups before they go live">
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid #e5e7eb', flexWrap: 'wrap' }}>
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '0.5rem 1.25rem',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: 500,
              borderBottom: activeTab === tab.key ? '2px solid #4f46e5' : '2px solid transparent',
              color: activeTab === tab.key ? '#4f46e5' : '#6b7280',
              transition: 'all 0.15s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card">
              <div className="skeleton" style={{ height: 140, borderRadius: 8, marginBottom: '12px' }} />
              <div className="skeleton" style={{ height: 18, width: '70%', marginBottom: '8px' }} />
            </div>
          ))}
        </div>
      ) : loadError ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
          <Calendar size={48} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
          <p style={{ marginBottom: '1rem', color: '#b91c1c' }}>{loadError}</p>
          <button className="btn btn-primary" onClick={loadMeetups}>Retry</button>
        </div>
      ) : meetups.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
          <Calendar size={48} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
          <p>No meetups in this category.</p>
        </div>
      ) : (
        <div className="grid-3">
          {meetups.map((meetup) => {
            const catColor = CATEGORY_COLORS[meetup.category] || '#6b7280';
            const coverUrl = getMeetupCoverUrl(meetup);
            const photoCount = meetup.images?.length || 0;
            const canApprove = photoCount >= MIN_MEETUP_IMAGES && !meetup.isAdminApproved;

            return (
              <div key={meetup._id} className="pg-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div style={{
                  position: 'relative',
                  height: '140px',
                  background: coverUrl
                    ? `url(${coverUrl}) center/cover`
                    : `linear-gradient(135deg, ${catColor}, ${catColor}dd)`,
                  display: 'flex',
                  alignItems: 'flex-end',
                  padding: '10px',
                }}>
                  <span className={`badge badge-${meetup.status === 'pending_approval' ? 'pending' : meetup.status === 'published' ? 'approved' : 'draft'}`} style={{ position: 'absolute', top: '12px', left: '12px', margin: 0 }}>
                    {meetup.status.replace('_', ' ')}
                  </span>
                  <span className="badge" style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    margin: 0,
                    background: meetup.isAdminApproved ? '#dcfce7' : '#fee2e2',
                    color: meetup.isAdminApproved ? '#15803d' : '#b91c1c',
                    border: 'none',
                  }}>
                    {meetup.isAdminApproved ? '✓ Live' : '⏳ Pending'}
                  </span>
                  <div style={{ color: 'white', textShadow: '0 2px 4px rgba(0,0,0,0.5)', width: '100%' }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {meetup.title}
                    </div>
                  </div>
                </div>

                <div className="pg-card-body" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#4b5563', marginBottom: '6px' }}>
                      <Calendar size={13} color="#4f46e5" />
                      <span>{new Date(meetup.startDate).toLocaleDateString()} at {meetup.startTime || 'TBD'}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#4b5563', marginBottom: '6px' }}>
                      <MapPin size={13} color="#dc2626" />
                      <span>{meetup.location?.name || 'TBD'}, {meetup.location?.city}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#4b5563', marginBottom: '6px' }}>
                      <User size={13} color="#10b981" />
                      <span>By: {meetup.createdBy?.name || 'Owner'}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: photoCount >= MIN_MEETUP_IMAGES ? '#059669' : '#b45309', marginBottom: '12px' }}>
                      <ImageIcon size={13} />
                      <span>{photoCount} / {MIN_MEETUP_IMAGES}+ photos</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                    {meetup.isAdminApproved ? (
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, background: '#fff1f2', color: '#be123c', borderColor: '#fca5a5' }}
                        onClick={() => handleToggleApproval(meetup, false)}
                        disabled={approvingId === meetup._id}
                      >
                        <ShieldAlert size={13} /> Revoke
                      </button>
                    ) : (
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{
                          flex: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 4,
                          background: canApprove ? '#ecfdf5' : '#f3f4f6',
                          color: canApprove ? '#047857' : '#9ca3af',
                          borderColor: canApprove ? '#a7f3d0' : '#e5e7eb',
                          cursor: canApprove ? 'pointer' : 'not-allowed',
                        }}
                        onClick={() => canApprove && handleToggleApproval(meetup, true)}
                        disabled={!canApprove || approvingId === meetup._id}
                        title={!canApprove ? `Needs ${MIN_MEETUP_IMAGES}+ photos` : 'Approve and go live'}
                      >
                        <ShieldCheck size={13} /> {approvingId === meetup._id ? 'Approving…' : 'Approve & Go Live'}
                      </button>
                    )}
                    <button
                      className="btn btn-sm"
                      style={{ background: '#fee2e2', color: '#dc2626', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      onClick={() => handleDelete(meetup._id)}
                      aria-label="Delete meetup"
                    >
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
