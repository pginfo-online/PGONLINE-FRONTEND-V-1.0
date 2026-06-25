import { useRef, useState, useEffect, useCallback } from 'react';
import { Upload, X, Star } from 'lucide-react';
import meetupService from '../../services/meetup.service';
import toast from 'react-hot-toast';
import { MAX_MEETUP_IMAGES, MIN_MEETUP_IMAGES } from '../../utils/meetupHelpers';

/**
 * MeetupImageUploader — photo uploader for meetup events (3–4 images)
 */
export default function MeetupImageUploader({
  meetupId,
  currentPhotos = [],
  onUploaded,
  disabled = false,
}) {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [localPhotos, setLocalPhotos] = useState(currentPhotos);
  const fileRef = useRef();

  useEffect(() => {
    setLocalPhotos(currentPhotos);
  }, [currentPhotos]);

  const handleFiles = useCallback(async (files) => {
    const fileArr = Array.from(files);
    if (localPhotos.length + fileArr.length > MAX_MEETUP_IMAGES) {
      return toast.error(`Maximum ${MAX_MEETUP_IMAGES} photos allowed`);
    }
    if (!meetupId) {
      toast.error('Save the meetup draft first before uploading photos');
      return;
    }

    setUploading(true);
    try {
      const uploaded = await meetupService.uploadImages(
        meetupId,
        fileArr,
        localPhotos.length === 0
      );
      const merged = [...localPhotos, ...uploaded];
      setLocalPhotos(merged);
      onUploaded?.(merged);
      toast.success(`${fileArr.length} photo(s) uploaded`);
    } catch (err) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }, [localPhotos, meetupId, onUploaded]);

  const removePhoto = useCallback(async (publicId) => {
    if (meetupId) {
      setUploading(true);
      try {
        const res = await meetupService.deleteImage(meetupId, publicId);
        const updated = res.meetup?.images || localPhotos.filter((p) => p.publicId !== publicId);
        setLocalPhotos(updated);
        onUploaded?.(updated);
        toast.success('Photo removed');
      } catch (err) {
        toast.error('Failed to remove photo: ' + err.message);
      } finally {
        setUploading(false);
      }
      return;
    }

    const updated = localPhotos.filter((p) => p.publicId !== publicId);
    setLocalPhotos(updated);
    onUploaded?.(updated);
  }, [localPhotos, meetupId, onUploaded]);

  const setMainPhoto = useCallback(async (publicId) => {
    if (meetupId) {
      setUploading(true);
      try {
        const res = await meetupService.setMainImage(meetupId, publicId);
        const updated = res.meetup?.images || localPhotos.map((p) => ({
          ...p,
          isMain: p.publicId === publicId,
        }));
        setLocalPhotos(updated);
        onUploaded?.(updated);
      } catch (err) {
        toast.error(err.message || 'Failed to set cover photo');
      } finally {
        setUploading(false);
      }
      return;
    }

    const updated = localPhotos.map((p) => ({
      ...p,
      isMain: p.publicId === publicId,
    }));
    setLocalPhotos(updated);
    onUploaded?.(updated);
  }, [localPhotos, meetupId, onUploaded]);

  const photoCount = localPhotos.length;
  const meetsMinimum = photoCount >= MIN_MEETUP_IMAGES;
  const isFull = photoCount >= MAX_MEETUP_IMAGES;

  return (
    <div>
      <div
        className={`upload-area ${dragOver ? 'drag-over' : ''}`}
        onClick={() => !disabled && !uploading && !isFull && fileRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); if (!disabled && !isFull) setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (!disabled && !isFull) handleFiles(e.dataTransfer.files);
        }}
        style={{
          cursor: disabled || uploading || isFull ? 'not-allowed' : 'pointer',
          opacity: disabled || uploading ? 0.6 : 1,
        }}
        role="button"
        tabIndex={0}
        aria-label="Upload meetup photos"
        aria-disabled={disabled || isFull}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (!disabled && !isFull) fileRef.current?.click();
          }
        }}
      >
        {uploading ? (
          <>
            <div className="skeleton" style={{ width: 32, height: 32, borderRadius: '50%', margin: '0 auto 0.5rem' }} />
            <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Uploading...</p>
          </>
        ) : (
          <>
            <Upload size={32} color="#9ca3af" style={{ margin: '0 auto 0.5rem', display: 'block' }} />
            <p style={{ color: '#6b7280', fontSize: '0.875rem', fontWeight: 500 }}>
              {isFull ? 'Maximum photos reached' : 'Drag & drop photos here, or click to browse'}
            </p>
            <p style={{ color: '#d1d5db', fontSize: '0.75rem', marginTop: '0.25rem' }}>
              {MIN_MEETUP_IMAGES}–{MAX_MEETUP_IMAGES} photos required · JPEG, PNG, WebP · 10MB each
            </p>
          </>
        )}
        <input
          ref={fileRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => handleFiles(e.target.files)}
          hidden
          disabled={disabled || isFull}
          aria-hidden="true"
        />
      </div>

      {localPhotos.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '1rem' }}>
          {localPhotos.map((photo, i) => (
            <div
              key={photo.publicId || i}
              style={{
                position: 'relative',
                width: 110,
                height: 82,
                borderRadius: 8,
                overflow: 'hidden',
                border: photo.isMain ? '2px solid #4f46e5' : '1px solid #e5e7eb',
              }}
            >
              <img src={photo.url} alt={`Meetup photo ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <button
                type="button"
                onClick={() => setMainPhoto(photo.publicId)}
                disabled={uploading || disabled}
                style={{
                  position: 'absolute', top: 4, left: 4, width: 20, height: 20,
                  borderRadius: '50%', background: photo.isMain ? '#4f46e5' : 'rgba(0,0,0,0.55)',
                  color: '#fff', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
                title={photo.isMain ? 'Cover photo' : 'Set as cover'}
                aria-label={photo.isMain ? 'Current cover photo' : 'Set as cover photo'}
              >
                <Star size={10} fill={photo.isMain ? '#fff' : 'none'} color="#fff" />
              </button>
              <button
                type="button"
                onClick={() => removePhoto(photo.publicId)}
                disabled={uploading || disabled}
                style={{
                  position: 'absolute', top: 4, right: 4, width: 20, height: 20,
                  borderRadius: '50%', background: 'rgba(0,0,0,0.55)',
                  color: '#fff', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
                aria-label={`Remove photo ${i + 1}`}
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      <p
        style={{
          fontSize: '0.75rem',
          marginTop: '0.5rem',
          color: meetsMinimum ? '#059669' : '#b45309',
          fontWeight: 500,
        }}
        role="status"
        aria-live="polite"
      >
        {photoCount} / {MAX_MEETUP_IMAGES} photos
        {!meetsMinimum && ` · Add at least ${MIN_MEETUP_IMAGES - photoCount} more to submit for approval`}
        {meetsMinimum && ' · Ready to submit for admin approval'}
      </p>
    </div>
  );
}
