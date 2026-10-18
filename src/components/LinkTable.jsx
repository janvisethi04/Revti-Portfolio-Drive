import { useState } from 'react'

export default function LinkTable({ entries, loading, onDelete }) {
  const [search, setSearch]     = useState('')
  const [copiedId, setCopiedId] = useState(null)

  const formatDate = (iso) => {
    const d = new Date(iso)
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  const truncateUrl = (url) => {
    try {
      const u = new URL(url)
      const s = u.hostname + u.pathname
      return s.length > 35 ? s.substring(0, 35) + '…' : s
    } catch {
      return url.length > 35 ? url.substring(0, 35) + '…' : url
    }
  }

  const copyUrl = (url, id) => {
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    })
  }

  const filtered = entries.filter(e =>
    e.project.toLowerCase().includes(search.toLowerCase()) ||
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.url.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
      <div className="search-bar">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by project, name or URL…"
        />
      </div>

      <div className="table-card">
        <div className="table-wrapper">
          {loading ? (
            <div className="empty-state">
              <div className="empty-icon">⏳</div>
              <p>Loading links…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">{search ? '🔎' : '📭'}</div>
              <p>{search ? 'No results found' : 'No links added yet'}</p>
              {!search && <small>Click "Add New Link" to get started!</small>}
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>📅 Date</th>
                  <th>📁 Project</th>
                  <th>👤 Name</th>
                  <th>🔗 URL</th>
                  <th>⚡ Actions</th>
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
                        🔗 {truncateUrl(entry.url)}
                      </a>
                    </td>
                    <td>
                      <div className="actions-cell">
                        <button
                          className={`btn-copy ${copiedId === entry.id ? 'copied' : ''}`}
                          onClick={() => copyUrl(entry.url, entry.id)}
                        >
                          {copiedId === entry.id ? '✅ Copied!' : '📋 Copy'}
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() => onDelete(entry.id)}
                        >
                          🗑️
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
    </>
  )
}
