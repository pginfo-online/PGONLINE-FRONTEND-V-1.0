import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, X, Save, ArrowLeft, Globe, MapPin, Phone, HelpCircle } from 'lucide-react';
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
  availableRooms: '',
  facilities: [],
  rent: { single: '', double: '', triple: '' },
};

export default function AddPG() {
  const [form, setForm] = useState(initialForm);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  const fileRef = useRef();
  const isSubmittingRef = useRef(false);
  const navigate = useNavigate();

  const update = (key, val) => setForm((p) => ({ ...p, [key]: val }));
  const updateRent = (key, val) => setForm((p) => ({ ...p, rent: { ...p.rent, [key]: val } }));

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

  const validateForm = () => {
    const newErrors = {};
    if (!form.name || form.name.trim().length < 3) {
      newErrors.name = 'PG name must be at least 3 characters';
    }
    if (!form.area || form.area.trim().length < 2) {
      newErrors.area = 'Area/locality is required';
    }
    if (!form.address || form.address.trim().length < 5) {
      newErrors.address = 'Full address is required (min 5 characters)';
    }

    const phoneRegex = /^[6-9]\d{9}$/;
    if (!form.contactPhone) {
      newErrors.contactPhone = 'Contact phone is required';
    } else if (!phoneRegex.test(form.contactPhone)) {
      newErrors.contactPhone = 'Enter a valid 10-digit mobile number';
    }

    if (form.contactWhatsapp && !phoneRegex.test(form.contactWhatsapp)) {
      newErrors.contactWhatsapp = 'Enter a valid 10-digit mobile number';
    }

    if (form.rent.single && Number(form.rent.single) < 0) {
      newErrors.singleRent = 'Rent cannot be negative';
    }
    if (form.rent.double && Number(form.rent.double) < 0) {
      newErrors.doubleRent = 'Rent cannot be negative';
    }
    if (form.rent.triple && Number(form.rent.triple) < 0) {
      newErrors.tripleRent = 'Rent cannot be negative';
    }

    if (form.availableRooms !== undefined && form.availableRooms !== '' && Number(form.availableRooms) < 0) {
      newErrors.availableRooms = 'Rooms count cannot be negative';
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
      const cleanNumberOrNull = (val) => {
        if (val === null || val === undefined) return null;
        const str = String(val).trim();
        return str === '' ? null : Number(str);
      };

      const data = {
        ...form,
        rent: {
          single: cleanNumberOrNull(form.rent.single),
          double: cleanNumberOrNull(form.rent.double),
          triple: cleanNumberOrNull(form.rent.triple),
        },
        availableRooms: cleanNumberOrNull(form.availableRooms),
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
    <Button variant="secondary" size="sm" onClick={() => navigate('/owner/listings')} icon={<ArrowLeft size={16} />}>
      Back to Listings
    </Button>
  );

  return (
    <PageWrapper title="Add New PG" subtitle="Fill in details to list your PG" action={backAction}>
      <form onSubmit={handleSubmit}>
        
        {/* Basic Info */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '1.25rem', color: '#1f2937', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MapPin size={18} color="#4f46e5" /> Basic Info
          </h3>
          <div className="grid-2">
            <Input
              label="PG Name *"
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              error={errors.name}
              placeholder="e.g. Sunrise Premium PG"
            />

            <div className="form-group">
              <label className="label">City *</label>
              <select className="input" value={form.city} onChange={(e) => update('city', e.target.value)}>
                <option value="Pune">Pune</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Delhi">Delhi</option>
              </select>
            </div>

            <Input
              label="Area / Locality *"
              value={form.area}
              onChange={(e) => update('area', e.target.value)}
              error={errors.area}
              placeholder="e.g. Hinjewadi Phase 1"
            />

            <div className="form-group">
              <label className="label">Gender Allowed</label>
              <select className="input" value={form.gender} onChange={(e) => update('gender', e.target.value)}>
                <option value="any">Any (Co-Ed)</option>
                <option value="male">Male Only</option>
                <option value="female">Female Only</option>
              </select>
            </div>
          </div>

          <Input
            label="Address *"
            value={form.address}
            onChange={(e) => update('address', e.target.value)}
            error={errors.address}
            placeholder="Full physical address"
          />

          <Input
            label="Google Maps Link"
            value={form.mapsLink}
            onChange={(e) => update('mapsLink', e.target.value)}
            error={errors.mapsLink}
            placeholder="https://maps.google.com/..."
            icon={<Globe size={16} />}
          />

          <div className="form-group">
            <label className="label">Description</label>
            <textarea
              className="input"
              rows={3}
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
              placeholder="Describe amenities, surroundings, rules, and benefits..."
              style={{ resize: 'vertical' }}
            />
          </div>
        </div>

        {/* Rent & Amenities */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '1.25rem', color: '#1f2937', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <HelpCircle size={18} color="#4f46e5" /> Rent & Amenities
          </h3>
          <div className="grid-3">
            <Input
              label="Single Room (₹/mo)"
              type="number"
              value={form.rent.single}
              onChange={(e) => updateRent('single', e.target.value)}
              error={errors.singleRent}
              placeholder="e.g. 9500"
            />
            <Input
              label="Double Sharing (₹/mo)"
              type="number"
              value={form.rent.double}
              onChange={(e) => updateRent('double', e.target.value)}
              error={errors.doubleRent}
              placeholder="e.g. 7000"
            />
            <Input
              label="Triple Sharing (₹/mo)"
              type="number"
              value={form.rent.triple}
              onChange={(e) => updateRent('triple', e.target.value)}
              error={errors.tripleRent}
              placeholder="e.g. 5000"
            />
          </div>

          <div className="grid-3" style={{ alignItems: 'center', marginTop: '0.5rem' }}>
            <div className="form-group">
              <label className="label">Food Option</label>
              <select className="input" value={form.food} onChange={(e) => update('food', e.target.value)}>
                <option value="none">No Food</option>
                <option value="veg">Veg Only</option>
                <option value="nonveg">Non-Veg Only</option>
                <option value="both">Veg & Non-Veg</option>
              </select>
            </div>

            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', paddingTop: '1.25rem' }}>
              <input
                type="checkbox"
                checked={form.foodIncluded}
                onChange={(e) => update('foodIncluded', e.target.checked)}
                id="food-inc"
                style={{ width: 17, height: 17, cursor: 'pointer', accentColor: '#4f46e5' }}
              />
              <label htmlFor="food-inc" style={{ fontSize: '0.875rem', fontWeight: 500, color: '#374151', cursor: 'pointer' }}>
                Food included in rent
              </label>
            </div>

            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', paddingTop: '1.25rem' }}>
              <input
                type="checkbox"
                checked={form.ac}
                onChange={(e) => update('ac', e.target.checked)}
                id="ac"
                style={{ width: 17, height: 17, cursor: 'pointer', accentColor: '#4f46e5' }}
              />
              <label htmlFor="ac" style={{ fontSize: '0.875rem', fontWeight: 500, color: '#374151', cursor: 'pointer' }}>
                AC Rooms available
              </label>
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '0.75rem' }}>
            <label className="label" style={{ marginBottom: '0.625rem' }}>Facilities / Amenities</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {FACILITIES.map((f) => {
                const selected = form.facilities.includes(f);
                return (
                  <button
                    key={f}
                    type="button"
                    onClick={() => toggleFacility(f)}
                    className="btn btn-sm"
                    style={{
                      border: '1px solid',
                      borderColor: selected ? '#4f46e5' : '#d1d5db',
                      background: selected ? 'linear-gradient(135deg, #4f46e5, #7c3aed)' : '#fff',
                      color: selected ? '#fff' : '#4b5563',
                      boxShadow: selected ? '0 2px 6px rgba(79, 70, 229, 0.2)' : 'none',
                    }}
                  >
                    {f}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Contact & Availability */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '1.25rem', color: '#1f2937', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Phone size={18} color="#4f46e5" /> Contact & Availability
          </h3>
          <div className="grid-3">
            <Input
              label="Contact Phone *"
              value={form.contactPhone}
              onChange={(e) => update('contactPhone', e.target.value)}
              error={errors.contactPhone}
              placeholder="e.g. 9876543210"
            />

            <Input
              label="WhatsApp Number"
              value={form.contactWhatsapp}
              onChange={(e) => update('contactWhatsapp', e.target.value)}
              error={errors.contactWhatsapp}
              placeholder="Same or different"
            />

            <Input
              label="Available Rooms"
              type="number"
              value={form.availableRooms}
              onChange={(e) => update('availableRooms', e.target.value)}
              error={errors.availableRooms}
              placeholder="e.g. 3"
            />
          </div>
        </div>

        {/* Photos */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '1rem', color: '#1f2937' }}>Photos</h3>
          <div className="upload-area" onClick={() => fileRef.current?.click()}>
            <Upload size={32} color="#9ca3af" style={{ marginBottom: '0.5rem' }} />
            <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Click to upload photos (max 15)</p>
            <input ref={fileRef} type="file" multiple accept="image/*" onChange={handlePhotos} hidden />
          </div>
          {photos.length > 0 && (
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '1rem' }}>
              {photos.map((f, i) => (
                <div key={i} style={{ position: 'relative', width: 100, height: 80, borderRadius: 8, overflow: 'hidden' }}>
                  <img src={URL.createObjectURL(f)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                  <button type="button" onClick={() => removePhoto(i)}
                    style={{ position: 'absolute', top: 4, right: 4, width: 20, height: 20, borderRadius: '50%',
                      background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', cursor: 'pointer', display: 'flex',
                      alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem' }}>
          <Button variant="secondary" size="lg" onClick={() => navigate('/owner/listings')}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="lg" loading={loading}>
            <Save size={18} /> Submit for Approval
          </Button>
        </div>
      </form>
    </PageWrapper>
  );
}
