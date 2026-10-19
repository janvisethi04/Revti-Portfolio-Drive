import { useState } from 'react'

export default function LinkTable({ entries, loading, onDelete }) {
  const [search, setSearch]             = useState('')
  const [copiedId, setCopiedId]         = useState(null)
  const [itemToDelete, setItemToDelete] = useState(null)

  const formatDate = (iso) => {
    const d = new Date(iso)
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  const truncateUrl = (url) => {
    try {
      const u = new URL(url)
      const s = u.hostname + u.pathname
      return s.length > 32 ? s.substring(0, 32) + '…' : s
    } catch {
      return url.length > 32 ? url.substring(0, 32) + '…' : url
    }
  }

  const copyUrl = (url, id) => {
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    })
  }

  const confirmDelete = () => {
    if (itemToDelete) {
      onDelete(itemToDelete.id)
      setItemToDelete(null)
    }
  }

  const filtered = entries.filter(e =>
    e.project.toLowerCase().includes(search.toLowerCase()) ||
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.url.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
      <div className="search-bar">
        <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search projects, names or links…"
        />
      </div>

      <div className="table-card">
        <div className="table-wrapper">
          {loading ? (
            <div className="empty-state">
              <p>Loading links…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <p>{search ? 'No matching links found' : 'No links added yet'}</p>
              {!search && <small>Click "Add Link" above to store your first link.</small>}
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Project</th>
                  <th>Name</th>
                  <th>URL</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(entry => (
                  <tr key={entry.id}>
                    <td className="date-cell">{formatDate(entry.created_at)}</td>
                    <td><span className="project-badge">{entry.project}</span></td>
                    <td className="name-cell">{entry.name}</td>
                    <td className="url-cell">
                      <a
                        className="url-link"
                        href={entry.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={entry.url}
                      >
                        {truncateUrl(entry.url)}
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                          <polyline points="15 3 21 3 21 9"></polyline>
                          <line x1="10" y1="14" x2="21" y2="3"></line>
                        </svg>
                      </a>
                    </td>
                    <td>
                      <div className="actions-cell">
                        <button
                          className={`btn-copy ${copiedId === entry.id ? 'copied' : ''}`}
                          onClick={() => copyUrl(entry.url, entry.id)}
                        >
                          {copiedId === entry.id ? 'Copied' : 'Copy'}
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() => setItemToDelete(entry)}
                          title="Delete entry"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setItemToDelete(null)}>
          <div className="modal modal-confirm">
            <div className="confirm-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
              </svg>
            </div>
            <h3>Delete this link?</h3>
            <p>
              Are you sure you want to remove <strong>"{itemToDelete.name}"</strong>? This action cannot be undone.
            </p>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setItemToDelete(null)}>Cancel</button>
              <button className="btn-danger" onClick={confirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
