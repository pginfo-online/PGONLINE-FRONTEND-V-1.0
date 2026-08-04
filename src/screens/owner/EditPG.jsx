import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, Globe, MapPin, Phone, HelpCircle, Clock, Sparkles, Building, Briefcase, Trash2, Plus, X } from 'lucide-react';
import { StandaloneSearchBox, useJsApiLoader } from '@react-google-maps/api';
import PageWrapper from '../../components/layout/PageWrapper';
import ImageUploader from '../../components/shared/ImageUploader';
import pgService from '../../services/pg.service';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';

const FACILITIES = [
  'WiFi', 'Laundry', 'Parking', 'Gym', 'CCTV', 'Power Backup',
  'Hot Water', 'Housekeeping', 'TV', 'Refrigerator', 'RO Water',
  'Study Room', 'Lift', 'Security Guard', 'Kitchen Access',
];

const initialForm = {
  name: '',
  description: '',
  propertyType: 'PG',
  propertyAge: '',
  totalRooms: '',
  floors: '',
  city: 'Pune',
  area: '',
  address: '',
  mapsLink: '',
  food: 'none',
  foodIncluded: false,
  ac: false,
  gender: 'any',
  contactPhone: '',
  contactWhatsapp: '',
  isAvailable: true,
  securityDeposit: '',
  noticePeriod: '',
  minStay: '',
  facilities: [],
  roomConfigs: [{ shareType: 'single', rent: '', totalBeds: '', availableBeds: '' }],
  nearbyPlaces: [],
  photos: [],
};

export default function EditPG() {
  const { id } = useParams();
  const navigate = useNavigate();

  const isSubmittingRef = useRef(false);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [pendingRequest, setPendingRequest] = useState(null);

  const searchBoxRef = useRef(null);
  
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries: ['places'],
  });

  const handleCancelRequest = async () => {
    if (!pendingRequest) return;
    if (!confirm('Are you sure you want to cancel this pending update request?')) return;
    try {
      await pgService.cancelUpdateRequest(pendingRequest._id);
      toast.success('Update request cancelled!');
      loadData();
    } catch (err) {
      toast.error('Failed to cancel request: ' + err.message);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [pg, requests] = await Promise.all([
        pgService.getById(id),
        pgService.getMyUpdateRequests(),
      ]);

      const pending = requests.find(
        (r) => r.pg?._id === id && ['pending', 'correction_required'].includes(r.status)
      );
      setPendingRequest(pending || null);

      setForm({
        name: pg.name || '',
        description: pg.description || '',
        propertyType: pg.propertyType || 'PG',
        propertyAge: pg.propertyAge != null ? String(pg.propertyAge) : '',
        totalRooms: pg.totalRooms != null ? String(pg.totalRooms) : '',
        floors: pg.floors != null ? String(pg.floors) : '',
        city: pg.city || 'Pune',
        area: pg.area || '',
        address: pg.address || '',
        mapsLink: pg.mapsLink || '',
        food: pg.food || 'none',
        foodIncluded: pg.foodIncluded ?? false,
        ac: pg.ac ?? false,
        gender: pg.gender || 'any',
        contactPhone: pg.contactPhone || '',
        contactWhatsapp: pg.contactWhatsapp || '',
        isAvailable: pg.isAvailable ?? true,
        securityDeposit: pg.securityDeposit != null ? String(pg.securityDeposit) : '',
        noticePeriod: pg.noticePeriod != null ? String(pg.noticePeriod) : '',
        minStay: pg.minStay != null ? String(pg.minStay) : '',
        facilities: pg.facilities || [],
        roomConfigs: pg.roomConfigs?.length ? pg.roomConfigs.map(rc => ({ ...rc, rent: String(rc.rent) })) : [{ shareType: 'single', rent: '', totalBeds: '', availableBeds: '' }],
        nearbyPlaces: pg.nearbyPlaces || [],
        photos: pg.photos || [],
      });
    } catch (err) {
      toast.error('Failed to load PG details: ' + err.message);
      navigate('/owner/listings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id, navigate]);

  const update = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  const handlePlacesChanged = () => {
    if (!searchBoxRef.current) return;
    const places = searchBoxRef.current.getPlaces();
    if (!places || places.length === 0) return;
    const place = places[0];
    
    let city = form.city;
    let area = form.area;
    place.address_components?.forEach(comp => {
      if (comp.types.includes('locality')) city = comp.long_name;
      if (comp.types.includes('sublocality_level_1')) area = comp.long_name;
    });

    setForm(p => ({
      ...p,
      address: place.formatted_address || p.address,
      mapsLink: place.url || p.mapsLink,
      city: city,
      area: area || p.area
    }));
  };

  const toggleFacility = (f) => {
    setForm((p) => ({
      ...p,
      facilities: p.facilities.includes(f) ? p.facilities.filter((x) => x !== f) : [...p.facilities, f],
    }));
  };

  // Dynamic arrays handlers
  const addRoomConfig = () => setForm(p => ({ ...p, roomConfigs: [...p.roomConfigs, { shareType: 'single', rent: '', totalBeds: '', availableBeds: '' }] }));
  const updateRoomConfig = (idx, field, val) => {
    const newConfigs = [...form.roomConfigs];
    newConfigs[idx][field] = val;
    update('roomConfigs', newConfigs);
  };
  const removeRoomConfig = (idx) => update('roomConfigs', form.roomConfigs.filter((_, i) => i !== idx));

  const addNearbyPlace = () => setForm(p => ({ ...p, nearbyPlaces: [...p.nearbyPlaces, { placeType: 'college', name: '', distance: '' }] }));
  const updateNearbyPlace = (idx, field, val) => {
    const newPlaces = [...form.nearbyPlaces];
    newPlaces[idx][field] = val;
    update('nearbyPlaces', newPlaces);
  };
  const removeNearbyPlace = (idx) => update('nearbyPlaces', form.nearbyPlaces.filter((_, i) => i !== idx));

  const validateForm = () => {
    const newErrors = {};
    if (!form.name || form.name.trim().length < 3) newErrors.name = 'PG name must be at least 3 characters';
    if (!form.area || form.area.trim().length < 2) newErrors.area = 'Area/locality is required';
    if (!form.address || form.address.trim().length < 5) newErrors.address = 'Full address is required';

    const phoneRegex = /^[6-9]\d{9}$/;
    if (!form.contactPhone || !phoneRegex.test(form.contactPhone)) newErrors.contactPhone = 'Valid 10-digit mobile number required';
    if (form.contactWhatsapp && !phoneRegex.test(form.contactWhatsapp)) newErrors.contactWhatsapp = 'Valid 10-digit mobile number required';

    if (form.roomConfigs.length === 0) {
      newErrors.roomConfigs = 'Add at least one room configuration';
    } else {
      form.roomConfigs.forEach((rc, i) => {
        if (!rc.rent || Number(rc.rent) <= 0) newErrors[`roomRent_${i}`] = 'Valid rent is required';
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please resolve the form validation errors');
      return;
    }

    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setSaving(true);

    try {
      const cleanNumberOrNull = (val) => (val === '' || val === null || val === undefined) ? null : Number(val);
      
      const data = {
        ...form,
        propertyAge: cleanNumberOrNull(form.propertyAge),
        totalRooms: cleanNumberOrNull(form.totalRooms),
        floors: cleanNumberOrNull(form.floors),
        securityDeposit: cleanNumberOrNull(form.securityDeposit),
        noticePeriod: cleanNumberOrNull(form.noticePeriod),
        minStay: cleanNumberOrNull(form.minStay),
        roomConfigs: form.roomConfigs.map(rc => ({
          shareType: rc.shareType,
          rent: cleanNumberOrNull(rc.rent),
          totalBeds: cleanNumberOrNull(rc.totalBeds),
          availableBeds: cleanNumberOrNull(rc.availableBeds)
        })).filter(rc => rc.rent !== null),
        nearbyPlaces: form.nearbyPlaces.map(np => ({
          ...np, distance: cleanNumberOrNull(np.distance)
        })).filter(np => np.name.trim() !== '')
      };

      await pgService.update(id, data);
      toast.success('Changes submitted for approval! Your listing will go live once an admin reviews it.');
      navigate('/owner/listings');
    } catch (err) {
      toast.error(err.message || 'Failed to update PG details');
      isSubmittingRef.current = false;
      setSaving(false);
    }
  };

  const backAction = (
    <Button variant="secondary" size="sm" onClick={() => navigate('/owner/listings')} icon={<ArrowLeft size={16} />}>
      Back to Listings
    </Button>
  );

  if (loading) {
    return (
      <PageWrapper title="Edit PG Details" subtitle="Manage and update your PG information" action={backAction}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {[...Array(3)].map((_, idx) => (
            <div key={idx} className="card">
              <div className="skeleton" style={{ height: 24, width: '25%', marginBottom: '1.5rem' }} />
              <div className="grid-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="form-group">
                    <div className="skeleton" style={{ height: 16, width: '35%', marginBottom: '0.5rem' }} />
                    <div className="skeleton" style={{ height: 42, width: '100%', borderRadius: 8 }} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper title={`Edit: ${form.name}`} subtitle="Update details and photos of your PG" action={backAction}>
      <form onSubmit={handleSubmit} className="space-y-6 pb-12">
        {/* Pending request banner stays here... */}
        {pendingRequest && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5 flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-xl">⏳</span>
                <span className="font-semibold text-amber-900">You have a pending update request for this listing.</span>
              </div>
              <span className={`badge badge-${pendingRequest.status} m-0`}>{pendingRequest.status.replace('_', ' ')}</span>
            </div>
            <div className="text-sm text-amber-700">Submitted on {new Date(pendingRequest.submittedAt).toLocaleString()}</div>
            {pendingRequest.adminComment && (
              <div className="bg-white p-3 rounded-lg border-l-4 border-amber-500 mt-1 text-sm text-slate-700">
                <strong>Admin Comment:</strong> {pendingRequest.adminComment}
              </div>
            )}
            <button type="button" className="btn btn-secondary btn-sm self-start mt-2 bg-red-50 text-red-600 border border-red-200" onClick={handleCancelRequest}>
              Cancel Update Request
            </button>
          </div>
        )}

        {/* Basic Info */}
        <div className="card">
          <h3 className="flex items-center gap-2 text-lg font-bold text-slate-800 mb-5 border-b border-slate-100 pb-3">
            <MapPin size={20} className="text-brand-primary" /> Location & Identification
          </h3>
          <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 text-sm text-blue-800 mb-6 font-medium flex gap-3 items-start">
            <Sparkles size={18} className="text-blue-500 shrink-0 mt-0.5" />
            <p>Start typing in the address field to automatically fetch correct location details using Google Maps.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            <Input label="PG Name *" value={form.name} onChange={(e) => update('name', e.target.value)} error={errors.name} placeholder="e.g. Sunrise Premium PG" />
            <div className="form-group">
              <label className="label">Property Type</label>
              <select className="input" value={form.propertyType} onChange={(e) => update('propertyType', e.target.value)}>
                <option value="PG">PG</option>
                <option value="Hostel">Hostel</option>
                <option value="Co-living">Co-living</option>
                <option value="Apartment">Apartment</option>
                <option value="Independent House">Independent House</option>
              </select>
            </div>
          </div>

          <div className="mb-5">
            {isLoaded ? (
              <StandaloneSearchBox onLoad={ref => searchBoxRef.current = ref} onPlacesChanged={handlePlacesChanged}>
                <Input label="Search Full Address (Google Maps) *" value={form.address} onChange={(e) => update('address', e.target.value)} error={errors.address} placeholder="Start typing address..." />
              </StandaloneSearchBox>
            ) : (
              <Input label="Address *" value={form.address} onChange={(e) => update('address', e.target.value)} error={errors.address} placeholder="Loading maps..." disabled />
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <Input label="Area/Locality *" value={form.area} onChange={(e) => update('area', e.target.value)} error={errors.area} placeholder="e.g. Hinjewadi Phase 1" />
            <div className="form-group">
              <label className="label">City *</label>
              <select className="input" value={form.city} onChange={(e) => update('city', e.target.value)}>
                <option value="Pune">Pune</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Delhi">Delhi</option>
                <option value="Bangalore">Bangalore</option>
                <option value="Chennai">Chennai</option>
                <option value="Hyderabad">Hyderabad</option>
              </select>
            </div>
            <Input label="Google Maps Link" value={form.mapsLink} onChange={(e) => update('mapsLink', e.target.value)} placeholder="https://maps.google.com/..." />
          </div>

          <div className="form-group mt-5">
            <label className="label">Description</label>
            <textarea className="input" rows={3} value={form.description} onChange={(e) => update('description', e.target.value)} placeholder="Describe amenities, surroundings, rules..." />
          </div>
        </div>

        {/* Property Specs */}
        <div className="card">
          <h3 className="flex items-center gap-2 text-lg font-bold text-slate-800 mb-5 border-b border-slate-100 pb-3">
            <Building size={20} className="text-brand-primary" /> Property Details
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
            <div className="form-group">
              <label className="label">Gender Allowed</label>
              <select className="input" value={form.gender} onChange={(e) => update('gender', e.target.value)}>
                <option value="any">Any (Co-Ed)</option>
                <option value="male">Male Only</option>
                <option value="female">Female Only</option>
              </select>
            </div>
            <Input label="Total Rooms" type="number" value={form.totalRooms} onChange={(e) => update('totalRooms', e.target.value)} placeholder="e.g. 10" />
            <Input label="Floors" type="number" value={form.floors} onChange={(e) => update('floors', e.target.value)} placeholder="e.g. 3" />
            <Input label="Property Age (Years)" type="number" value={form.propertyAge} onChange={(e) => update('propertyAge', e.target.value)} placeholder="e.g. 5" />
          </div>
        </div>

        {/* Room Configs */}
        <div className="card bg-slate-50 border-slate-200">
          <h3 className="flex items-center gap-2 text-lg font-bold text-slate-800 mb-5 border-b border-slate-200 pb-3">
            <Briefcase size={20} className="text-brand-primary" /> Room Configurations & Rent
          </h3>
          
          {errors.roomConfigs && <p className="text-red-500 text-sm font-semibold mb-4">{errors.roomConfigs}</p>}

          <div className="space-y-4">
            {form.roomConfigs.map((rc, idx) => (
              <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative grid grid-cols-1 sm:grid-cols-5 gap-4 items-end">
                {form.roomConfigs.length > 1 && (
                  <button type="button" onClick={() => removeRoomConfig(idx)} className="absolute -top-2 -right-2 bg-red-100 hover:bg-red-200 text-red-600 p-1.5 rounded-full shadow-sm transition-colors">
                    <X size={14} />
                  </button>
                )}
                
                <div className="form-group mb-0">
                  <label className="label">Sharing Type</label>
                  <select className="input bg-slate-50" value={rc.shareType} onChange={(e) => updateRoomConfig(idx, 'shareType', e.target.value)}>
                    <option value="single">Single</option>
                    <option value="double">Double</option>
                    <option value="triple">Triple</option>
                    <option value="four">Four</option>
                  </select>
                </div>
                <Input label="Monthly Rent (₹) *" type="number" value={rc.rent} onChange={(e) => updateRoomConfig(idx, 'rent', e.target.value)} error={errors[`roomRent_${idx}`]} placeholder="e.g. 8000" />
                <Input label="Total Beds" type="number" value={rc.totalBeds} onChange={(e) => updateRoomConfig(idx, 'totalBeds', e.target.value)} placeholder="e.g. 10" />
                <Input label="Available Beds" type="number" value={rc.availableBeds} onChange={(e) => updateRoomConfig(idx, 'availableBeds', e.target.value)} placeholder="e.g. 4" />
              </div>
            ))}
          </div>
          
          <button type="button" onClick={addRoomConfig} className="mt-4 flex items-center gap-2 text-brand-primary font-bold hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors border border-transparent hover:border-blue-100 text-sm">
            <Plus size={16} /> Add another room configuration
          </button>
        </div>

        {/* Rules & Amenities */}
        <div className="card">
          <h3 className="flex items-center gap-2 text-lg font-bold text-slate-800 mb-5 border-b border-slate-100 pb-3">
            <HelpCircle size={20} className="text-brand-primary" /> Rules & Amenities
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-5 mb-6">
            <Input label="Security Deposit (₹)" type="number" value={form.securityDeposit} onChange={(e) => update('securityDeposit', e.target.value)} placeholder="e.g. 10000" />
            <Input label="Notice Period (Days)" type="number" value={form.noticePeriod} onChange={(e) => update('noticePeriod', e.target.value)} placeholder="e.g. 30" />
            <Input label="Min Stay (Months)" type="number" value={form.minStay} onChange={(e) => update('minStay', e.target.value)} placeholder="e.g. 6" />
            <div className="form-group">
              <label className="label">Food Option</label>
              <select className="input" value={form.food} onChange={(e) => update('food', e.target.value)}>
                <option value="none">No Food</option>
                <option value="veg">Veg Only</option>
                <option value="nonveg">Non-Veg Only</option>
                <option value="both">Veg & Non-Veg</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-6 mb-6 px-2">
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input type="checkbox" checked={form.foodIncluded} onChange={(e) => update('foodIncluded', e.target.checked)} className="w-5 h-5 text-brand-primary border-slate-300 rounded focus:ring-brand-primary" />
              <span className="font-semibold text-slate-700">Food included in rent</span>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input type="checkbox" checked={form.ac} onChange={(e) => update('ac', e.target.checked)} className="w-5 h-5 text-brand-primary border-slate-300 rounded focus:ring-brand-primary" />
              <span className="font-semibold text-slate-700">AC Rooms available</span>
            </label>
          </div>

          <div className="form-group">
            <label className="label mb-3">Facilities Provided</label>
            <div className="flex flex-wrap gap-2.5">
              {FACILITIES.map((f) => {
                const isSelected = form.facilities.includes(f);
                return (
                  <button key={f} type="button" onClick={() => toggleFacility(f)} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${isSelected ? 'bg-brand-primary text-white border-brand-primary shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>
                    {f}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        
        {/* Nearby Places */}
        <div className="card">
          <h3 className="flex items-center gap-2 text-lg font-bold text-slate-800 mb-5 border-b border-slate-100 pb-3">
            <MapPin size={20} className="text-brand-primary" /> Nearby Places
          </h3>
          
          <div className="space-y-3">
            {form.nearbyPlaces.map((np, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row gap-3 items-end p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="form-group mb-0 flex-1">
                  <label className="label text-xs">Place Type</label>
                  <select className="input bg-white" value={np.placeType} onChange={(e) => updateNearbyPlace(idx, 'placeType', e.target.value)}>
                    <option value="college">College/University</option>
                    <option value="it_park">IT Park/Tech Hub</option>
                    <option value="metro">Metro Station</option>
                    <option value="bus_stop">Bus Stop</option>
                    <option value="hospital">Hospital</option>
                    <option value="shopping_mall">Shopping Mall</option>
                    <option value="restaurant">Restaurant</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="flex-1 w-full">
                  <Input label="Name" value={np.name} onChange={(e) => updateNearbyPlace(idx, 'name', e.target.value)} placeholder="e.g. Infosys Campus" />
                </div>
                <div className="w-full sm:w-32">
                  <Input label="Distance (km)" type="number" step="0.1" value={np.distance} onChange={(e) => updateNearbyPlace(idx, 'distance', e.target.value)} placeholder="e.g. 1.5" />
                </div>
                <button type="button" onClick={() => removeNearbyPlace(idx)} className="p-3 bg-white hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-xl border border-slate-200 transition-colors mb-[1px]">
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
          
          <button type="button" onClick={addNearbyPlace} className="mt-4 flex items-center gap-2 text-brand-primary font-bold hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors border border-transparent hover:border-blue-100 text-sm">
            <Plus size={16} /> Add a nearby place
          </button>
        </div>

        {/* Contact Details */}
        <div className="card">
          <h3 className="flex items-center gap-2 text-lg font-bold text-slate-800 mb-5 border-b border-slate-100 pb-3">
            <Phone size={20} className="text-brand-primary" /> Contact Details & Availability
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Input label="Contact Phone *" value={form.contactPhone} onChange={(e) => update('contactPhone', e.target.value)} error={errors.contactPhone} placeholder="e.g. 9876543210" />
            <Input label="WhatsApp Number" value={form.contactWhatsapp} onChange={(e) => update('contactWhatsapp', e.target.value)} error={errors.contactWhatsapp} placeholder="Optional, if different" />
          </div>
          <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3">
            <input type="checkbox" checked={form.isAvailable} onChange={(e) => update('isAvailable', e.target.checked)} id="edit-is-avail" className="w-5 h-5 text-brand-primary border-slate-300 rounded focus:ring-brand-primary cursor-pointer" />
            <label htmlFor="edit-is-avail" className="font-semibold text-slate-700 cursor-pointer">Listing is Available for Booking (Show in Tenant App)</label>
          </div>
        </div>

        {/* Photos Card */}
        <div className="card">
          <h3 className="text-lg font-bold text-slate-800 mb-5 border-b border-slate-100 pb-3">Photos (Max 15)</h3>
          <ImageUploader
            pgId={id}
            currentPhotos={form.photos}
            onUploaded={(updatedPhotos) => update('photos', updatedPhotos)}
          />
        </div>

        {/* Submit Actions */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem' }}>
          <Button variant="secondary" size="lg" onClick={() => navigate('/owner/listings')}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="lg" loading={saving}>
            <Clock size={18} /> Submit for Approval
          </Button>

        </div>

      </form>
    </PageWrapper>
  );
}
