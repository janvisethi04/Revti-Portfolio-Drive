import { useState, useMemo } from 'react'

export default function ProjectGrid({ entries, loading, onDelete }) {
  const [search, setSearch]                     = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [copiedId, setCopiedId]                 = useState(null)
  const [itemToDelete, setItemToDelete]         = useState(null)

  const formatDate = (iso) => {
    if (!iso) return ''
    const d = new Date(iso)
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  const normalizeUrl = (url) => {
    if (!url) return ''
    let trimmed = url.trim()
    if (!/^https?:\/\//i.test(trimmed)) {
      trimmed = 'https://' + trimmed
    }
    return trimmed
  }

  const getDomainOrName = (entry) => {
    try {
      const u = new URL(normalizeUrl(entry.url))
      return u.hostname.replace(/^www\./, '')
    } catch {
      return entry.name || entry.project || 'Project'
    }
  }

  const isGoogleDrive = (url) => {
    if (!url) return false
    return url.includes('drive.google.com') || url.includes('docs.google.com')
  }

  const getPrimaryThumbnail = (entry) => {
    if (entry.thumbnail) return entry.thumbnail
    const norm = normalizeUrl(entry.url)
    if (isGoogleDrive(norm)) return null
    return `https://image.thum.io/get/width/600/crop/400/noanimate/${norm}`
  }

  const handleImageError = (e, entry) => {
    const norm = normalizeUrl(entry.url)
    const stage = e.target.dataset.stage || '1'

    if (stage === '1') {
      e.target.dataset.stage = '2'
      e.target.src = `https://s0.wp.com/mshots/v1/${encodeURIComponent(norm)}?w=600`
    } else if (stage === '2') {
      e.target.dataset.stage = '3'
      e.target.src = `https://api.microlink.io?url=${encodeURIComponent(norm)}&screenshot=true&meta=false&embed=screenshot.url`
    } else {
      e.target.style.display = 'none'
      if (e.target.nextElementSibling) {
        e.target.nextElementSibling.style.display = 'flex'
      }
    }
  }

  const handleCardClick = (url) => {
    const finalUrl = normalizeUrl(url)
    window.open(finalUrl, '_blank', 'noopener,noreferrer')
  }

  const handleCopy = (e, url, id) => {
    e.stopPropagation()
    const finalUrl = normalizeUrl(url)
    navigator.clipboard.writeText(finalUrl).then(() => {
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    })
  }

  const handleDeleteClick = (e, entry) => {
    e.stopPropagation()
    setItemToDelete(entry)
  }

  const confirmDelete = () => {
    if (itemToDelete) {
      onDelete(itemToDelete.id)
      setItemToDelete(null)
    }
  }

  // Predefined standard categories + any custom ones created by the user
  const standardCategories = ['All', 'Branding', 'Website', 'Marketing', 'Social Media', 'Design']

  const categoriesWithCounts = useMemo(() => {
    const counts = { All: entries.length }
    // Initialize standard categories
    standardCategories.forEach(cat => {
      if (cat !== 'All') counts[cat] = 0
    })

    entries.forEach(e => {
      const cat = e.project ? e.project.trim() : 'General'
      const matched = standardCategories.find(s => s.toLowerCase() === cat.toLowerCase())
      const key = matched || cat
      counts[key] = (counts[key] || 0) + 1
    })
    return counts
  }, [entries])

  const categoryList = useMemo(() => {
    return Object.keys(categoriesWithCounts)
  }, [categoriesWithCounts])

  // Filtering by both Category and Search query
  const filtered = useMemo(() => {
    return entries.filter(e => {
      const entryCat = e.project ? e.project.trim().toLowerCase() : 'general'
      const matchesCategory =
        selectedCategory === 'All' ||
        entryCat === selectedCategory.toLowerCase()

      const q = search.trim().toLowerCase()
      const matchesSearch =
        !q ||
        (e.project && e.project.toLowerCase().includes(q)) ||
        (e.name && e.name.toLowerCase().includes(q)) ||
        (e.url && e.url.toLowerCase().includes(q))

      return matchesCategory && matchesSearch
    })
  }, [entries, selectedCategory, search])

  return (
    <>
      {/* Search and Category Filter Bar */}
      <div className="filter-section">
        {/* Search Input */}
        <div className="search-bar">
          <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search projects or links…"
          />
          {search && (
            <button className="clear-search" onClick={() => setSearch('')}>✕</button>
          )}
        </div>

        {/* Category Filter Chips */}
        <div className="category-scroll-container">
          <div className="category-chips">
            {categoryList.map(cat => (
              <button
                key={cat}
                type="button"
                className={`category-chip ${selectedCategory.toLowerCase() === cat.toLowerCase() ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                <span>{cat}</span>
                <span className="chip-count">{categoriesWithCounts[cat]}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid Content */}
      {loading ? (
        <div className="empty-state">
          <div className="spinner"></div>
          <p>Loading projects…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-box-icon">📁</div>
          <p>
            {search || selectedCategory !== 'All'
              ? 'No matching projects found'
              : 'No projects added yet'}
          </p>
          <small>
            {search || selectedCategory !== 'All'
              ? 'Try selecting "All" or adjusting your search keyword.'
              : 'Click "+ Add Project" to save your first project.'}
          </small>
        </div>
      ) : (
        <div className="projects-grid">
          {filtered.map(entry => {
            const thumbUrl = getPrimaryThumbnail(entry)
            const domain = getDomainOrName(entry)
            const isDrive = isGoogleDrive(entry.url)
            const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`

            return (
              <div
                key={entry.id}
                className="project-card"
                onClick={() => handleCardClick(entry.url)}
                title={`Open ${entry.name || domain} in new tab`}
              >
                {/* Thumbnail Header Area */}
                <div className="thumbnail-wrapper">
                  {thumbUrl ? (
                    <img
                      src={thumbUrl}
                      alt={entry.name || domain}
                      loading="lazy"
                      data-stage="1"
                      onError={(e) => handleImageError(e, entry)}
                    />
                  ) : null}

                  {/* Fallback View (or Google Drive asset preview) */}
                  <div
                    className="thumbnail-fallback"
                    style={{ display: thumbUrl ? 'none' : 'flex' }}
                  >
                    {isDrive ? (
                      <div className="drive-preview">
                        <svg width="42" height="42" viewBox="0 0 87.3 78" fill="none">
                          <path d="M6.6 66.85l3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8H0c0 1.55.4 3.1 1.2 4.5l5.4 9.35z" fill="#0066DA"/>
                          <path d="M43.65 25L29.9 1.2C28.55.4 27 0 25.45 0H18.2c-1.55 0-3.1.4-4.45 1.2L0 25h43.65z" fill="#00AC47"/>
                          <path d="M73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5H43.65l8.7 15.05 5.05 8.75h16.15z" fill="#EA4335"/>
                          <path d="M43.65 25L57.4 1.2C56.05.4 54.5 0 52.95 0H34.35l13.75 23.8 4.45 1.2z" fill="#00832D"/>
                          <path d="M59.8 53H13.75L0 76.8h54.75c1.55 0 3.1-.4 4.45-1.2l.6-.6z" fill="#2684FC"/>
                          <path d="M73.4 26.5l-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3L43.65 25l24.4 42.25 12.65-21.9c.8-1.4 1.2-2.95 1.2-4.5 0-1.55-.4-3.1-1.2-4.5l-7.3-9.85z" fill="#FFBA00"/>
                        </svg>
                        <span>Google Drive Asset</span>
                      </div>
                    ) : (
                      <div className="generic-preview">
                        <img
                          src={faviconUrl}
                          alt=""
                          className="preview-favicon"
                          onError={(e) => { e.target.style.display = 'none' }}
                        />
                        <span className="preview-host">{domain}</span>
                      </div>
                    )}
                  </div>

                  {/* Open in new tab hover badge */}
                  <div className="card-hover-overlay">
                    <span>Open Project ↗</span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="project-info">
                  <div className="project-title-row">
                    <h3 className="project-title" title={entry.name || domain}>
                      {entry.name || domain}
                    </h3>
                  </div>

                  <div className="project-meta-row">
                    <span className="project-tag">{entry.project || 'General'}</span>
                    <span className="meta-dot">•</span>
                    <span className="project-date">{formatDate(entry.created_at)}</span>
                  </div>

                  {/* Card Actions Footer */}
                  <div className="card-actions-bar" onClick={e => e.stopPropagation()}>
                    <button
                      className={`btn-action-copy ${copiedId === entry.id ? 'copied' : ''}`}
                      onClick={(e) => handleCopy(e, entry.url, entry.id)}
                      title="Copy URL"
                    >
                      {copiedId === entry.id ? (
                        <>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                          <span>Copy</span>
                        </>
                      )}
                    </button>

                    <button
                      className="btn-action-delete"
                      onClick={(e) => handleDeleteClick(e, entry)}
                      title="Delete project"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setItemToDelete(null)}>
          <div className="modal modal-confirm">
            <div className="confirm-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </div>
            <h3>Delete this project?</h3>
            <p>
              Are you sure you want to remove <strong>"{itemToDelete.name || itemToDelete.project}"</strong>? This action cannot be undone.
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
