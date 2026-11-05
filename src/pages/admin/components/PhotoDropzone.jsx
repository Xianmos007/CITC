import { useRef, useState } from 'react';
import { uploadGalleryImage } from '../../../lib/galleryUpload.js';

// Optional photo for an opportunity: drag-and-drop or click to choose,
// uploaded to the gallery bucket (compressed by galleryUpload.js).
export function PhotoDropzone({ value, onChange, onError }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file) => {
    if (!file) return;
    setUploading(true);
    onError?.('');
    try {
      const { url } = await uploadGalleryImage(file);
      onChange(url);
    } catch (e) {
      onError?.(e.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <div
        className="admin-dropzone"
        role="button"
        tabIndex={0}
        aria-label={value ? 'Replace photo' : 'Choose a photo'}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFile(e.dataTransfer?.files?.[0]);
        }}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
      >
        {value ? (
          <img src={value} alt="" className="admin-dropzone-preview" />
        ) : (
          <div className="admin-dropzone-empty">
            {uploading ? 'Uploading…' : 'Drag a photo here, or click to choose'}
          </div>
        )}
        {uploading && value && <div className="admin-dropzone-overlay">Uploading…</div>}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      {value && (
        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => inputRef.current?.click()}>
            Replace photo
          </button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => onChange('')}>
            Remove photo
          </button>
        </div>
      )}
    </>
  );
}
