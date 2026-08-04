import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MapPin, Shield, Trash2, ArrowRight } from 'lucide-react';
import TenantNavbar from '../../components/layout/TenantNavbar';
import useWishlistStore from '../../store/wishlistStore';
import toast from 'react-hot-toast';

export default function Wishlist() {
  const navigate = useNavigate();
  const { wishlist, loading, fetchWishlist, toggleWishlist } = useWishlistStore();

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleRemove = async (e, pgId) => {
    e.stopPropagation();
    try {
      await toggleWishlist(pgId);
      toast.success('Removed from shortlist');
    } catch (e) {
      toast.error('Failed to remove from shortlist');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      <TenantNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">My Shortlist</h1>
          <p className="text-sm text-brand-text-muted mt-1">Properties you are interested in visiting or booking.</p>
        </div>

        {loading && wishlist.length === 0 ? (
          /* Loading State */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, idx) => (
              <div key={idx} className="bg-white rounded-2xl border border-brand-border overflow-hidden animate-pulse">
                <div className="h-48 bg-slate-200" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-slate-200 rounded w-2/3" />
                  <div className="h-3 bg-slate-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : wishlist.length === 0 ? (
          /* Empty State */
          <div className="bg-white border border-brand-border rounded-2xl p-12 text-center shadow-sm max-w-lg mx-auto">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart size={28} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Your shortlist is empty</h3>
            <p className="text-sm text-brand-text-muted mt-1 max-w-xs mx-auto">
              Save properties you like while browsing to find them here and book visits.
            </p>
            <button
              onClick={() => navigate('/explore')}
              className="btn btn-primary mt-5 px-5 py-2.5 rounded-xl font-bold flex items-center gap-1.5 mx-auto"
            >
              Explore Properties
              <ArrowRight size={16} />
            </button>
          </div>
        ) : (
          /* Wishlist Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlist.map((item) => {
              const pg = item.pg;
              if (!pg) return null;

              const rentPrice = pg.rent?.single || pg.rent?.double || pg.rent?.triple || 'N/A';
              const coverPhoto = pg.photos?.[0]?.url || 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80';

              return (
                <div
                  key={pg._id}
                  onClick={() => navigate(`/pg/${pg._id}`)}
                  className="bg-white rounded-2xl border border-brand-border overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col"
                >
                  <div className="relative h-48 bg-slate-900 overflow-hidden">
                    <img
                      src={coverPhoto}
                      alt={pg.name}
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                    />

                    {pg.isVerified && (
                      <div className="absolute top-3 left-3 flex items-center gap-1 bg-emerald-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-sm">
                        <Shield size={10} className="fill-white/10" />
                        <span>VERIFIED</span>
                      </div>
                    )}

                    <button
                      onClick={(e) => handleRemove(e, pg._id)}
                      className="absolute top-3 right-3 p-2 rounded-full bg-white/95 backdrop-blur-sm border border-slate-100 shadow hover:bg-red-50 text-red-500 hover:scale-105 transition-all z-10"
                      title="Remove from shortlist"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-[10px] font-extrabold tracking-wider px-2 py-0.5 rounded-md uppercase border ${
                          pg.gender === 'male'
                            ? 'text-blue-600 bg-blue-50 border-blue-100'
                            : pg.gender === 'female'
                            ? 'text-pink-600 bg-pink-50 border-pink-100'
                            : 'text-purple-600 bg-purple-50 border-purple-100'
                        }`}>
                          {pg.gender === 'any' ? 'Co-Ed' : `${pg.gender} only`}
                        </span>
                        
                        <div className="text-slate-900 font-extrabold text-sm">
                          ₹{rentPrice}<span className="text-[10px] font-normal text-slate-500">/mo</span>
                        </div>
                      </div>

                      <h3 className="font-bold text-base text-slate-900 leading-snug group-hover:text-brand-primary transition-colors line-clamp-1">
                        {pg.name}
                      </h3>
                      
                      <div className="flex items-center gap-1 text-xs text-brand-text-muted mt-1">
                        <MapPin size={12} className="text-slate-400 shrink-0" />
                        <span className="truncate">{pg.area}, {pg.city}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 pt-3 mt-4 border-t border-slate-100">
                      {pg.ac && (
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">AC Available</span>
                      )}
                      {pg.food !== 'none' && (
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">Food: {pg.food}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
