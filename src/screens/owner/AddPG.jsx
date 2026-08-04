import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, X, Save, ArrowLeft, Globe, MapPin, Phone, HelpCircle, Sparkles, Building, Briefcase, Trash2, Plus } from 'lucide-react';
import { StandaloneSearchBox, useJsApiLoader } from '@react-google-maps/api';
import PageWrapper from '../../components/layout/PageWrapper';
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
};

export default function AddPG() {
  const [form, setForm] = useState(initialForm);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  const fileRef = useRef();
  const searchBoxRef = useRef(null);
  const isSubmittingRef = useRef(false);
  const navigate = useNavigate();

const { isLoaded } = useJsApiLoader({
  id: 'google-map-script',
  googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'YOUR_KEY',
  libraries: ['places'],
});
console.log(
  'Google Maps API Key:',
  import.meta.env.VITE_GOOGLE_MAPS_API_KEY
);
  const update = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  const handlePlacesChanged = () => {
    if (!searchBoxRef.current) return;
    const places = searchBoxRef.current.getPlaces();
    if (!places || places.length === 0) return;
    const place = places[0];
    
    // Auto-extract address components if possible
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

  const handlePhotos = (e) => {
    const files = Array.from(e.target.files);
    if (photos.length + files.length > 15) return toast.error('Max 15 photos');
    setPhotos((p) => [...p, ...files]);
  };

  const removePhoto = (idx) => setPhotos((p) => p.filter((_, i) => i !== idx));
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
    setLoading(true);

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

      const pg = await pgService.create(data);
      if (photos.length > 0) {
        await pgService.uploadImages(pg._id, photos, true);
      }
      toast.success('PG listing submitted for approval!');
      navigate('/owner/listings');
    } catch (err) {
      toast.error(err.message || 'Failed to submit PG listing');
      isSubmittingRef.current = false;
      setLoading(false);
    }
  };

  const backAction = (
    <div style={{ display: 'flex', gap: '0.75rem' }}>
      <Button variant="secondary" size="sm" onClick={() => navigate('/owner/listings/add/chat')} icon={<Sparkles size={16} />}>
        Use AI Assistant
      </Button>
      <Button variant="secondary" size="sm" onClick={() => navigate('/owner/listings')} icon={<ArrowLeft size={16} />}>
        Back to Listings
      </Button>
    </div>
  );

  return (
    <PageWrapper title="Add New PG" subtitle="Fill in details to list your PG" action={backAction}>
      <form onSubmit={handleSubmit} className="space-y-6 pb-12">
        
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
            <Phone size={20} className="text-brand-primary" /> Contact Details
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Input label="Contact Phone *" value={form.contactPhone} onChange={(e) => update('contactPhone', e.target.value)} error={errors.contactPhone} placeholder="e.g. 9876543210" />
            <Input label="WhatsApp Number" value={form.contactWhatsapp} onChange={(e) => update('contactWhatsapp', e.target.value)} error={errors.contactWhatsapp} placeholder="Optional, if different" />
          </div>
        </div>

        {/* Photos Upload */}
        <div className="card">
          <h3 className="text-lg font-bold text-slate-800 mb-5 border-b border-slate-100 pb-3">Photos (Max 15)</h3>
          
          <div onClick={() => fileRef.current?.click()} className="border-2 border-dashed border-slate-300 hover:border-brand-primary bg-slate-50 hover:bg-blue-50/50 transition-colors rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer text-center group">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100 mb-4 group-hover:scale-110 transition-transform">
              <Upload size={28} className="text-brand-primary" />
            </div>
            <p className="font-bold text-slate-700 text-lg">Click to browse or drag & drop</p>
            <p className="text-slate-500 text-sm mt-1">Upload high-quality images to attract more tenants</p>
            <input ref={fileRef} type="file" multiple accept="image/*" onChange={handlePhotos} hidden />
          </div>
          
          {photos.length > 0 && (
            <div className="flex flex-wrap gap-4 mt-6">
              {photos.map((f, i) => (
                <div key={i} className="relative w-28 h-28 rounded-xl overflow-hidden shadow-sm border border-slate-200 group">
                  <img src={URL.createObjectURL(f)} className="w-full h-full object-cover" alt="" />
                  <button type="button" onClick={() => removePhoto(i)} className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-red-500 transition-colors opacity-0 group-hover:opacity-100 backdrop-blur-sm">
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-4 justify-end pt-4">
          <Button variant="secondary" size="lg" onClick={() => navigate('/owner/listings')}>Cancel</Button>
          <Button type="submit" variant="primary" size="lg" loading={loading} icon={<Save size={18} />}>Submit Listing</Button>
        </div>
      </form>
    </PageWrapper>
  );
}
