import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal, Navigation, Heart, MapPin, Sparkles, Filter, Check, X, Shield, ArrowUpDown, ChevronLeft, ChevronRight, Map as MapIcon, List as ListIcon } from 'lucide-react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import TenantNavbar from '../../components/layout/TenantNavbar';
import pgService from '../../services/pg.service';
import useAuthStore from '../../store/authStore';
import useWishlistStore from '../../store/wishlistStore';
import useSearchStore from '../../store/searchStore';
import toast from 'react-hot-toast';

const CITIES = ['Pune', 'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad', 'Kolkata', 'Jaipur', 'Ahmedabad', 'Other'];
const FACILITIES = [
  'WiFi', 'Laundry', 'Parking', 'Gym', 'CCTV', 'Power Backup',
  'Hot Water', 'Housekeeping', 'TV', 'Refrigerator', 'RO Water',
  'Study Room', 'Lift', 'Security Guard', 'Kitchen Access'
];

export default function ExplorePGs() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { wishlist, isWishlisted, toggleWishlist, fetchWishlist } = useWishlistStore();
  
  // Search state from store
  const {
    recentSearches, loadRecentSearches, addRecentSearch,
    suggestions, setSuggestions, clearSuggestions,
    searchResults, setSearchResults, clearSearchResults,
    filters, setFilters, sortBy, setSortBy,
    isSearching, setIsSearching, resultsPagination
  } = useSearchStore();

  // Local UX state
  const [searchInput, setSearchInput] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeCity, setActiveCity] = useState(CITIES[0]);
  const [loadingNearMe, setLoadingNearMe] = useState(false);
  const [activePage, setActivePage] = useState(1);
  const [activePhotoIndexes, setActivePhotoIndexes] = useState({}); // { [pgId]: currentPhotoIndex }

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
  });

  const [viewMode, setViewMode] = useState('both'); // 'list', 'map', 'both'
  const [activeMarker, setActiveMarker] = useState(null);
  const [mapCenter, setMapCenter] = useState({ lat: 18.5204, lng: 73.8567 }); // Pune default
  const mapRef = useRef(null);

  // If results change, update center
  useEffect(() => {
    if (searchResults.length > 0 && searchResults[0].latitude) {
      setMapCenter({ lat: searchResults[0].latitude, lng: searchResults[0].longitude });
    }
  }, [searchResults]);

  const suggestionRef = useRef(null);
  const searchDebounceRef = useRef(null);

  // Initialize
  useEffect(() => {
    loadRecentSearches();
    if (isAuthenticated) {
      fetchWishlist();
    }
  }, [isAuthenticated]);

  // Execute search when filters, city, or page changes
  useEffect(() => {
    triggerSearch();
  }, [filters, activeCity, sortBy, activePage]);

  // Handle outside clicks to close suggestions dropdown
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (suggestionRef.current && !suggestionRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Fetch suggestions as user types
  const handleSearchInputChange = (e) => {
    const query = e.target.value;
    setSearchInput(query);

    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);

    if (!query.trim() || query.trim().length < 2) {
      clearSuggestions();
      setShowSuggestions(false);
      return;
    }

    searchDebounceRef.current = setTimeout(async () => {
      try {
        const res = await pgService.getSuggestions(query.trim());
        setSuggestions(res || []);
        setShowSuggestions(true);
      } catch (err) {
        console.error(err);
      }
    }, 300);
  };

  const triggerSearch = async (searchQuery = searchInput) => {
    setIsSearching(true);
    setShowSuggestions(false);
    
    const params = {
      ...filters,
      page: activePage,
      limit: 12,
      sort: sortBy,
    };

    if (searchQuery.trim() && searchQuery !== 'Near Me') {
      params.q = searchQuery.trim();
      addRecentSearch(searchQuery.trim());
    }

    // Apply city condition if not searching "Near Me"
    if (searchQuery !== 'Near Me' && !filters.lat) {
      params.city = activeCity;
    }

    try {
      const res = await pgService.getAll(params);
      setSearchResults(res.data || res.pgs || [], res.pagination);
    } catch (err) {
      toast.error(err.message || 'Error loading listings');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleNearMeSearch = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setLoadingNearMe(true);
    setSearchInput('Near Me');
    clearSuggestions();

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        // Update filters store
        const nearMeFilters = { ...filters, lat: latitude, lng: longitude, radius: 10 };
        setFilters(nearMeFilters);
        setActivePage(1);
        setLoadingNearMe(false);
        toast.success('Found your location! Fetching nearby PGs...');
      },
      (err) => {
        toast.error('Unable to fetch your location. Please check browser permissions.');
        setLoadingNearMe(false);
        setSearchInput('');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSelectSuggestion = (text) => {
    setSearchInput(text);
    triggerSearch(text);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    // Remove geolocation filters
    const cleanFilters = { ...filters };
    delete cleanFilters.lat;
    delete cleanFilters.lng;
    delete cleanFilters.radius;
    setFilters(cleanFilters);
    clearSearchResults();
    setActivePage(1);
  };

  const handleToggleWishlist = async (e, pgId) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error('Please login to shortlist listings');
      navigate('/login');
      return;
    }
    try {
      await toggleWishlist(pgId);
      toast.success(isWishlisted(pgId) ? 'Removed from wishlist' : 'Added to wishlist');
    } catch (err) {
      toast.error('Failed to update wishlist');
    }
  };

  // Image Navigation
  const handlePrevPhoto = (e, pgId, photosCount) => {
    e.stopPropagation();
    setActivePhotoIndexes((prev) => {
      const current = prev[pgId] || 0;
      const next = current === 0 ? photosCount - 1 : current - 1;
      return { ...prev, [pgId]: next };
    });
  };

  const handleNextPhoto = (e, pgId, photosCount) => {
    e.stopPropagation();
    setActivePhotoIndexes((prev) => {
      const current = prev[pgId] || 0;
      const next = current === photosCount - 1 ? 0 : current + 1;
      return { ...prev, [pgId]: next };
    });
  };

  // Filters state helper
  const updateFilterField = (field, val) => {
    const updated = { ...filters, [field]: val };
    if (val === '' || val === undefined || (Array.isArray(val) && val.length === 0)) {
      delete updated[field];
    }
    setFilters(updated);
    setActivePage(1);
  };

  const handleFacilityCheckbox = (facility) => {
    const activeFacilities = filters.facilities ? [...filters.facilities] : [];
    if (activeFacilities.includes(facility)) {
      const index = activeFacilities.indexOf(facility);
      activeFacilities.splice(index, 1);
    } else {
      activeFacilities.push(facility);
    }
    updateFilterField('facilities', activeFacilities);
  };

  const handleClearAllFilters = () => {
    setFilters({});
    setSortBy('newest');
    setActivePage(1);
    setShowFilters(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 select-none pb-12">
      <TenantNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28">
        
        {/* Search Bar + City chips Header */}
        <div className="bg-white rounded-2xl border border-brand-border p-4 sm:p-6 mb-8 shadow-sm">
          <div className="flex flex-col md:flex-row gap-3">
            
            {/* Search Input Box */}
            <div className="flex-1 relative" ref={suggestionRef}>
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                <Search size={20} />
              </div>
              <input
                type="text"
                className="w-full pl-11 pr-10 py-3 rounded-xl bg-slate-50 border border-brand-border focus:border-brand-primary outline-none font-medium text-slate-850"
                placeholder="Search by area, building name..."
                value={searchInput}
                onChange={handleSearchInputChange}
                onFocus={() => setShowSuggestions(suggestions.length > 0)}
                onKeyDown={(e) => e.key === 'Enter' && triggerSearch()}
              />
              {searchInput && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-650"
                >
                  <X size={18} />
                </button>
              )}

              {/* Autocomplete suggestions */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute left-0 right-0 mt-2 bg-white rounded-xl border border-brand-border shadow-xl z-20 max-h-60 overflow-y-auto py-1">
                  {suggestions.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectSuggestion(item.text)}
                      className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 border-b border-slate-50 last:border-0"
                    >
                      <MapPin size={16} className="text-slate-400" />
                      <span>{item.text}</span>
                      <span className="text-[10px] uppercase font-extrabold text-brand-primary bg-blue-50 px-1.5 py-0.5 rounded ml-auto">
                        {item.type}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Actions group */}
            <div className="flex gap-2">
              <button
                onClick={handleNearMeSearch}
                disabled={loadingNearMe}
                className="flex items-center gap-2 px-4 py-3 rounded-xl border border-brand-border hover:bg-slate-50 text-brand-primary font-bold text-sm transition-all shadow-sm shrink-0"
              >
                <Navigation size={18} className={loadingNearMe ? 'animate-spin' : ''} />
                <span className="hidden sm:inline">Near Me</span>
              </button>

              <button
                onClick={() => setShowFilters(true)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl border font-bold text-sm transition-all shadow-sm shrink-0 ${
                  Object.keys(filters).length > 0
                    ? 'border-brand-primary text-brand-primary bg-blue-50/40'
                    : 'border-brand-border hover:bg-slate-50 text-slate-700'
                }`}
              >
                <SlidersHorizontal size={18} />
                <span>Filters</span>
                {Object.keys(filters).length > 0 && (
                  <span className="w-5 h-5 rounded-full bg-brand-primary text-white text-[10px] font-extrabold flex items-center justify-center">
                    {Object.keys(filters).length}
                  </span>
                )}
              </button>

              {/* Sort Order Selector */}
              <div className="relative inline-block text-left shrink-0">
                <select
                  value={sortBy}
                  onChange={(e) => { setSortBy(e.target.value); setActivePage(1); }}
                  className="px-3.5 py-3 rounded-xl border border-brand-border bg-white text-slate-700 font-bold text-sm outline-none shadow-sm cursor-pointer hover:bg-slate-50"
                >
                  <option value="newest">Newest</option>
                  <option value="rent_asc">Price: Low to High</option>
                  <option value="rent_desc">Price: High to Low</option>
                  <option value="popular">Popularity</option>
                </select>
              </div>
            </div>
          </div>

          {/* City Selector Chips */}
          <div className="flex items-center gap-2 overflow-x-auto mt-4 pt-3 border-t border-slate-100 scrollbar-none">
            {CITIES.map((city) => {
              const isActive = activeCity === city && !filters.lat;
              return (
                <button
                  key={city}
                  onClick={() => {
                    // Remove location lat/lng to search city
                    const cleanFilters = { ...filters };
                    delete cleanFilters.lat;
                    delete cleanFilters.lng;
                    delete cleanFilters.radius;
                    setFilters(cleanFilters);
                    setActiveCity(city);
                    setActivePage(1);
                  }}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border shrink-0 ${
                    isActive
                      ? 'bg-brand-primary text-white border-brand-primary shadow-sm'
                      : 'bg-white text-slate-650 border-brand-border hover:bg-slate-50'
                  }`}
                >
                  {city}
                </button>
              );
            })}
            
            <div className="ml-auto flex items-center bg-slate-100 rounded-lg p-1 lg:hidden shrink-0">
              <button onClick={() => setViewMode('list')} className={`px-3 py-1 text-xs font-bold rounded-md flex items-center gap-1 ${viewMode !== 'map' ? 'bg-white shadow-sm text-brand-primary' : 'text-slate-500'}`}><ListIcon size={14}/> List</button>
              <button onClick={() => setViewMode('map')} className={`px-3 py-1 text-xs font-bold rounded-md flex items-center gap-1 ${viewMode === 'map' ? 'bg-white shadow-sm text-brand-primary' : 'text-slate-500'}`}><MapIcon size={14}/> Map</button>
            </div>
          </div>
        </div>

        {/* Results & Map container */}
        <div className="flex flex-col lg:flex-row gap-6 mt-6 min-h-[600px] pb-10">
          
          {/* List View */}
          <div className={`flex-1 lg:w-[55%] flex flex-col gap-6 ${viewMode === 'map' ? 'hidden lg:flex' : 'flex'}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {isSearching ? (
            /* Skeletons */
            [...Array(6)].map((_, idx) => (
              <div key={idx} className="bg-white rounded-2xl border border-brand-border overflow-hidden shadow-sm animate-pulse">
                <div className="h-52 bg-slate-200" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-slate-200 rounded w-2/3" />
                  <div className="h-3 bg-slate-200 rounded w-1/2" />
                  <div className="flex gap-2 pt-2">
                    <div className="h-6 bg-slate-200 rounded-full w-16" />
                    <div className="h-6 bg-slate-200 rounded-full w-16" />
                  </div>
                </div>
              </div>
            ))
          ) : searchResults.length === 0 ? (
            /* Empty State */
            <div className="col-span-full bg-white border border-brand-border rounded-2xl p-12 text-center shadow-sm">
              <div className="w-16 h-16 bg-blue-50 text-brand-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <SlidersHorizontal size={28} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">No properties found</h3>
              <p className="text-sm text-brand-text-muted mt-1 max-w-sm mx-auto">
                We couldn't find any listings matching your active location or filter criteria. Try adjusting your filters.
              </p>
              <button
                onClick={handleClearAllFilters}
                className="btn btn-primary mt-5 px-5 py-2.5 rounded-xl font-bold"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            /* Results list */
            searchResults.map((pg) => {
              const photosCount = pg.photos?.length || 0;
              const photoIndex = activePhotoIndexes[pg._id] || 0;
              const currentPhoto = pg.photos?.[photoIndex]?.url || 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80';

              return (
                <div
                  key={pg._id}
                  onClick={() => navigate(`/pg/${pg._id}`)}
                  className="bg-white rounded-2xl border border-brand-border overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col"
                >
                  
                  {/* Photo Slider */}
                  <div className="relative h-52 sm:h-56 bg-slate-900 overflow-hidden">
                    <img
                      src={currentPhoto}
                      alt={pg.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-350"
                    />
                    
                    {/* Dark gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

                    {/* Wishlist toggle */}
                    <button
                      onClick={(e) => handleToggleWishlist(e, pg._id)}
                      className="absolute top-3.5 right-3.5 p-2 rounded-full bg-white/90 backdrop-blur-sm border border-slate-100 shadow hover:scale-110 active:scale-95 transition-all z-10"
                    >
                      <Heart
                        size={18}
                        className={isWishlisted(pg._id) ? 'fill-red-500 text-red-500' : 'text-slate-600'}
                      />
                    </button>

                    {/* Verified indicator */}
                    {pg.isVerified && (
                      <div className="absolute top-3.5 left-3.5 flex items-center gap-1 bg-emerald-500 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-sm">
                        <Shield size={11} className="fill-white/20" />
                        <span>VERIFIED</span>
                      </div>
                    )}

                    {/* Left/Right image controls */}
                    {photosCount > 1 && (
                      <>
                        <button
                          onClick={(e) => handlePrevPhoto(e, pg._id, photosCount)}
                          className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/35 hover:bg-black/50 text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 z-10"
                        >
                          <ChevronLeft size={16} />
                        </button>
                        <button
                          onClick={(e) => handleNextPhoto(e, pg._id, photosCount)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/35 hover:bg-black/50 text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 z-10"
                        >
                          <ChevronRight size={16} />
                        </button>
                      </>
                    )}

                    {/* Photo Dots */}
                    {photosCount > 1 && (
                      <div className="absolute bottom-3.5 left-0 right-0 flex justify-center gap-1 pointer-events-none">
                        {pg.photos.map((_, idx) => (
                          <span
                            key={idx}
                            className={`w-1.5 h-1.5 rounded-full transition-all ${
                              idx === photoIndex ? 'bg-white w-3' : 'bg-white/50'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Gender Badge and rent info */}
                      <div className="flex items-center justify-between mb-1.5">
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
                          Rent from <span className="text-base text-brand-primary">₹{pg.rent?.single || pg.rent?.double || pg.rent?.triple}</span>/mo
                        </div>
                      </div>

                      <h3 className="font-bold text-base text-slate-900 leading-snug group-hover:text-brand-primary transition-colors line-clamp-1">{pg.name}</h3>
                      
                      <div className="flex items-center gap-1 text-xs text-brand-text-muted mt-1">
                        <MapPin size={13} className="text-slate-400 shrink-0" />
                        <span className="truncate">{pg.area}, {pg.city}</span>
                      </div>
                    </div>

                    {/* Footer characteristics */}
                    <div className="flex items-center gap-1.5 pt-3 mt-4 border-t border-slate-100">
                      {pg.ac && (
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">AC Available</span>
                      )}
                      {pg.food !== 'none' && (
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">Food: {pg.food}</span>
                      )}
                      {pg.distance !== undefined && (
                        <span className="text-[10px] font-bold text-brand-primary bg-blue-50 px-2 py-0.5 rounded ml-auto">
                          {(pg.distance / 1000).toFixed(1)} km away
                        </span>
                      )}
                    </div>

                  </div>
                </div>
              );
            })
          )}
            </div>

            {/* Pagination */}
            {resultsPagination && resultsPagination.totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-4">
                <button
                  onClick={() => setActivePage((p) => Math.max(1, p - 1))}
                  disabled={!resultsPagination.hasPrev}
                  className="p-2 border border-brand-border rounded-lg bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft size={18} />
                </button>
                <span className="text-sm font-semibold text-slate-700">
                  Page {resultsPagination.page} of {resultsPagination.totalPages}
                </span>
                <button
                  onClick={() => setActivePage((p) => Math.min(resultsPagination.totalPages, p + 1))}
                  disabled={!resultsPagination.hasNext}
                  className="p-2 border border-brand-border rounded-lg bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </div>
          
          {/* Map View */}
          <div className={`flex-1 lg:w-[45%] h-[600px] lg:h-[calc(100vh-140px)] sticky top-24 rounded-2xl overflow-hidden border border-brand-border bg-slate-100 ${viewMode === 'list' ? 'hidden lg:block' : 'block'}`}>
            {isLoaded ? (
              <GoogleMap
                mapContainerStyle={{ width: '100%', height: '100%' }}
                center={mapCenter}
                zoom={13}
                onLoad={(map) => { mapRef.current = map; }}
                options={{ disableDefaultUI: true, zoomControl: true }}
              >
                {searchResults.map(pg => {
                  if (!pg.latitude || !pg.longitude) return null;
                  return (
                    <Marker
                      key={pg._id}
                      position={{ lat: pg.latitude, lng: pg.longitude }}
                      onClick={() => {
                        setActiveMarker(pg);
                        setMapCenter({ lat: pg.latitude, lng: pg.longitude });
                      }}
                    />
                  );
                })}
                
                {activeMarker && (
                  <InfoWindow
                    position={{ lat: activeMarker.latitude, lng: activeMarker.longitude }}
                    onCloseClick={() => setActiveMarker(null)}
                  >
                    <div className="p-1 max-w-[200px] cursor-pointer" onClick={() => navigate(`/pg/${activeMarker._id}`)}>
                      <img src={activeMarker.photos?.[0]?.url || 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80'} className="w-full h-24 object-cover rounded-lg mb-2" />
                      <h4 className="font-bold text-sm truncate">{activeMarker.name}</h4>
                      <p className="text-xs text-brand-text-muted mt-0.5">{activeMarker.area}</p>
                      <p className="text-brand-primary font-bold text-sm mt-1">₹{activeMarker.rent?.single || activeMarker.rent?.double || activeMarker.rent?.triple}</p>
                    </div>
                  </InfoWindow>
                )}
              </GoogleMap>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                <MapIcon size={32} className="mb-2 opacity-50 animate-pulse" />
                <span className="text-sm font-semibold">Loading Map...</span>
              </div>
            )}
          </div>
        </div>

      </main>

      {/* Slide-out Filters Drawer */}
      {showFilters && (
        <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
          <div className="absolute inset-0 overflow-hidden">
            {/* Overlay */}
            <div
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
              onClick={() => setShowFilters(false)}
            />

            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <div className="pointer-events-auto w-screen max-w-md transform bg-white shadow-2xl border-l border-brand-border animate-in slide-in-from-right duration-200 flex flex-col h-full">
                
                {/* Drawer Header */}
                <div className="px-6 py-5 border-b border-brand-border flex items-center justify-between">
                  <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                    <Filter size={18} className="text-brand-primary" />
                    Advanced Filters
                  </h2>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="p-1 rounded-lg text-slate-400 hover:bg-slate-50"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Drawer Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  
                  {/* Rent Range input */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 mb-3">Monthly Rent (Single Sharing reference)</h3>
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Min</label>
                        <input
                          type="number"
                          placeholder="₹0"
                          className="w-full mt-1 px-3 py-2 border border-brand-border rounded-xl outline-none font-semibold text-slate-800"
                          value={filters.minRent || ''}
                          onChange={(e) => updateFilterField('minRent', e.target.value)}
                        />
                      </div>
                      <div className="flex-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Max</label>
                        <input
                          type="number"
                          placeholder="₹25,000+"
                          className="w-full mt-1 px-3 py-2 border border-brand-border rounded-xl outline-none font-semibold text-slate-800"
                          value={filters.maxRent || ''}
                          onChange={(e) => updateFilterField('maxRent', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Sharing option */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 mb-3">Sharing Room Type</h3>
                    <div className="flex gap-2">
                      {['single', 'double', 'triple'].map((sharing) => {
                        const isActive = filters.sharingType === sharing;
                        return (
                          <button
                            key={sharing}
                            onClick={() => updateFilterField('sharingType', isActive ? undefined : sharing)}
                            className={`flex-1 py-2 text-xs font-bold rounded-xl border capitalize transition-all ${
                              isActive
                                ? 'bg-brand-primary text-white border-brand-primary shadow-sm'
                                : 'bg-slate-50 text-slate-650 border-brand-border hover:bg-slate-100'
                            }`}
                          >
                            {sharing}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Gender Restriction */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 mb-3">Tenant Gender Preference</h3>
                    <div className="flex gap-2">
                      {['male', 'female', 'any'].map((gen) => {
                        const isActive = filters.gender === gen;
                        return (
                          <button
                            key={gen}
                            onClick={() => updateFilterField('gender', isActive ? undefined : gen)}
                            className={`flex-1 py-2 text-xs font-bold rounded-xl border capitalize transition-all ${
                              isActive
                                ? 'bg-brand-primary text-white border-brand-primary shadow-sm'
                                : 'bg-slate-50 text-slate-650 border-brand-border hover:bg-slate-100'
                            }`}
                          >
                            {gen === 'any' ? 'Co-Ed' : gen}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* AC and Food Inclusion */}
                  <div className="space-y-3 pt-2">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.ac === 'true'}
                        onChange={(e) => updateFilterField('ac', e.target.checked ? 'true' : undefined)}
                        className="w-4.5 h-4.5 text-brand-primary border-brand-border rounded focus:ring-brand-primary"
                      />
                      <span className="text-sm font-semibold text-slate-700">AC Accommodation Required</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.foodIncluded === 'true'}
                        onChange={(e) => updateFilterField('foodIncluded', e.target.checked ? 'true' : undefined)}
                        className="w-4.5 h-4.5 text-brand-primary border-brand-border rounded focus:ring-brand-primary"
                      />
                      <span className="text-sm font-semibold text-slate-700">Food Included in Rent</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.isVerified === 'true'}
                        onChange={(e) => updateFilterField('isVerified', e.target.checked ? 'true' : undefined)}
                        className="w-4.5 h-4.5 text-brand-primary border-brand-border rounded focus:ring-brand-primary"
                      />
                      <span className="text-sm font-semibold text-slate-700">Verified PGs Only</span>
                    </label>
                  </div>

                  {/* Food Type */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 mb-3">Food Availability Option</h3>
                    <div className="flex flex-wrap gap-2">
                      {['veg', 'nonveg', 'both', 'none'].map((f) => {
                        const isActive = filters.food === f;
                        return (
                          <button
                            key={f}
                            onClick={() => updateFilterField('food', isActive ? undefined : f)}
                            className={`px-4 py-2 text-xs font-bold rounded-xl border uppercase transition-all ${
                              isActive
                                ? 'bg-brand-primary text-white border-brand-primary shadow-sm'
                                : 'bg-slate-50 text-slate-650 border-brand-border hover:bg-slate-100'
                            }`}
                          >
                            {f === 'both' ? 'Veg & Non-Veg' : f}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Facilities */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 mb-3">Amenities / Facilities</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {FACILITIES.map((fac) => {
                        const isChecked = filters.facilities?.includes(fac);
                        return (
                          <label key={fac} className="flex items-center gap-2.5 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isChecked || false}
                              onChange={() => handleFacilityCheckbox(fac)}
                              className="w-4 h-4 text-brand-primary border-brand-border rounded"
                            />
                            <span className="text-xs font-semibold text-slate-700">{fac}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                </div>

                {/* Drawer Footer */}
                <div className="p-6 border-t border-brand-border flex gap-3">
                  <button
                    onClick={handleClearAllFilters}
                    className="flex-1 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 border border-brand-border rounded-xl transition-all"
                  >
                    Reset All
                  </button>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="flex-1 py-3 text-sm font-bold bg-brand-primary hover:bg-brand-primary/95 text-white rounded-xl transition-all shadow-md shadow-blue-500/20"
                  >
                    Apply Filters
                  </button>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
