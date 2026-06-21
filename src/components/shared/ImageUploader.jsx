import { useRef, useState, useEffect } from 'react';
import { Upload, X, Image, Star } from 'lucide-react';
import pgService from '../../services/pg.service';
import toast from 'react-hot-toast';

/**
 * ImageUploader — drag-and-drop photo uploader for PG listings
 * @param {string} pgId - PG ID to attach images to
 * @param {Array} currentPhotos - Already uploaded photos
 * @param {function} onUploaded - Called with new photo array
 * @param {number} maxFiles
 */
export default function ImageUploader({ pgId, currentPhotos = [], onUploaded, maxFiles = 15 }) {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [localPhotos, setLocalPhotos] = useState(currentPhotos);
  const fileRef = useRef();

  useEffect(() => {
    setLocalPhotos(currentPhotos);
  }, [currentPhotos]);

  const handleFiles = async (files) => {
    const fileArr = Array.from(files);
    if (localPhotos.length + fileArr.length > maxFiles) {
      return toast.error(`Max ${maxFiles} photos allowed`);
    }
    if (!pgId) {
      toast.error('Save the PG first before uploading photos');
      return;
    }
    setUploading(true);
    try {
      const uploaded = await pgService.uploadImages(pgId, fileArr, localPhotos.length === 0);
      const merged = [...localPhotos, ...uploaded];
      setLocalPhotos(merged);
      onUploaded?.(merged);
      toast.success(`${fileArr.length} photo(s) uploaded`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = async (publicId) => {
    if (pgId) {
      setUploading(true);
      try {
        await pgService.deleteImage(pgId, publicId);
        toast.success('Photo removed successfully');
      } catch (err) {
        toast.error('Failed to remove photo: ' + err.message);
        setUploading(false);
        return;
      }
    }
    const updated = localPhotos.filter((p) => p.publicId !== publicId);
    setLocalPhotos(updated);
    onUploaded?.(updated);
    if (pgId) {
      setUploading(false);
    }
  };

  const setMainPhoto = (publicId) => {
    const updated = localPhotos.map((p) => ({
      ...p,
      isMain: p.publicId === publicId,
    }));
    setLocalPhotos(updated);
    onUploaded?.(updated);
  };

  return (
    <div>
      {/* Upload area */}
      <div
        className={`upload-area ${dragOver ? 'drag-over' : ''}`}
        onClick={() => fileRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
        style={{ cursor: uploading ? 'not-allowed' : 'pointer', opacity: uploading ? 0.6 : 1 }}
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
              Drag & drop photos here, or click to browse
            </p>
            <p style={{ color: '#d1d5db', fontSize: '0.75rem', marginTop: '0.25rem' }}>
              JPEG, PNG, WebP · Max {maxFiles} photos · 10MB each
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
        />
      </div>

      {/* Photo grid */}
      {localPhotos.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '1rem' }}>
          {localPhotos.map((photo, i) => (
            <div key={photo.publicId || i} style={{
              position: 'relative', width: 110, height: 82,
              borderRadius: 8, overflow: 'hidden',
              border: photo.isMain ? '2px solid #4f46e5' : '1px solid #e5e7eb',
            }}>
              <img src={photo.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <button
                type="button"
                onClick={() => setMainPhoto(photo.publicId)}
                style={{
                  position: 'absolute', top: 4, left: 4, width: 20, height: 20,
                  borderRadius: '50%', background: photo.isMain ? '#4f46e5' : 'rgba(0,0,0,0.55)',
                  color: '#fff', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s ease',
                }}
                title={photo.isMain ? 'Main cover photo' : 'Set as main cover'}
              >
                <Star size={10} fill={photo.isMain ? '#fff' : 'none'} color="#fff" />
              </button>
              {photo.isMain && (
                <div style={{
                  position: 'absolute', bottom: 4, left: 4,
                  background: '#4f46e5', borderRadius: 4,
                  padding: '2px 6px', fontSize: 10, color: '#fff', fontWeight: 600,
                  display: 'flex', alignItems: 'center', gap: 3,
                }}>
                  Main
                </div>
              )}
              <button
                type="button"
                onClick={() => removePhoto(photo.publicId)}
                style={{
                  position: 'absolute', top: 4, right: 4, width: 20, height: 20,
                  borderRadius: '50%', background: 'rgba(0,0,0,0.55)',
                  color: '#fff', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {localPhotos.length > 0 && (
        <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.5rem' }}>
          {localPhotos.length} / {maxFiles} photos · Click the star icon to set the main cover image
        </p>
      )}
    </div>
  );
}
