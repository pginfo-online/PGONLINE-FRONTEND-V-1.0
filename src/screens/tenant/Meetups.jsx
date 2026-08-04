import { useEffect, useState } from 'react';
import { Calendar, Clock, MapPin, User, Users, Star, CheckCircle, ExternalLink, X, ArrowUpRight } from 'lucide-react';
import TenantNavbar from '../../components/layout/TenantNavbar';
import meetupService from '../../services/meetup.service';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

const CATEGORY_COLORS = {
  career: 'bg-sky-50 border-sky-100 text-sky-700',
  business: 'bg-purple-50 border-purple-100 text-purple-700',
  community: 'bg-emerald-50 border-emerald-100 text-emerald-700',
  educational: 'bg-orange-50 border-orange-100 text-orange-700',
  health: 'bg-teal-50 border-teal-100 text-teal-700',
  social: 'bg-pink-50 border-pink-100 text-pink-700',
  other: 'bg-slate-100 border-slate-200 text-slate-700',
};

const CATEGORIES = ['all', 'career', 'business', 'community', 'educational', 'health', 'social', 'other'];

export default function Meetups() {
  const { user } = useAuthStore();
  const [meetups, setMeetups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');

  // Detail Modal State
  const [selectedMeetup, setSelectedMeetup] = useState(null);
  const [rsvpLoading, setRsvpLoading] = useState(false);

  useEffect(() => {
    fetchMeetups();
  }, [activeCategory]);

  const fetchMeetups = async () => {
    setLoading(true);
    try {
      const params = {};
      if (activeCategory !== 'all') {
        params.category = activeCategory;
      }
      const res = await meetupService.getAll(params);
      setMeetups(res.data || res.meetups || []);
    } catch (err) {
      toast.error(err.message || 'Error loading meetups');
    } finally {
      setLoading(false);
    }
  };

  const handleRSVP = async (meetupId, status) => {
    if (rsvpLoading) return;
    setRsvpLoading(true);
    try {
      const res = await meetupService.rsvp(meetupId, status);
      
      // Update local state for meetups list
      setMeetups((prev) =>
        prev.map((m) => (m._id === meetupId ? { ...m, rsvpList: res.rsvpList } : m))
      );

      // Update active selected modal if open
      if (selectedMeetup && selectedMeetup._id === meetupId) {
        setSelectedMeetup((prev) => ({ ...prev, rsvpList: res.rsvpList }));
      }

      toast.success('RSVP updated successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to update RSVP');
    } finally {
      setRsvpLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      <TenantNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28">
        
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Community Meetups</h1>
            <p className="text-sm text-brand-text-muted mt-1">Join events organized by PG communities, network, and grow.</p>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none border-b border-slate-100">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold capitalize transition-all border shrink-0 ${
                  isActive
                    ? 'bg-brand-primary text-white border-brand-primary shadow-sm'
                    : 'bg-white text-slate-650 border-brand-border hover:bg-slate-50'
                }`}
              >
                {cat === 'all' ? 'All Events' : cat}
              </button>
            );
          })}
        </div>

        {loading ? (
          /* Skeletons */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, idx) => (
              <div key={idx} className="bg-white rounded-2xl border border-brand-border overflow-hidden shadow-sm animate-pulse">
                <div className="h-44 bg-slate-200" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-slate-200 rounded w-2/3" />
                  <div className="h-3 bg-slate-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : meetups.length === 0 ? (
          /* Empty State */
          <div className="bg-white border border-brand-border rounded-2xl p-12 text-center shadow-sm max-w-lg mx-auto">
            <div className="w-16 h-16 bg-blue-50 text-brand-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <Users size={28} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No meetups found</h3>
            <p className="text-sm text-brand-text-muted mt-1 max-w-xs mx-auto">
              There are no community meetups scheduled for this category right now. Check back soon!
            </p>
          </div>
        ) : (
          /* Meetups Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {meetups.map((meetup) => {
              const coverImg = meetup.photos?.[0]?.url || 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80';
              const catClass = CATEGORY_COLORS[meetup.category] || CATEGORY_COLORS.other;
              
              const goingCount = meetup.rsvpList?.filter((r) => r.status === 'going').length || 0;
              const interestedCount = meetup.rsvpList?.filter((r) => r.status === 'interested').length || 0;

              return (
                <div
                  key={meetup._id}
                  onClick={() => setSelectedMeetup(meetup)}
                  className="bg-white rounded-2xl border border-brand-border overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col"
                >
                  <div className="relative h-44 bg-slate-900 overflow-hidden">
                    <img
                      src={coverImg}
                      alt={meetup.title}
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

                    <span className={`absolute top-3 left-3 text-[10px] font-extrabold tracking-wider px-2.5 py-0.75 rounded-md uppercase border ${catClass}`}>
                      {meetup.category}
                    </span>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-1.5">
                      <h3 className="font-bold text-base text-slate-900 group-hover:text-brand-primary transition-colors line-clamp-1">
                        {meetup.title}
                      </h3>
                      
                      <div className="flex items-center gap-1.5 text-xs text-brand-text-muted">
                        <Calendar size={13} className="text-slate-400" />
                        <span>{formatDate(meetup.startDate)}</span>
                      </div>
                      
                      <div className="flex items-center gap-1.5 text-xs text-brand-text-muted">
                        <MapPin size={13} className="text-slate-400" />
                        <span className="truncate">{meetup.location?.name || 'Community Hall'}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs font-semibold text-slate-650">
                      <div className="flex gap-3">
                        <span><strong>{goingCount}</strong> Going</span>
                        <span><strong>{interestedCount}</strong> Interested</span>
                      </div>
                      <span className="text-brand-primary font-bold flex items-center gap-0.5">
                        Details
                        <ArrowUpRight size={14} />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Meetup Detail Modal */}
      {selectedMeetup && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setSelectedMeetup(null)}
          />

          {/* Modal Container */}
          <div className="bg-white rounded-3xl border border-brand-border overflow-hidden shadow-2xl w-full max-w-2xl transform animate-in zoom-in-95 duration-200 relative z-10 max-h-[90vh] flex flex-col">
            
            {/* Header Close */}
            <button
              onClick={() => setSelectedMeetup(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white transition-all z-20"
            >
              <X size={16} />
            </button>

            {/* Modal Body */}
            <div className="overflow-y-auto flex-1">
              
              {/* Cover Banner */}
              <div className="relative h-60 bg-slate-900">
                <img
                  src={selectedMeetup.photos?.[0]?.url || 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80'}
                  alt={selectedMeetup.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent pointer-events-none" />
                
                <span className={`absolute top-4 left-4 text-[10px] font-extrabold tracking-wider px-2.5 py-0.75 rounded-md uppercase border ${
                  CATEGORY_COLORS[selectedMeetup.category] || CATEGORY_COLORS.other
                }`}>
                  {selectedMeetup.category}
                </span>
              </div>

              {/* Content details */}
              <div className="p-6 space-y-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-snug">{selectedMeetup.title}</h2>
                  <div className="flex gap-4 text-xs font-semibold text-brand-text-muted mt-2">
                    <span>{selectedMeetup.analytics?.views || 0} views</span>
                    <span>•</span>
                    <span>
                      RSVPs: {selectedMeetup.rsvpList?.filter((r) => r.status === 'going').length || 0} Going,{' '}
                      {selectedMeetup.rsvpList?.filter((r) => r.status === 'interested').length || 0} Interested
                    </span>
                  </div>
                </div>

                {/* Date / Time / Location columns */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-b border-slate-100 py-4">
                  <div className="flex gap-3 items-start">
                    <div className="w-9 h-9 rounded-xl bg-blue-50/50 border border-blue-100 flex items-center justify-center text-brand-primary shrink-0">
                      <Calendar size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase">Date & Time</p>
                      <p className="text-sm font-bold text-slate-800 mt-0.5">{formatDate(selectedMeetup.startDate)}</p>
                      {selectedMeetup.startTime && (
                        <p className="text-xs text-brand-text-muted">
                          {selectedMeetup.startTime} {selectedMeetup.endTime ? `to ${selectedMeetup.endTime}` : ''}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3 items-start">
                    <div className="w-9 h-9 rounded-xl bg-blue-50/50 border border-blue-100 flex items-center justify-center text-brand-primary shrink-0">
                      <MapPin size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold text-slate-500 uppercase">Location</p>
                      <p className="text-sm font-bold text-slate-800 mt-0.5 truncate">{selectedMeetup.location?.name || 'Community Hall'}</p>
                      {selectedMeetup.location?.address && (
                        <p className="text-xs text-brand-text-muted truncate">{selectedMeetup.location.address}</p>
                      )}
                      {selectedMeetup.location?.mapsLink && (
                        <a
                          href={selectedMeetup.location.mapsLink}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-0.5 text-xs text-brand-primary font-bold mt-1"
                        >
                          View Map Directions
                          <ExternalLink size={11} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Organizer */}
                {selectedMeetup.organizer && (
                  <div className="flex gap-3 items-center bg-slate-50 p-4 rounded-2xl border border-brand-border">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
                      {selectedMeetup.organizer.name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase">Organizer / Host</p>
                      <p className="text-sm font-bold text-slate-800">{selectedMeetup.organizer.name || 'PG Owner'}</p>
                      {selectedMeetup.organizer.pg && (
                        <p className="text-xs text-slate-500">Host PG: {selectedMeetup.organizer.pg.name}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Description */}
                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">About the Event</h4>
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                    {selectedMeetup.description || 'No description provided.'}
                  </p>
                </div>

                {/* Tags */}
                {selectedMeetup.tags && selectedMeetup.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {selectedMeetup.tags.map((tag) => (
                      <span key={tag} className="text-xs font-semibold text-brand-text-muted bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* RSVPs attendees list */}
                {selectedMeetup.rsvpList && selectedMeetup.rsvpList.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Who's Joining</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedMeetup.rsvpList.map((rsvp, rIdx) => {
                        const nameChar = rsvp.user?.name?.[0]?.toUpperCase() || 'U';
                        return (
                          <div
                            key={rsvp._id || rIdx}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-brand-border bg-slate-50"
                            title={`${rsvp.user?.name} (${rsvp.status})`}
                          >
                            <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-bold">
                              {nameChar}
                            </div>
                            <span className="text-xs font-semibold text-slate-750 max-w-[80px] truncate">{rsvp.user?.name}</span>
                            <span className={`w-1.5 h-1.5 rounded-full ${rsvp.status === 'going' ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* Modal RSVP Footer */}
            <div className="p-6 border-t border-brand-border bg-slate-50 flex gap-3">
              {(() => {
                const userRsvp = selectedMeetup.rsvpList?.find(
                  (r) => (r.user?._id || r.user) === user?._id
                );
                const isInterested = userRsvp?.status === 'interested';
                const isGoing = userRsvp?.status === 'going';

                return (
                  <>
                    <button
                      onClick={() => handleRSVP(selectedMeetup._id, 'interested')}
                      disabled={rsvpLoading}
                      className={`flex-1 py-3 text-sm font-bold rounded-xl border flex items-center justify-center gap-1.5 transition-all shadow-sm ${
                        isInterested
                          ? 'bg-amber-500 border-amber-500 text-white'
                          : 'bg-white text-slate-700 border-brand-border hover:bg-slate-50'
                      }`}
                    >
                      <Star size={16} className={isInterested ? 'fill-white' : ''} />
                      {isInterested ? 'Interested!' : 'Interested'}
                    </button>
                    
                    <button
                      onClick={() => handleRSVP(selectedMeetup._id, 'going')}
                      disabled={rsvpLoading}
                      className={`flex-1 py-3 text-sm font-bold rounded-xl border flex items-center justify-center gap-1.5 transition-all shadow-sm ${
                        isGoing
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'bg-slate-900 border-slate-900 text-white hover:bg-slate-800'
                      }`}
                    >
                      <CheckCircle size={16} />
                      {isGoing ? 'Going!' : 'Mark Going'}
                    </button>
                  </>
                );
              })()}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
