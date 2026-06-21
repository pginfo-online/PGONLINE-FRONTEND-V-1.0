import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, Globe, MapPin, Phone, HelpCircle } from 'lucide-react';
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
  availableRooms: 0,
  facilities: [],
  rent: { single: '', double: '', triple: '' },
  photos: [],
};

export default function EditPG() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    let active = true;
    const fetchPGDetails = async () => {
      try {
        const pg = await pgService.getById(id);
        if (active) {
          setForm({
            name: pg.name || '',
            description: pg.description || '',
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
            availableRooms: pg.availableRooms ?? 0,
            facilities: pg.facilities || [],
            rent: {
              single: pg.rent?.single !== undefined ? String(pg.rent.single) : '',
              double: pg.rent?.double !== undefined ? String(pg.rent.double) : '',
              triple: pg.rent?.triple !== undefined ? String(pg.rent.triple) : '',
            },
            photos: pg.photos || [],
          });
          setLoading(false);
        }
      } catch (err) {
        if (active) {
          toast.error('Failed to load PG details: ' + err.message);
          navigate('/owner/listings');
        }
      }
    };

    fetchPGDetails();
    return () => {
      active = false;
    };
  }, [id, navigate]);

  const update = (key, val) => setForm((p) => ({ ...p, [key]: val }));
  const updateRent = (key, val) => setForm((p) => ({ ...p, rent: { ...p.rent, [key]: val } }));

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

    if (form.availableRooms !== undefined && Number(form.availableRooms) < 0) {
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

    setSaving(true);
    try {
      const data = {
        ...form,
        rent: {
          single: form.rent.single ? Number(form.rent.single) : undefined,
          double: form.rent.double ? Number(form.rent.double) : undefined,
          triple: form.rent.triple ? Number(form.rent.triple) : undefined,
        },
        availableRooms: Number(form.availableRooms) || 0,
      };

      await pgService.update(id, data);
      toast.success('PG details updated successfully!');
      navigate('/owner/listings');
    } catch (err) {
      toast.error(err.message || 'Failed to update PG details');
    } finally {
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
                id="edit-food-inc"
                style={{ width: 17, height: 17, cursor: 'pointer', accentColor: '#4f46e5' }}
              />
              <label htmlFor="edit-food-inc" style={{ fontSize: '0.875rem', fontWeight: 500, color: '#374151', cursor: 'pointer' }}>
                Food included in rent
              </label>
            </div>

            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', paddingTop: '1.25rem' }}>
              <input
                type="checkbox"
                checked={form.ac}
                onChange={(e) => update('ac', e.target.checked)}
                id="edit-ac"
                style={{ width: 17, height: 17, cursor: 'pointer', accentColor: '#4f46e5' }}
              />
              <label htmlFor="edit-ac" style={{ fontSize: '0.875rem', fontWeight: 500, color: '#374151', cursor: 'pointer' }}>
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

        {/* Contact, Availability & Capacity */}
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

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginTop: '0.5rem' }}>
            <input
              type="checkbox"
              checked={form.isAvailable}
              onChange={(e) => update('isAvailable', e.target.checked)}
              id="edit-is-avail"
              style={{ width: 17, height: 17, cursor: 'pointer', accentColor: '#4f46e5' }}
            />
            <label htmlFor="edit-is-avail" style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1f2937', cursor: 'pointer' }}>
              Listing is Available for Booking (Show in Tenant App)
            </label>
          </div>
        </div>

        {/* Photos Card */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '1rem', color: '#1f2937' }}>Photos</h3>
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
            <Save size={18} /> Save Changes
          </Button>
        </div>
        
      </form>
    </PageWrapper>
  );
}
