import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Heart, Share2, Shield, MapPin, Phone, MessageCircle, Calendar, Clock, Wifi, Compass, AlertCircle, Check, ExternalLink } from 'lucide-react';
import TenantNavbar from '../../components/layout/TenantNavbar';
import pgService from '../../services/pg.service';
import { leadService, visitService } from '../../services/lead.service';
import useAuthStore from '../../store/authStore';
import useWishlistStore from '../../store/wishlistStore';
import toast from 'react-hot-toast';

const FACILITY_ICONS = {
  WiFi: Wifi,
  Laundry: Compass, // fallbacks
  Parking: Compass,
  Gym: Compass,
  CCTV: Shield,
  'Power Backup': Compass,
  'Hot Water': Compass,
  Housekeeping: Compass,
  TV: Compass,
  Refrigerator: Compass,
  'RO Water': Compass,
  'Study Room': Compass,
  Lift: Compass,
  'Security Guard': Shield,
  'Kitchen Access': Compass,
};

const TIME_SLOTS = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM',
  '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM',
  '06:00 PM', '06:30 PM', '07:00 PM', '07:30 PM', '08:00 PM'
];

export default function PGDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const { isWishlisted, toggleWishlist } = useWishlistStore();

  const [pg, setPg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activePhoto, setActivePhoto] = useState(0);

  // Booking state
  const [visitDate, setVisitDate] = useState('');
  const [visitTime, setVisitTime] = useState('');
  const [visitMessage, setVisitMessage] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [showContactDetails, setShowContactDetails] = useState(false);

  useEffect(() => {
    fetchPGDetails();
  }, [id]);

  const fetchPGDetails = async () => {
    setLoading(true);
    try {
      const data = await pgService.getById(id);
      setPg(data);
    } catch (err) {
      toast.error('Property not found');
      navigate('/explore');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleWishlist = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to shortlist listings');
      navigate('/login');
      return;
    }
    try {
      await toggleWishlist(pg._id);
      toast.success(isWishlisted(pg._id) ? 'Removed from wishlist' : 'Added to wishlist');
    } catch (err) {
      toast.error('Failed to update wishlist');
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  const handleBookVisit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please login to book a property visit');
      navigate('/login');
      return;
    }

    if (!visitDate) {
      toast.error('Please select a visit date');
      return;
    }

    const selectedDate = new Date(visitDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      toast.error('Visit date cannot be in the past');
      return;
    }

    if (!visitTime) {
      toast.error('Please select a time slot');
      return;
    }

    setBookingLoading(true);
    try {
      await visitService.createVisit({
        pgId: pg._id,
        scheduledDate: visitDate,
        scheduledTime: visitTime,
        message: visitMessage,
      });
      toast.success('Property visit requested successfully!');
      setVisitDate('');
      setVisitTime('');
      setVisitMessage('');
      navigate('/visits');
    } catch (err) {
      toast.error(err.message || 'Failed to request visit');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleContactOwner = async (type) => {
    if (!isAuthenticated) {
      toast.error('Please login to contact property owners');
      navigate('/login');
      return;
    }

    try {
      // Log Inquiry Lead on the backend
      await leadService.addLead(pg._id, 'inquiry', `Contacted via ${type}`);
    } catch (e) {
      // Fail silently for logging
    }

    setShowContactDetails(true);
    if (type === 'whatsapp' && pg.contactWhatsapp) {
      window.open(`https://wa.me/91${pg.contactWhatsapp.replace(/\D/g, '')}`, '_blank');
    } else if (type === 'phone' && pg.contactPhone) {
      window.open(`tel:${pg.contactPhone}`, '_self');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-500 font-semibold text-sm">Loading property details...</p>
        </div>
      </div>
    );
  }

  if (!pg) return null;

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      <TenantNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28">
        
        {/* Navigation Action header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm font-bold text-slate-650 hover:text-slate-900 hover:bg-slate-100 px-3.5 py-2 rounded-xl transition-all"
          >
            <ArrowLeft size={18} />
            Back to results
          </button>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2.5 rounded-xl border border-brand-border bg-white hover:bg-slate-50 text-slate-600 transition-all shadow-sm"
              title="Share Link"
            >
              <Share2 size={18} />
            </button>
            <button
              onClick={handleToggleWishlist}
              className="p-2.5 rounded-xl border border-brand-border bg-white hover:bg-slate-50 text-slate-600 transition-all shadow-sm"
              title="Add to Shortlist"
            >
              <Heart
                size={18}
                className={isWishlisted(pg._id) ? 'fill-red-500 text-red-500' : ''}
              />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Left Column: Details */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Gallery Card */}
            <div className="bg-white border border-brand-border rounded-3xl overflow-hidden shadow-sm p-4">
              
              {/* Active Image Box */}
              <div className="relative h-64 sm:h-96 bg-slate-900 rounded-2xl overflow-hidden">
                <img
                  src={pg.photos?.[activePhoto]?.url || 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80'}
                  alt={pg.name}
                  className="w-full h-full object-cover"
                />

                {pg.isVerified && (
                  <div className="absolute top-4 left-4 flex items-center gap-1 bg-emerald-500 text-white text-[10px] font-extrabold px-3 py-1 rounded-full shadow">
                    <Shield size={12} className="fill-white/10" />
                    <span>VERIFIED LISTING</span>
                  </div>
                )}
              </div>

              {/* Thumbnails Row */}
              {pg.photos?.length > 1 && (
                <div className="flex items-center gap-3 overflow-x-auto mt-4 pb-1">
                  {pg.photos.map((item, idx) => (
                    <button
                      key={item._id || idx}
                      onClick={() => setActivePhoto(idx)}
                      className={`relative w-20 h-16 rounded-xl overflow-hidden border-2 shrink-0 ${
                        idx === activePhoto ? 'border-brand-primary' : 'border-transparent hover:border-slate-350'
                      }`}
                    >
                      <img src={item.url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Core Info */}
            <div className="bg-white border border-brand-border rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs font-bold tracking-wider px-2.5 py-0.75 rounded-md uppercase border ${
                    pg.gender === 'male'
                      ? 'text-blue-600 bg-blue-50 border-blue-100'
                      : pg.gender === 'female'
                      ? 'text-pink-600 bg-pink-50 border-pink-100'
                      : 'text-purple-600 bg-purple-50 border-purple-100'
                  }`}>
                    {pg.gender === 'any' ? 'Co-Ed Accommodation' : `${pg.gender} candidates only`}
                  </span>
                  
                  {pg.ac && (
                    <span className="text-xs font-bold text-slate-650 bg-slate-100 px-2.5 py-0.75 rounded-md border border-slate-200">
                      Air Conditioning
                    </span>
                  )}
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">{pg.name}</h1>
                
                <div className="flex items-start gap-1 text-sm text-brand-text-muted mt-2">
                  <MapPin size={16} className="text-slate-400 shrink-0 mt-0.5" />
                  <span>{pg.address}, {pg.area}, {pg.city}</span>
                </div>
              </div>

              {/* Sharing Details table */}
              <div className="border-t border-slate-100 pt-6">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Sharing Pricing & Options</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {Object.entries(pg.rent || {}).map(([type, price]) => {
                    if (!price) return null;
                    return (
                      <div key={type} className="border border-brand-border rounded-2xl p-4 bg-slate-50/50 hover:bg-slate-50 transition-all">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider capitalize">{type} Sharing</p>
                        <p className="text-xl font-extrabold text-brand-primary mt-1">₹{price}<span className="text-xs font-normal text-slate-500">/mo</span></p>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 mt-2">
                          <Check size={12} />
                          <span>Immediate Move-In</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Description */}
              {pg.description && (
                <div className="border-t border-slate-100 pt-6 space-y-2">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">About this Accommodation</h3>
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{pg.description}</p>
                </div>
              )}

              {/* Amenities */}
              {pg.facilities?.length > 0 && (
                <div className="border-t border-slate-100 pt-6 space-y-4">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Amenities Provided</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {pg.facilities.map((fac) => {
                      const Icon = FACILITY_ICONS[fac] || Compass;
                      return (
                        <div key={fac} className="flex items-center gap-2.5 text-sm text-slate-750 font-medium">
                          <div className="w-8 h-8 rounded-lg bg-blue-50/50 border border-blue-100 flex items-center justify-center text-brand-primary shrink-0">
                            <Icon size={16} />
                          </div>
                          <span>{fac}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Maps Location Actions */}
              {(pg.mapsLink || (pg.latitude && pg.longitude)) && (
                <div className="border-t border-slate-100 pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Location & Navigation</h3>
                    <p className="text-xs text-brand-text-muted mt-0.5">Explore transit links and nearby points of interest</p>
                  </div>
                  {pg.mapsLink && (
                    <button
                      onClick={() => window.open(pg.mapsLink, '_blank')}
                      className="inline-flex items-center justify-center gap-1.5 px-4.5 py-2.5 rounded-xl border border-brand-border hover:bg-slate-50 font-bold text-sm text-slate-750 transition-all shadow-sm"
                    >
                      Open Google Maps
                      <ExternalLink size={14} />
                    </button>
                  )}
                </div>
              )}

            </div>
          </div>

          {/* Right Column: Sticky visit scheduler widget */}
          <div className="space-y-6 lg:sticky lg:top-28">
            
            {/* Direct owner Contact details */}
            <div className="bg-white border border-brand-border rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Contact Property Owner</h3>
              <p className="text-xs text-brand-text-muted">Connect directly to confirm availability or ask questions.</p>

              {showContactDetails ? (
                <div className="bg-slate-50 border border-brand-border rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-550 border-b border-slate-100 pb-2">
                    <span>Direct Owner Contact</span>
                    <span className="font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">Verified</span>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Owner Name</p>
                    <p className="text-sm font-bold text-slate-850">{pg.owner?.name}</p>
                  </div>
                  {pg.contactPhone && (
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Phone</p>
                      <p className="text-sm font-bold text-slate-850">{pg.contactPhone}</p>
                    </div>
                  )}
                  {pg.contactWhatsapp && (
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">WhatsApp</p>
                      <p className="text-sm font-bold text-slate-850">{pg.contactWhatsapp}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handleContactOwner('phone')}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-brand-primary text-white font-bold text-sm shadow hover:bg-brand-primary/95 transition-all shadow-blue-500/10"
                  >
                    <Phone size={16} />
                    Call Owner
                  </button>
                  {pg.contactWhatsapp && (
                    <button
                      onClick={() => handleContactOwner('whatsapp')}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 text-white font-bold text-sm shadow hover:bg-emerald-700 transition-all shadow-emerald-500/10"
                    >
                      <MessageCircle size={16} />
                      WhatsApp Chat
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Visit scheduler card */}
            <div className="bg-white border border-brand-border rounded-3xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Calendar size={18} className="text-brand-primary" />
                Schedule Property Visit
              </h3>

              <form onSubmit={handleBookVisit} className="space-y-4">
                
                {/* Date Picker */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Visit Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      min={todayStr}
                      value={visitDate}
                      onChange={(e) => setVisitDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-brand-border rounded-xl outline-none font-semibold text-slate-850 bg-slate-50"
                      required
                    />
                  </div>
                </div>

                {/* Time picker list */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center justify-between">
                    <span>Available Slot</span>
                    {visitTime && <span className="text-brand-primary font-bold">{visitTime}</span>}
                  </label>
                  
                  <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto border border-brand-border rounded-xl p-2 bg-slate-50/50">
                    {TIME_SLOTS.map((slot) => {
                      const isSelected = visitTime === slot;
                      return (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setVisitTime(slot)}
                          className={`py-1.5 text-[10px] font-bold rounded-lg border transition-all ${
                            isSelected
                              ? 'bg-brand-primary text-white border-brand-primary shadow-sm'
                              : 'bg-white text-slate-650 border-brand-border hover:bg-slate-50'
                          }`}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Optional Message */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Message for Owner (Optional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g. I will visit with my parents around..."
                    value={visitMessage}
                    onChange={(e) => setVisitMessage(e.target.value)}
                    className="w-full px-3.5 py-2 border border-brand-border rounded-xl outline-none text-slate-850 bg-slate-50 text-sm font-medium"
                  />
                </div>

                {/* Button */}
                <button
                  type="submit"
                  disabled={bookingLoading}
                  className="w-full flex items-center justify-center gap-1.5 py-3 rounded-xl bg-slate-900 hover:bg-slate-850 text-white font-bold text-sm shadow-md transition-all mt-4"
                >
                  {bookingLoading ? 'Requesting Visit...' : 'Book Free Property Visit'}
                </button>
              </form>
            </div>

          </div>

        </div>

      </main>
    </div>
  );
}
