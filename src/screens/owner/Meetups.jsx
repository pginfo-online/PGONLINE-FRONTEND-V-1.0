import { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, Calendar, MapPin, Send, Clock, CheckCircle2 } from 'lucide-react';
import PageWrapper from '../../components/layout/PageWrapper';
import meetupService from '../../services/meetup.service';
import {
  MIN_MEETUP_IMAGES,
  getMeetupCoverUrl,
  getMeetupStatusLabel,
  canSubmitMeetup,
} from '../../utils/meetupHelpers';

const CATEGORY_COLORS = {
  career: '#4f46e5',
  business: '#10b981',
  community: '#f59e0b',
  educational: '#3b82f6',
  health: '#ef4444',
  social: '#8b5cf6',
  other: '#6b7280',
};

const TABS = ['all', 'draft', 'pending_approval', 'published', 'cancelled'];

const STATUS_BADGE_CLASS = {
  draft: 'badge-draft',
  pending_approval: 'badge-pending',
  published: 'badge-approved',
  cancelled: 'badge-rejected',
  completed: 'badge-primary',
};

export default function Meetups() {
  const [meetups, setMeetups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [publishingId, setPublishingId] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const navigate = useNavigate();

  const loadMeetups = useCallback(async () => {
    setLoading(true);
    try {
      const data = await meetupService.getMy();
      setMeetups(data || []);
    } catch (err) {
      toast.error('Failed to load meetups: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMeetups();
  }, [loadMeetups]);

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this meetup?')) return;
    try {
      await meetupService.remove(id);
      toast.success('Meetup deleted successfully');
      setMeetups((prev) => prev.filter((m) => m._id !== id));
    } catch (err) {
      toast.error('Failed to delete meetup: ' + err.message);
    }
  };

  const handleSubmitForApproval = async (meetup) => {
    if (!canSubmitMeetup(meetup)) {
      toast.error(`Please upload at least ${MIN_MEETUP_IMAGES} photos before submitting`);
      navigate(`/owner/meetups/${meetup._id}/edit`);
      return;
    }

    const confirmed = confirm(
      'Submit this meetup for admin approval?\n\nIt will go live only after an admin approves it, similar to PG listings.'
    );
    if (!confirmed) return;

    setPublishingId(meetup._id);
    try {
      const updated = await meetupService.publish(meetup._id);
      toast.success('Submitted for admin approval!');
      setMeetups((prev) => prev.map((m) => (m._id === meetup._id ? updated : m)));
    } catch (err) {
      toast.error(err.message || 'Failed to submit meetup');
    } finally {
      setPublishingId(null);
    }
  };

  const filteredMeetups = useMemo(() => {
    if (activeTab === 'all') return meetups;
    return meetups.filter((m) => m.status === activeTab);
  }, [meetups, activeTab]);

  const headerAction = (
    <button className="btn btn-primary" onClick={() => navigate('/owner/meetups/create')}>
      <Plus size={16} /> Create Meetup
    </button>
  );

  return (
    <PageWrapper title="My Meetups" subtitle="Manage events — live after admin approval" action={headerAction}>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid #e5e7eb', flexWrap: 'wrap' }}>
        {TABS.map((tab) => (
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
        <div className="grid-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card">
              <div className="skeleton" style={{ height: 140, borderRadius: 8, marginBottom: '12px' }} />
              <div className="skeleton" style={{ height: 18, width: '70%', marginBottom: '8px' }} />
              <div className="skeleton" style={{ height: 14, width: '40%' }} />
            </div>
          ))}
        </div>
      ) : filteredMeetups.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
          <Calendar size={48} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
          <p style={{ marginBottom: '1rem' }}>No meetups found in this tab.</p>
          <button className="btn btn-primary" onClick={() => navigate('/owner/meetups/create')}>
            <Plus size={16} /> Create Your First Meetup
          </button>
        </div>
      ) : (
        <div className="grid-3">
          {filteredMeetups.map((meetup) => {
            const catColor = CATEGORY_COLORS[meetup.category] || '#6b7280';
            const coverUrl = getMeetupCoverUrl(meetup);
            const statusLabel = getMeetupStatusLabel(meetup);
            const badgeClass = STATUS_BADGE_CLASS[meetup.status] || 'badge-draft';
            const isLive = meetup.status === 'published' && meetup.isAdminApproved;
            const isPending = meetup.status === 'pending_approval';
            const canSubmit = meetup.status === 'draft' && canSubmitMeetup(meetup);
            const needsPhotos = meetup.status === 'draft' && !canSubmitMeetup(meetup);

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
                  <span className={`badge ${badgeClass}`} style={{ position: 'absolute', top: '12px', left: '12px', margin: 0 }}>
                    {statusLabel}
                  </span>
                  {isLive && (
                    <span className="badge badge-approved" style={{ position: 'absolute', top: '12px', right: '12px', margin: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <CheckCircle2 size={11} /> Live
                    </span>
                  )}
                  {isPending && (
                    <span className="badge badge-pending" style={{ position: 'absolute', top: '12px', right: '12px', margin: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={11} /> Review
                    </span>
                  )}
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
                      <span>{new Date(meetup.startDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} at {meetup.startTime || 'TBD'}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#4b5563', marginBottom: '12px' }}>
                      <MapPin size={13} color="#dc2626" />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {meetup.location?.name || 'TBD'}, {meetup.location?.city}
                      </span>
                    </div>
                    {(meetup.images?.length || 0) > 0 && (
                      <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '8px' }}>
                        {meetup.images.length} photo{meetup.images.length !== 1 ? 's' : ''} uploaded
                      </p>
                    )}
                    <div style={{ display: 'flex', gap: '1rem', borderTop: '1px solid #f3f4f6', paddingTop: '10px', marginBottom: '12px' }}>
                      <div style={{ textAlign: 'center', flex: 1 }}>
                        <div style={{ fontSize: '1rem', fontWeight: 700, color: '#4f46e5' }}>{meetup.goingCount || 0}</div>
                        <div style={{ fontSize: '0.7rem', color: '#9ca3af', textTransform: 'uppercase' }}>Going</div>
                      </div>
                      <div style={{ textAlign: 'center', flex: 1, borderLeft: '1px solid #f3f4f6' }}>
                        <div style={{ fontSize: '1rem', fontWeight: 700, color: '#f59e0b' }}>{meetup.interestedCount || 0}</div>
                        <div style={{ fontSize: '0.7rem', color: '#9ca3af', textTransform: 'uppercase' }}>Interested</div>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto', flexWrap: 'wrap' }}>
                    {canSubmit && (
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', minWidth: 120 }}
                        onClick={() => handleSubmitForApproval(meetup)}
                        disabled={publishingId === meetup._id}
                        aria-busy={publishingId === meetup._id}
                      >
                        <Send size={13} /> {publishingId === meetup._id ? 'Submitting…' : 'Submit for Approval'}
                      </button>
                    )}
                    {needsPhotos && (
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, background: '#fffbeb', color: '#b45309', border: '1px solid #fcd34d', minWidth: 120 }}
                        onClick={() => navigate(`/owner/meetups/${meetup._id}/edit`)}
                      >
                        Add Photos ({meetup.images?.length || 0}/{MIN_MEETUP_IMAGES})
                      </button>
                    )}
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, minWidth: 80 }}
                      onClick={() => navigate(`/owner/meetups/${meetup._id}/edit`)}
                    >
                      <Edit size={13} /> Edit
                    </button>
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
