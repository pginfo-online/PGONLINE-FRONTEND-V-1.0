import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, X, Save } from 'lucide-react';
import PageWrapper from '../../components/layout/PageWrapper';
import pgService from '../../services/pg.service';
import toast from 'react-hot-toast';

const FACILITIES = [
  'WiFi', 'Laundry', 'Parking', 'Gym', 'CCTV', 'Power Backup',
  'Hot Water', 'Housekeeping', 'TV', 'Refrigerator', 'RO Water',
  'Study Room', 'Lift', 'Security Guard', 'Kitchen Access',
];

const initialForm = {
  name: '', description: '', city: 'Pune', area: '', address: '',
  mapsLink: '', food: 'none', foodIncluded: false, ac: false,
  gender: 'any', contactPhone: '', contactWhatsapp: '',
  isAvailable: true, availableRooms: 0, facilities: [],
  rent: { single: '', double: '', triple: '' },
};

export default function AddPG() {
  const [form, setForm] = useState(initialForm);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef();
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.area || !form.address || !form.contactPhone) {
      return toast.error('Please fill required fields');
    }
    setLoading(true);
    try {
      const data = { ...form, rent: {
        single: form.rent.single ? Number(form.rent.single) : undefined,
        double: form.rent.double ? Number(form.rent.double) : undefined,
        triple: form.rent.triple ? Number(form.rent.triple) : undefined,
      }};
      const pg = await pgService.create(data);
      if (photos.length > 0) {
        await pgService.uploadImages(pg._id, photos, true);
      }
      toast.success('PG listing submitted for approval!');
      navigate('/owner/listings');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper title="Add New PG" subtitle="Fill in details to list your PG">
      <form onSubmit={handleSubmit}>
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Basic Info</h3>
          <div className="grid-2">
            <div className="form-group">
              <label className="label">PG Name *</label>
              <input className="input" value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="e.g. Sunrise PG" />
            </div>
            <div className="form-group">
              <label className="label">City *</label>
              <select className="input" value={form.city} onChange={(e) => update('city', e.target.value)}>
                <option>Pune</option><option>Mumbai</option><option>Delhi</option>
              </select>
            </div>
            <div className="form-group">
              <label className="label">Area / Locality *</label>
              <input className="input" value={form.area} onChange={(e) => update('area', e.target.value)} placeholder="e.g. Hinjewadi" />
            </div>
            <div className="form-group">
              <label className="label">Gender</label>
              <select className="input" value={form.gender} onChange={(e) => update('gender', e.target.value)}>
                <option value="any">Any</option><option value="male">Male</option><option value="female">Female</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="label">Address *</label>
            <input className="input" value={form.address} onChange={(e) => update('address', e.target.value)} placeholder="Full address" />
          </div>
          <div className="form-group">
            <label className="label">Google Maps Link</label>
            <input className="input" value={form.mapsLink} onChange={(e) => update('mapsLink', e.target.value)} placeholder="https://maps.google.com/..." />
          </div>
          <div className="form-group">
            <label className="label">Description</label>
            <textarea className="input" rows={3} value={form.description} onChange={(e) => update('description', e.target.value)} placeholder="Describe your PG..." />
          </div>
        </div>

        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Rent & Amenities</h3>
          <div className="grid-3">
            <div className="form-group">
              <label className="label">Single Room (₹/mo)</label>
              <input className="input" type="number" value={form.rent.single} onChange={(e) => updateRent('single', e.target.value)} placeholder="9000" />
            </div>
            <div className="form-group">
              <label className="label">Double Sharing (₹/mo)</label>
              <input className="input" type="number" value={form.rent.double} onChange={(e) => updateRent('double', e.target.value)} placeholder="7000" />
            </div>
            <div className="form-group">
              <label className="label">Triple Sharing (₹/mo)</label>
              <input className="input" type="number" value={form.rent.triple} onChange={(e) => updateRent('triple', e.target.value)} placeholder="5000" />
            </div>
          </div>
          <div className="grid-3">
            <div className="form-group">
              <label className="label">Food</label>
              <select className="input" value={form.food} onChange={(e) => update('food', e.target.value)}>
                <option value="none">No Food</option><option value="veg">Veg Only</option><option value="nonveg">Non-Veg Only</option><option value="both">Veg + Non-Veg</option>
              </select>
            </div>
            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingTop: '1.5rem' }}>
              <input type="checkbox" checked={form.foodIncluded} onChange={(e) => update('foodIncluded', e.target.checked)} id="food-inc" />
              <label htmlFor="food-inc" style={{ fontSize: '0.875rem' }}>Food included in rent</label>
            </div>
            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingTop: '1.5rem' }}>
              <input type="checkbox" checked={form.ac} onChange={(e) => update('ac', e.target.checked)} id="ac" />
              <label htmlFor="ac" style={{ fontSize: '0.875rem' }}>AC Available</label>
            </div>
          </div>
          <div className="form-group">
            <label className="label">Facilities</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {FACILITIES.map((f) => (
                <button key={f} type="button" onClick={() => toggleFacility(f)}
                  className={`btn btn-sm ${form.facilities.includes(f) ? 'btn-primary' : 'btn-secondary'}`}>
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Contact & Availability</h3>
          <div className="grid-3">
            <div className="form-group">
              <label className="label">Contact Phone *</label>
              <input className="input" value={form.contactPhone} onChange={(e) => update('contactPhone', e.target.value)} placeholder="9876543210" />
            </div>
            <div className="form-group">
              <label className="label">WhatsApp Number</label>
              <input className="input" value={form.contactWhatsapp} onChange={(e) => update('contactWhatsapp', e.target.value)} placeholder="Same or different" />
            </div>
            <div className="form-group">
              <label className="label">Available Rooms</label>
              <input className="input" type="number" value={form.availableRooms} onChange={(e) => update('availableRooms', e.target.value)} />
            </div>
          </div>
        </div>

        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Photos</h3>
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

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/owner/listings')}>Cancel</button>
          <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
            <Save size={18} /> {loading ? 'Submitting...' : 'Submit for Approval'}
          </button>
        </div>
      </form>
    </PageWrapper>
  );
}
