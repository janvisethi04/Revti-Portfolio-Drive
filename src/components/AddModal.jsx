import { useState } from 'react'

export default function AddModal({ onClose, onSave, saving }) {
  const [project, setProject] = useState('')
  const [name, setName]       = useState('')
  const [url, setUrl]         = useState('')
  const [validErr, setValidErr] = useState('')

  const isValidUrl = (str) => {
    try { new URL(str); return true } catch { return false }
  }

  const handleSave = () => {
    if (!project.trim() || !name.trim() || !url.trim()) {
      setValidErr('⚠️ Please fill all fields!')
      return
    }
    if (!isValidUrl(url.trim())) {
      setValidErr('⚠️ Please enter a valid URL (include https://)')
      return
    }
    setValidErr('')
    onSave({ project: project.trim(), name: name.trim(), url: url.trim() })
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h3>✨ Add New Link</h3>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>

        <div className="form-field">
          <label>Project</label>
          <input
            type="text"
            value={project}
            onChange={e => setProject(e.target.value)}
            placeholder="e.g. Website Redesign"
            autoFocus
          />
        </div>
        <div className="form-field">
          <label>Name / Description</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Figma Design File"
          />
        </div>
        <div className="form-field">
          <label>URL</label>
          <input
            type="url"
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="https://drive.google.com/…"
            onKeyDown={e => e.key === 'Enter' && handleSave()}
          />
        </div>

        {validErr && <p className="form-error">{validErr}</p>}

        <div className="modal-actions">
          <button className="btn-cancel" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="btn-save" onClick={handleSave} disabled={saving}>
            {saving ? '⏳ Saving…' : '💾 Save Link'}
          </button>
        </div>
      </div>
    </div>
  )
}
