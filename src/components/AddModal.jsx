import { useState } from 'react'

export default function AddModal({ onClose, onSave, saving }) {
  const [project, setProject]   = useState('')
  const [name, setName]         = useState('')
  const [url, setUrl]           = useState('')
  const [thumbnail, setThumbnail] = useState('')
  const [validErr, setValidErr] = useState('')

  const isValidUrl = (str) => {
    try { new URL(str); return true } catch { return false }
  }

  const handleSave = (e) => {
    if (e) e.preventDefault()
    if (!project.trim() || !name.trim() || !url.trim()) {
      setValidErr('Please fill in project name, title and URL')
      return
    }
    if (!isValidUrl(url.trim())) {
      setValidErr('Please enter a valid URL (including https://)')
      return
    }
    setValidErr('')
    onSave({
      project: project.trim(),
      name: name.trim(),
      url: url.trim(),
      thumbnail: thumbnail.trim() || null
    })
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h3>Add Project</h3>
          <button className="btn-close" onClick={onClose} title="Close">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSave}>
          <div className="form-field">
            <label>Project / Category</label>
            <input
              type="text"
              value={project}
              onChange={e => setProject(e.target.value)}
              placeholder="e.g. WordPress, Client Site, Drive"
              autoFocus
            />
          </div>

          <div className="form-field">
            <label>Name / Title</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. cbetter.in or Design Assets"
            />
          </div>

          <div className="form-field">
            <label>Project URL</label>
            <input
              type="url"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://... (Website, Google Drive, etc.)"
            />
          </div>

          <div className="form-field">
            <label>
              Custom Thumbnail Image URL <span className="label-optional">(optional)</span>
            </label>
            <input
              type="url"
              value={thumbnail}
              onChange={e => setThumbnail(e.target.value)}
              placeholder="Leave empty for auto-generated preview"
            />
          </div>

          {validErr && <p className="form-error">{validErr}</p>}

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose} disabled={saving}>Cancel</button>
            <button type="submit" className="btn-save" disabled={saving}>
              {saving ? 'Saving…' : 'Save Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
