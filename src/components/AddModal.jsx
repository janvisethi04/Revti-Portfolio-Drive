import { useState } from 'react'

export default function AddModal({ onClose, onSave, saving }) {
  const [project, setProject]   = useState('')
  const [name, setName]         = useState('')
  const [url, setUrl]           = useState('')
  const [validErr, setValidErr] = useState('')

  const isValidUrl = (str) => {
    try { new URL(str); return true } catch { return false }
  }

  const handleSave = (e) => {
    if (e) e.preventDefault()
    if (!project.trim() || !name.trim() || !url.trim()) {
      setValidErr('Please fill in all fields')
      return
    }
    if (!isValidUrl(url.trim())) {
      setValidErr('Please enter a valid URL (including https://)')
      return
    }
    setValidErr('')
    onSave({ project: project.trim(), name: name.trim(), url: url.trim() })
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h3>Add New Link</h3>
          <button className="btn-close" onClick={onClose}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSave}>
          <div className="form-field">
            <label>Project</label>
            <input
              type="text"
              value={project}
              onChange={e => setProject(e.target.value)}
              placeholder="e.g. Portfolio Drive"
              autoFocus
            />
          </div>

          <div className="form-field">
            <label>Name / Description</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Design Assets"
            />
          </div>

          <div className="form-field">
            <label>Target URL</label>
            <input
              type="url"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://drive.google.com/…"
            />
          </div>

          {validErr && <p className="form-error">{validErr}</p>}

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose} disabled={saving}>Cancel</button>
            <button type="submit" className="btn-save" disabled={saving}>
              {saving ? 'Saving…' : 'Save Link'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
