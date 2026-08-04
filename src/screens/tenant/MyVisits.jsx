import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, Phone, User, CheckCircle, XCircle, ChevronRight, Info } from 'lucide-react';
import TenantNavbar from '../../components/layout/TenantNavbar';
import { visitService } from '../../services/lead.service';
import toast from 'react-hot-toast';

const STATUS_STYLING = {
  pending: { bg: 'bg-amber-50 border-amber-100 text-amber-700', icon: Clock },
  confirmed: { bg: 'bg-emerald-50 border-emerald-100 text-emerald-700', icon: CheckCircle },
  cancelled: { bg: 'bg-red-50 border-red-100 text-red-700', icon: XCircle },
  completed: { bg: 'bg-slate-100 border-slate-200 text-slate-700', icon: CheckCircle },
};

export default function MyVisits() {
  const navigate = useNavigate();
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVisits();
  }, []);

  const fetchVisits = async () => {
    setLoading(true);
    try {
      const data = await visitService.getMyVisits();
      setVisits(data || []);
    } catch (err) {
      toast.error(err.message || 'Error loading visits');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      <TenantNavbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Scheduled Visits</h1>
          <p className="text-sm text-brand-text-muted mt-1">Track the status of your property visits scheduled with owners.</p>
        </div>

        {loading ? (
          /* Skeletons */
          <div className="space-y-4">
            {[...Array(3)].map((_, idx) => (
              <div key={idx} className="bg-white border border-brand-border rounded-2xl p-6 animate-pulse space-y-3">
                <div className="h-4 bg-slate-200 rounded w-1/4" />
                <div className="h-6 bg-slate-200 rounded w-1/2" />
                <div className="h-4 bg-slate-200 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : visits.length === 0 ? (
          /* Empty State */
          <div className="bg-white border border-brand-border rounded-2xl p-12 text-center shadow-sm">
            <div className="w-16 h-16 bg-blue-50 text-brand-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar size={28} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No visits requested</h3>
            <p className="text-sm text-brand-text-muted mt-1 max-w-xs mx-auto">
              Schedule a visit from any property detail page to plan your move-in checking.
            </p>
            <button
              onClick={() => navigate('/explore')}
              className="btn btn-primary mt-5 px-5 py-2.5 rounded-xl font-bold"
            >
              Explore Properties
            </button>
          </div>
        ) : (
          /* Visits List */
          <div className="space-y-4">
            {visits.map((visit) => {
              const status = visit.status || 'pending';
              const style = STATUS_STYLING[status] || STATUS_STYLING.pending;
              const StatusIcon = style.icon;
              const formattedDate = new Date(visit.scheduledDate).toLocaleDateString('en-IN', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });

              return (
                <div
                  key={visit._id}
                  onClick={() => visit.pg?._id && navigate(`/pg/${visit.pg._id}`)}
                  className="bg-white border border-brand-border hover:border-slate-350 rounded-2xl p-5 shadow-sm transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                >
                  <div className="space-y-2">
                    
                    {/* Status Badge */}
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${style.bg}`}>
                        <StatusIcon size={12} />
                        <span className="capitalize">{status}</span>
                      </span>

                      {status === 'pending' && (
                        <span className="text-[10px] text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-md font-bold flex items-center gap-1">
                          <Info size={10} />
                          Awaiting owner confirmation
                        </span>
                      )}
                    </div>

                    {/* PG Details */}
                    <div>
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-brand-primary transition-colors flex items-center gap-1">
                        {visit.pg?.name || 'Unknown Property'}
                        <ChevronRight size={16} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-all translate-x-0 group-hover:translate-x-0.5" />
                      </h3>
                      <div className="flex items-center gap-1 text-xs text-brand-text-muted mt-0.5">
                        <MapPin size={13} className="text-slate-400 shrink-0" />
                        <span>{visit.pg?.area || 'N/A'}, {visit.pg?.city || ''}</span>
                      </div>
                    </div>

                    {/* Schedule */}
                    <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-700 pt-1">
                      <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-md border border-slate-200">
                        <Calendar size={13} className="text-slate-400" />
                        {formattedDate}
                      </span>
                      <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-md border border-slate-200">
                        <Clock size={13} className="text-slate-400" />
                        {visit.scheduledTime}
                      </span>
                    </div>

                    {/* Messages */}
                    {visit.message && (
                      <p className="text-xs text-slate-600 bg-slate-50 border border-slate-100 p-2.5 rounded-xl mt-2 italic">
                        "{visit.message}"
                      </p>
                    )}
                  </div>

                  {/* Owner Contact (only if confirmed or completed) */}
                  {visit.pg?.owner && (status === 'confirmed' || status === 'completed') && (
                    <div className="sm:border-l border-slate-100 sm:pl-6 space-y-2 text-xs shrink-0 self-start sm:self-center">
                      <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Owner Contacts</p>
                      <div className="flex items-center gap-1 text-slate-800 font-semibold">
                        <User size={13} className="text-slate-400" />
                        <span>{visit.pg.owner.name}</span>
                      </div>
                      {visit.pg.contactPhone && (
                        <a
                          href={`tel:${visit.pg.contactPhone}`}
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-1 text-brand-primary hover:underline font-bold"
                        >
                          <Phone size={13} />
                          <span>{visit.pg.contactPhone}</span>
                        </a>
                      )}
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}

      </main>
    </div>
  );
}
