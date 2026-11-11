import { useState, useEffect, useCallback, useRef } from 'react';
import {
  adminListGalleryPhotos,
  createGalleryPhoto,
  updateGalleryPhoto,
  deleteGalleryPhoto,
  adminListGalleryCategories,
  createGalleryCategory,
  updateGalleryCategory,
  deleteGalleryCategory,
} from '../../lib/admin.js';
import { uploadGalleryImage, uploadGalleryImages, deleteGalleryImageByUrl } from '../../lib/galleryUpload.js';

const GALLERY_SHAPES = ['square', 'tall', 'wide', 'big'];

export function GalleryAdminView() {
  const [rows, setRows] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null);
  const [batchOpen, setBatchOpen] = useState(false);
  const [managingCategories, setManagingCategories] = useState(false);

  const load = useCallback(async () => {
    setError('');
    try {
      const [photos, cats] = await Promise.all([
        adminListGalleryPhotos(),
        adminListGalleryCategories(),
      ]);
      setRows(photos);
      setCategories(cats);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      await load();
      if (!active) return;
    })();
    return () => { active = false; };
  }, [load]);

  const refresh = async () => {
    setLoading(true);
    await load();
  };

  const refreshCategories = async () => {
    const cats = await adminListGalleryCategories();
    setCategories(cats);
    return cats;
  };

  const onDelete = async (row) => {
    if (!confirm(`Delete this photo permanently? This removes it from the site and storage.`)) return;
    try {
      await deleteGalleryPhoto(row.id);
      if (row.image_url) await deleteGalleryImageByUrl(row.image_url);
      refresh();
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <>
      <div className="admin-head">
        <h2>Gallery</h2>
        <div className="admin-row-actions">
          <button className="btn btn-ghost btn-sm" onClick={() => setManagingCategories(true)}>
            Categories
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => setBatchOpen(true)}>
            Add photos <span className="arrow">→</span>
          </button>
        </div>
      </div>

      {error && <div className="admin-error">{error}</div>}
      {loading && <p>Loading…</p>}

      {!loading && rows.length === 0 && (
        <div className="empty-state">
          <h4>No photos yet.</h4>
          <p>Click "Add photos" to upload the first Saturday frames.</p>
        </div>
      )}

      {!loading && rows.length > 0 && (
        <div className="admin-photo-grid">
          {rows.map((r) => (
            <div key={r.id} className="admin-photo-card">
              <div className="admin-photo-thumb" onClick={() => setEditing(r)}>
                {r.image_url ? <img src={r.image_url} alt={r.caption || ''} loading="lazy" /> : <span>no image</span>}
                {!r.is_published && <span className="admin-photo-badge">hidden</span>}
              </div>
              <div className="admin-photo-meta">
                <span className="admin-photo-cap">{r.caption || '(no caption)'}</span>
                <span className="admin-photo-sub">{r.date_label || ''} · {r.place || ''}</span>
                <div className="admin-row-actions">
                  <a onClick={() => setEditing(r)}>Edit</a>
                  <a className="danger" onClick={() => onDelete(r)}>Delete</a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <GalleryEditor
          photo={editing}
          categories={categories}
          refreshCategories={refreshCategories}
          close={() => setEditing(null)}
          onSaved={() => { setEditing(null); refresh(); }}
        />
      )}
      {batchOpen && (
        <GalleryBatchAdd
          categories={categories}
          refreshCategories={refreshCategories}
          close={() => setBatchOpen(false)}
          onSaved={() => { setBatchOpen(false); refresh(); }}
          onPartialSaved={refresh}
        />
      )}
      {managingCategories && (
        <CategoryManager
          categories={categories}
          refreshCategories={refreshCategories}
          close={() => setManagingCategories(false)}
        />
      )}
    </>
  );
}

function CategorySelect({ value, onChange, categories, refreshCategories }) {
  const addNew = async () => {
    const label = prompt('New category name');
    if (!label?.trim()) return;
    try {
      const created = await createGalleryCategory(label);
      await refreshCategories();
      onChange(created.key);
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <select
      value={value || ''}
      onChange={(e) => {
        if (e.target.value === '__new__') {
          addNew();
          return;
        }
        onChange(e.target.value);
      }}
    >
      {categories.map((c) => (
        <option key={c.id || c.key} value={c.key}>{c.label}</option>
      ))}
      <option value="__new__">+ Add new category…</option>
    </select>
  );
}

function CategoryManager({ categories, refreshCategories, close }) {
  const [label, setLabel] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const add = async () => {
    if (busy || !label.trim()) return;
    setBusy(true);
    setError('');
    try {
      await createGalleryCategory(label);
      setLabel('');
      await refreshCategories();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const rename = async (cat) => {
    const next = prompt('Rename category', cat.label);
    if (!next?.trim() || next.trim() === cat.label) return;
    setError('');
    try {
      await updateGalleryCategory(cat.id, { label: next.trim() });
      await refreshCategories();
    } catch (e) {
      setError(e.message);
    }
  };

  const remove = async (cat) => {
    if (!confirm(`Remove "${cat.label}"? Existing photos keep their saved category key.`)) return;
    setError('');
    try {
      await deleteGalleryCategory(cat.id);
      await refreshCategories();
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="admin-drawer-scrim" onClick={close}>
      <div className="admin-drawer" onClick={(e) => e.stopPropagation()}>
        <h3>Categories</h3>
        {error && <div className="admin-error">{error}</div>}

        <div className="field-row">
          <div className="field">
            <label>New category</label>
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && add()}
              placeholder="Sunday lunch"
            />
          </div>
          <div className="field" style={{ flex: '0 0 auto', alignSelf: 'end' }}>
            <button className="btn btn-primary btn-sm" onClick={add} disabled={busy}>
              {busy ? 'Adding…' : 'Add'}
            </button>
          </div>
        </div>

        {categories.length === 0 && (
          <div className="empty-state">
            <h4>No categories yet.</h4>
            <p>Add one here, or use the inline category dropdown.</p>
          </div>
        )}

        {categories.length > 0 && (
          <table className="admin-table">
            <thead>
              <tr><th>Label</th><th>Key</th><th></th></tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id}>
                  <td className="row-title">{cat.label}</td>
                  <td>{cat.key}</td>
                  <td>
                    <div className="admin-row-actions">
                      <a onClick={() => rename(cat)}>Rename</a>
                      <a className="danger" onClick={() => remove(cat)}>Remove</a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="admin-drawer-foot">
          <button className="btn btn-primary" onClick={close}>Done</button>
        </div>
      </div>
    </div>
  );
}

function GalleryBatchAdd({
  categories,
  refreshCategories,
  close,
  onSaved,
  onPartialSaved,
}) {
  const [files, setFiles] = useState([]);
  const [f, setF] = useState({
    category: categories[0]?.key || 'saturday',
    shape: 'square',
    date_label: '',
  });
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState('');
  const filesRef = useRef([]);

  useEffect(() => {
    filesRef.current = files;
  }, [files]);

  useEffect(() => {
    return () => filesRef.current.forEach((item) => URL.revokeObjectURL(item.preview));
  }, []);

  const set = (k, v) => setF((prev) => ({ ...prev, [k]: v }));

  const addFiles = (incoming) => {
    const nextFiles = Array.from(incoming || []).filter((file) =>
      file.type.startsWith('image/')
    );
    if (!nextFiles.length) return;
    setFiles((prev) => [
      ...prev,
      ...nextFiles.map((file) => ({
        id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2)}`,
        file,
        preview: URL.createObjectURL(file),
      })),
    ]);
  };

  const removeFile = (id) => {
    setFiles((prev) => {
      const item = prev.find((x) => x.id === id);
      if (item) URL.revokeObjectURL(item.preview);
      return prev.filter((x) => x.id !== id);
    });
  };

  const onDrop = (e) => {
    e.preventDefault();
    addFiles(e.dataTransfer?.files);
  };

  const save = async () => {
    if (busy) return;
    if (!files.length) {
      setError('Choose at least one image.');
      return;
    }
    setBusy(true);
    setError('');
    setProgress(`Uploading 0 of ${files.length}…`);
    try {
      const { urls, errors } = await uploadGalleryImages(
        files.map((item) => item.file),
        (done, total) => setProgress(`Uploading ${done} of ${total}…`)
      );
      for (const url of urls) {
        await createGalleryPhoto({
          image_url: url,
          category: f.category,
          shape: f.shape,
          date_label: f.date_label,
          is_published: true,
        });
      }

      if (errors.length) {
        const failedNames = new Set(errors.map((item) => item.name));
        setFiles((prev) => {
          prev
            .filter((item) => !failedNames.has(item.file.name))
            .forEach((item) => URL.revokeObjectURL(item.preview));
          return prev.filter((item) => failedNames.has(item.file.name));
        });
        setError(
          `Some uploads failed: ${errors
            .map((item) => `${item.name} (${item.message})`)
            .join(', ')}`
        );
        setProgress('');
        await onPartialSaved();
        setBusy(false);
        return;
      }

      onSaved();
    } catch (e) {
      setError(e.message);
      setBusy(false);
      setProgress('');
    }
  };

  return (
    <div className="admin-drawer-scrim" onClick={close}>
      <div className="admin-drawer" onClick={(e) => e.stopPropagation()}>
        <h3>Add photos</h3>
        {error && <div className="admin-error">{error}</div>}

        <div
          className="admin-dropzone"
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop}
          onClick={() => document.getElementById('gallery-batch-input').click()}
        >
          <div className="admin-dropzone-empty">
            {progress || 'Drag photos here, or click to choose'}
          </div>
        </div>
        <input
          id="gallery-batch-input"
          type="file"
          accept="image/*"
          multiple
          style={{ display: 'none' }}
          onChange={(e) => addFiles(e.target.files)}
        />

        {files.length > 0 && (
          <div className="admin-batch-thumbs">
            {files.map((item) => (
              <div className="admin-batch-thumb" key={item.id}>
                <img src={item.preview} alt={item.file.name} />
                <button type="button" onClick={() => removeFile(item.id)}>✕</button>
              </div>
            ))}
          </div>
        )}

        <div className="field-row" style={{ marginTop: 18 }}>
          <div className="field">
            <label>Category</label>
            <CategorySelect
              value={f.category}
              onChange={(value) => set('category', value)}
              categories={categories}
              refreshCategories={refreshCategories}
            />
          </div>
          <div className="field">
            <label>Tile shape</label>
            <select value={f.shape} onChange={(e) => set('shape', e.target.value)}>
              {GALLERY_SHAPES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="field">
          <label>Date label</label>
          <input
            value={f.date_label}
            onChange={(e) => set('date_label', e.target.value)}
            placeholder="APR 13, 2026"
          />
        </div>

        <div className="admin-drawer-foot">
          <button className="btn btn-ghost" onClick={close} disabled={busy}>Cancel</button>
          <button className="btn btn-primary" onClick={save} disabled={busy}>
            {busy ? 'Saving…' : 'Add to gallery'} <span className="arrow">→</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function GalleryEditor({ photo, categories, refreshCategories, close, onSaved }) {
  const isNew = !photo;
  const [f, setF] = useState({
    image_url: photo?.image_url || '',
    caption: photo?.caption || '',
    place: photo?.place || '',
    date_label: photo?.date_label || '',
    category: photo?.category || categories[0]?.key || 'saturday',
    shape: photo?.shape || 'square',
    is_published: photo?.is_published ?? true,
    sort_order: photo?.sort_order ?? 0,
  });
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const set = (k, v) => setF((prev) => ({ ...prev, [k]: v }));

  const handleFile = async (file) => {
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const { url } = await uploadGalleryImage(file);
      set('image_url', url);
    } catch (e) {
      setError(e.message);
    } finally {
      setUploading(false);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer?.files?.[0];
    if (file) handleFile(file);
  };

  const save = async () => {
    if (busy) return;
    if (!f.image_url) {
      setError('Please upload an image first.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      if (isNew) await createGalleryPhoto(f);
      else await updateGalleryPhoto(photo.id, f);
      onSaved();
    } catch (e) {
      setError(e.message);
      setBusy(false);
    }
  };

  return (
    <div className="admin-drawer-scrim" onClick={close}>
      <div className="admin-drawer" onClick={(e) => e.stopPropagation()}>
        <h3>{isNew ? 'Add photo' : 'Edit photo'}</h3>
        {error && <div className="admin-error">{error}</div>}

        <div
          className="admin-dropzone"
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop}
          onClick={() => document.getElementById('gallery-file-input').click()}
        >
          {f.image_url ? (
            <img src={f.image_url} alt="preview" className="admin-dropzone-preview" />
          ) : (
            <div className="admin-dropzone-empty">
              {uploading ? 'Uploading…' : 'Drag a photo here, or click to choose'}
            </div>
          )}
          {uploading && f.image_url && <div className="admin-dropzone-overlay">Uploading…</div>}
        </div>
        <input
          id="gallery-file-input"
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        {f.image_url && (
          <button
            className="btn btn-ghost btn-sm"
            style={{ marginBottom: 16 }}
            onClick={() => document.getElementById('gallery-file-input').click()}
          >
            Replace image
          </button>
        )}

        <div className="field">
          <label>Caption</label>
          <textarea value={f.caption} onChange={(e) => set('caption', e.target.value)} placeholder="A short, true sentence about this frame." />
        </div>
        <div className="field-row">
          <div className="field">
            <label>Place</label>
            <input value={f.place} onChange={(e) => set('place', e.target.value)} placeholder="Garden St., Titusville" />
          </div>
          <div className="field">
            <label>Date label</label>
            <input value={f.date_label} onChange={(e) => set('date_label', e.target.value)} placeholder="APR 13, 2026" />
          </div>
        </div>
        <div className="field-row">
          <div className="field">
            <label>Category</label>
            <CategorySelect
              value={f.category}
              onChange={(value) => set('category', value)}
              categories={categories}
              refreshCategories={refreshCategories}
            />
          </div>
          <div className="field">
            <label>Tile shape</label>
            <select value={f.shape} onChange={(e) => set('shape', e.target.value)}>
              {GALLERY_SHAPES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div className="field">
          <label>
            <input type="checkbox" checked={f.is_published} onChange={(e) => set('is_published', e.target.checked)} style={{ width: 'auto', marginRight: 8 }} />
            Published (visible in the public gallery)
          </label>
        </div>

        <div className="admin-drawer-foot">
          <button className="btn btn-ghost" onClick={close} disabled={busy}>Cancel</button>
          <button className="btn btn-primary" onClick={save} disabled={busy || uploading}>
            {busy ? 'Saving…' : isNew ? 'Add to gallery' : 'Save changes'} <span className="arrow">→</span>
          </button>
        </div>
      </div>
    </div>
  );
}
