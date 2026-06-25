import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Save, ArrowLeft, Calendar, MapPin, User, ImageIcon, Info } from 'lucide-react';
import PageWrapper from '../../components/layout/PageWrapper';
import meetupService from '../../services/meetup.service';
import MeetupImageUploader from '../../components/shared/MeetupImageUploader';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import {
  MIN_MEETUP_IMAGES,
  MAX_MEETUP_IMAGES,
  getMeetupCoverUrl,
} from '../../utils/meetupHelpers';

const CATEGORIES = ['career', 'business', 'community', 'educational', 'health', 'social', 'other'];

const initialForm = {
  title: '',
  description: '',
  category: 'community',
  startDate: '',
  endDate: '',
  startTime: '',
  endTime: '',
  locationName: '',
  locationAddress: '',
  locationCity: 'Pune',
  mapsLink: '',
  organizerName: '',
  organizerContact: '',
  maxAttendees: '',
  registrationDeadline: '',
  externalRegistrationLink: '',
  tagsString: '',
};

export default function CreateEditMeetup() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  const fileRef = useRef();

  const [form, setForm] = useState(initialForm);
  const [images, setImages] = useState([]);
  const [pendingFiles, setPendingFiles] = useState([]);
  const [meetupStatus, setMeetupStatus] = useState('draft');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const update = useCallback((key, val) => setForm((p) => ({ ...p, [key]: val })), []);

  useEffect(() => {
    if (!isEditMode) return;

    let cancelled = false;
    const loadMeetup = async () => {
      setLoading(true);
      try {
        const m = await meetupService.getById(id);
        if (cancelled) return;
        setForm({
          title: m.title || '',
          description: m.description || '',
          category: m.category || 'community',
          startDate: m.startDate ? new Date(m.startDate).toISOString().split('T')[0] : '',
          endDate: m.endDate ? new Date(m.endDate).toISOString().split('T')[0] : '',
          startTime: m.startTime || '',
          endTime: m.endTime || '',
          locationName: m.location?.name || '',
          locationAddress: m.location?.address || '',
          locationCity: m.location?.city || 'Pune',
          mapsLink: m.location?.mapsLink || '',
          organizerName: m.organizer?.name || '',
          organizerContact: m.organizer?.contact || '',
          maxAttendees: m.maxAttendees || '',
          registrationDeadline: m.registrationDeadline
            ? new Date(m.registrationDeadline).toISOString().split('T')[0]
            : '',
          externalRegistrationLink: m.externalRegistrationLink || '',
          tagsString: m.tags ? m.tags.join(', ') : '',
        });
        setImages(m.images || []);
        setMeetupStatus(m.status || 'draft');
        } catch (err) {
          toast.error(err.message || 'Failed to load meetup details');
          navigate('/owner/meetups');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadMeetup();
    return () => { cancelled = true; };
  }, [id, isEditMode, navigate]);

  const handlePendingFiles = (fileList) => {
    const files = Array.from(fileList);
    const total = pendingFiles.length + images.length + files.length;
    if (total > MAX_MEETUP_IMAGES) {
      return toast.error(`Maximum ${MAX_MEETUP_IMAGES} photos allowed`);
    }
    setPendingFiles((prev) => [...prev, ...files]);
    if (fileRef.current) fileRef.current.value = '';
  };

  const removePendingFile = (index) => {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.title || form.title.trim().length < 3) {
      newErrors.title = 'Title is required (min 3 characters)';
    }
    if (!form.startDate) newErrors.startDate = 'Start date is required';
    if (!form.startTime) newErrors.startTime = 'Start time is required';
    if (!form.locationName) newErrors.locationName = 'Location name is required';
    if (!form.locationCity) newErrors.locationCity = 'City is required';
    if (form.maxAttendees && (isNaN(form.maxAttendees) || Number(form.maxAttendees) < 1)) {
      newErrors.maxAttendees = 'Max attendees must be a positive number';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const buildPayload = () => ({
    title: form.title,
    description: form.description,
    category: form.category,
    startDate: form.startDate,
    endDate: form.endDate || null,
    startTime: form.startTime,
    endTime: form.endTime || null,
    location: {
      name: form.locationName,
      address: form.locationAddress,
      mapsLink: form.mapsLink,
      city: form.locationCity,
    },
    organizer: {
      name: form.organizerName,
      contact: form.organizerContact,
    },
    maxAttendees: form.maxAttendees ? Number(form.maxAttendees) : null,
    registrationDeadline: form.registrationDeadline || null,
    externalRegistrationLink: form.externalRegistrationLink || null,
    tags: form.tagsString
      ? form.tagsString.split(',').map((t) => t.trim()).filter(Boolean)
      : [],
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please resolve form errors');
      return;
    }

    setSaving(true);
    try {
      const data = buildPayload();

      if (isEditMode) {
        const updated = await meetupService.update(id, data);
        setMeetupStatus(updated.status);
        toast.success(
          updated.status === 'pending_approval'
            ? 'Meetup updated — pending admin re-approval'
            : 'Meetup updated successfully!'
        );
      } else {
        const meetup = await meetupService.create(data);
        if (pendingFiles.length > 0) {
          await meetupService.uploadImages(meetup._id, pendingFiles, true);
        }
        toast.success('Meetup draft saved! Add photos and submit for approval.');
        navigate(`/owner/meetups/${meetup._id}/edit`);
        return;
      }
      navigate('/owner/meetups');
    } catch (err) {
      toast.error(err.message || 'Failed to save meetup');
    } finally {
      setSaving(false);
    }
  };

  const parsedTags = useMemo(
    () => (form.tagsString ? form.tagsString.split(',').map((t) => t.trim()).filter(Boolean) : []),
    [form.tagsString]
  );

  const totalPhotoCount = images.length + pendingFiles.length;
  const coverPreviewUrl = useMemo(() => {
    const uploadedCover = getMeetupCoverUrl({ images });
    if (uploadedCover) return uploadedCover;
    if (pendingFiles[0]) return URL.createObjectURL(pendingFiles[0]);
    return null;
  }, [images, pendingFiles]);

  const backAction = (
    <Button variant="secondary" size="sm" onClick={() => navigate('/owner/meetups')} icon={<ArrowLeft size={16} />}>
      Back to Meetups
    </Button>
  );

  return (
    <PageWrapper
      title={isEditMode ? 'Edit Meetup' : 'Create Meetup'}
      subtitle="Schedule an event — goes live after admin approval"
      action={backAction}
    >
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card" style={{ height: 180 }} />
          <div className="card" style={{ height: 300 }} />
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {meetupStatus === 'pending_approval' && (
              <div
                className="card"
                style={{ background: '#fffbeb', border: '1px solid #fcd34d', padding: '1rem' }}
                role="status"
              >
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <Info size={18} color="#b45309" style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <p style={{ fontWeight: 600, color: '#92400e', marginBottom: 4 }}>Awaiting admin approval</p>
                    <p style={{ fontSize: '0.875rem', color: '#a16207' }}>
                      Your meetup has been submitted. It will go live once an admin approves it, similar to PG listings.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Photos */}
            <div className="card">
              <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '0.5rem', color: '#1f2937', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ImageIcon size={18} color="#4f46e5" /> Event Photos *
              </h3>
              <p style={{ fontSize: '0.8125rem', color: '#6b7280', marginBottom: '1rem' }}>
                Upload {MIN_MEETUP_IMAGES}–{MAX_MEETUP_IMAGES} photos. Required before submitting for approval.
              </p>

              {isEditMode ? (
                <MeetupImageUploader
                  meetupId={id}
                  currentPhotos={images}
                  onUploaded={setImages}
                />
              ) : (
                <>
                  <div
                    className="upload-area"
                    onClick={() => fileRef.current?.click()}
                    style={{ cursor: 'pointer' }}
                    role="button"
                    tabIndex={0}
                    aria-label="Select meetup photos"
                  >
                    <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                      Click to select photos (uploaded after saving draft)
                    </p>
                    <input
                      ref={fileRef}
                      type="file"
                      multiple
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(e) => handlePendingFiles(e.target.files)}
                      hidden
                    />
                  </div>
                  {pendingFiles.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '1rem' }}>
                      {pendingFiles.map((file, i) => (
                        <div key={`${file.name}-${i}`} style={{ position: 'relative', width: 110, height: 82, borderRadius: 8, overflow: 'hidden' }}>
                          <img src={URL.createObjectURL(file)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <button
                            type="button"
                            onClick={() => removePendingFile(i)}
                            style={{
                              position: 'absolute', top: 4, right: 4, width: 20, height: 20,
                              borderRadius: '50%', background: 'rgba(0,0,0,0.55)', color: '#fff', border: 'none', cursor: 'pointer',
                            }}
                            aria-label={`Remove pending photo ${i + 1}`}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.5rem' }}>
                    {totalPhotoCount} / {MAX_MEETUP_IMAGES} selected
                  </p>
                </>
              )}
            </div>

            {/* Basic Info */}
            <div className="card">
              <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '1.25rem', color: '#1f2937', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar size={18} color="#4f46e5" /> Event Information
              </h3>
              <Input
                label="Event Title *"
                value={form.title}
                onChange={(e) => update('title', e.target.value)}
                error={errors.title}
                placeholder="e.g. Weekly Career Discussion or Board Games Night"
              />
              <div className="grid-2" style={{ marginTop: '1rem' }}>
                <div className="form-group">
                  <label className="label">Category *</label>
                  <select className="input" value={form.category} onChange={(e) => update('category', e.target.value)}>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <Input
                  label="Tags (Comma separated)"
                  value={form.tagsString}
                  onChange={(e) => update('tagsString', e.target.value)}
                  placeholder="e.g. coding, help, networking"
                />
              </div>
              <div style={{ marginTop: '1rem' }} className="form-group">
                <label className="label">Description</label>
                <textarea
                  className="input"
                  rows={4}
                  value={form.description}
                  onChange={(e) => update('description', e.target.value)}
                  placeholder="What is the meetup about?"
                />
              </div>
            </div>

            {/* Date and Time */}
            <div className="card">
              <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '1.25rem', color: '#1f2937', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar size={18} color="#f59e0b" /> Date & Time
              </h3>
              <div className="grid-2">
                <Input label="Start Date *" type="date" value={form.startDate} onChange={(e) => update('startDate', e.target.value)} error={errors.startDate} />
                <Input label="End Date (Optional)" type="date" value={form.endDate} onChange={(e) => update('endDate', e.target.value)} />
              </div>
              <div className="grid-2" style={{ marginTop: '1rem' }}>
                <Input label="Start Time *" value={form.startTime} onChange={(e) => update('startTime', e.target.value)} error={errors.startTime} placeholder="10:00 AM" />
                <Input label="End Time (Optional)" value={form.endTime} onChange={(e) => update('endTime', e.target.value)} placeholder="12:30 PM" />
              </div>
            </div>

            {/* Location */}
            <div className="card">
              <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '1.25rem', color: '#1f2937', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MapPin size={18} color="#dc2626" /> Location Details
              </h3>
              <div className="grid-2">
                <Input label="Venue / Location Name *" value={form.locationName} onChange={(e) => update('locationName', e.target.value)} error={errors.locationName} placeholder="e.g. Common Lounge" />
                <div className="form-group">
                  <label className="label">City *</label>
                  <select className="input" value={form.locationCity} onChange={(e) => update('locationCity', e.target.value)}>
                    <option value="Pune">Pune</option>
                    <option value="Mumbai">Mumbai</option>
                    <option value="Delhi">Delhi</option>
                  </select>
                </div>
              </div>
              <div style={{ marginTop: '1rem' }}>
                <Input label="Full Street Address" value={form.locationAddress} onChange={(e) => update('locationAddress', e.target.value)} />
              </div>
              <div style={{ marginTop: '1rem' }}>
                <Input label="Google Maps Link" value={form.mapsLink} onChange={(e) => update('mapsLink', e.target.value)} placeholder="https://maps.google.com/..." />
              </div>
            </div>

            {/* Organizer */}
            <div className="card">
              <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '1.25rem', color: '#1f2937', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <User size={18} color="#10b981" /> Organizer & Registrations
              </h3>
              <div className="grid-2">
                <Input label="Organizer Name" value={form.organizerName} onChange={(e) => update('organizerName', e.target.value)} />
                <Input label="Organizer Contact" value={form.organizerContact} onChange={(e) => update('organizerContact', e.target.value)} />
              </div>
              <div className="grid-2" style={{ marginTop: '1rem' }}>
                <Input label="Max Attendees (Optional)" type="number" value={form.maxAttendees} onChange={(e) => update('maxAttendees', e.target.value)} error={errors.maxAttendees} />
                <Input label="Registration Deadline (Optional)" type="date" value={form.registrationDeadline} onChange={(e) => update('registrationDeadline', e.target.value)} />
              </div>
              <div style={{ marginTop: '1rem' }}>
                <Input label="External Registration URL" value={form.externalRegistrationLink} onChange={(e) => update('externalRegistrationLink', e.target.value)} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <Button type="button" variant="secondary" size="lg" onClick={() => navigate('/owner/meetups')}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="lg" loading={saving}>
                <Save size={18} /> {isEditMode ? 'Save Meetup' : 'Save as Draft'}
              </Button>
            </div>
          </form>

          {/* Preview */}
          <div style={{ position: 'sticky', top: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#374151', marginBottom: '0.75rem' }}>Meetup Card Preview</h3>
            <div className="pg-card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{
                height: '140px',
                background: coverPreviewUrl
                  ? `url(${coverPreviewUrl}) center/cover`
                  : 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                display: 'flex',
                alignItems: 'flex-end',
                padding: '10px',
                position: 'relative',
              }}>
                <span style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(255,255,255,0.2)', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                  {form.category.toUpperCase()}
                </span>
                <span className="badge badge-draft" style={{ position: 'absolute', top: '12px', left: '12px', margin: 0 }}>
                  {meetupStatus.replace('_', ' ')}
                </span>
                <div style={{ color: 'white', width: '100%' }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {form.title || 'Untitled Event'}
                  </div>
                </div>
              </div>
              <div className="pg-card-body">
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#4b5563', marginBottom: '6px' }}>
                  <Calendar size={13} color="#4f46e5" />
                  <span>
                    {form.startDate ? new Date(form.startDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }) : 'Date'} at {form.startTime || 'Time'}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#4b5563', marginBottom: '12px' }}>
                  <MapPin size={13} color="#dc2626" />
                  <span>{form.locationName || 'Venue'}, {form.locationCity}</span>
                </div>
                {parsedTags.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', borderTop: '1px solid #f3f4f6', paddingTop: '8px' }}>
                    {parsedTags.map((tag, idx) => (
                      <span key={idx} style={{ background: '#f3f4f6', color: '#4b5563', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem' }}>
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </PageWrapper>
  );
}
