import { useState, useMemo } from 'react'
import { flushSync } from 'react-dom'
import PdfThumbnail from './PdfThumbnail'

const PROJECT_CATEGORY_MAP = {
  'revti portfolio': 'Branding',
  'converse ai': 'Website',
  'zuuro': 'Website',
  'auric mills': 'Marketing',
  'giwc': 'Social Media',
  'nashville grind': 'Design',
  'subaru': 'Marketing',
  'raahgiri foundation': 'Social Media',
  'affinity': 'Branding',
  'activation': 'Marketing',
  'uhrs': 'Website',
  'appcino': 'Design',
  'hfza': 'Branding',
  'the kapas': 'Design',
  'dhatvik': 'Social Media',
  'au website': 'Website',
  'gulmohar lane': 'Branding',
  'au foundation': 'Social Media',
  'bewizor': 'Marketing',
  'icwf': 'Design',
  'mmds': 'Website',
  'revti': 'Branding',
}

export default function ProjectGrid({ entries, loading }) {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [copiedId, setCopiedId]                 = useState(null)

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

  const isPdf = (url) => {
    if (!url) return false
    return /\.pdf($|\?)/i.test(url.trim())
  }

  const getPrimaryThumbnail = (entry) => {
    if (entry.thumbnail) return entry.thumbnail
    const norm = normalizeUrl(entry.url)
    if (isGoogleDrive(norm) || isPdf(norm)) return null
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

  // Categories list without numbers
  const standardCategories = ['All', 'Branding', 'Website', 'Marketing', 'Social Media', 'Design']

  const categoryList = standardCategories

  const getCategory = (entry) => {
    const key = entry.project ? entry.project.trim().toLowerCase() : ''
    return PROJECT_CATEGORY_MAP[key] || 'Website'
  }

  // Filter by category
  const filtered = useMemo(() => {
    if (selectedCategory === 'All') return entries
    return entries.filter(e => getCategory(e) === selectedCategory)
  }, [entries, selectedCategory])

  // Animated category switch using the View Transitions API (falls back silently if unsupported)
  const changeCategory = (cat) => {
    if (!document.startViewTransition) {
      setSelectedCategory(cat)
      return
    }
    document.startViewTransition(() => {
      flushSync(() => setSelectedCategory(cat))
    })
  }

  return (
    <div className="dashboard-content">
      {/* Centered Category Filter Pills (Monochrome) */}
      <div className="categories-center-wrap">
        <div className="category-chips">
          {categoryList.map(cat => (
            <button
              key={cat}
              type="button"
              className={`category-chip ${selectedCategory.toLowerCase() === cat.toLowerCase() ? 'active' : ''}`}
              onClick={() => changeCategory(cat)}
            >
              {cat}
            </button>
          ))}
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
          <p>No projects found in {selectedCategory}</p>
        </div>
      ) : (
        <div className="projects-grid">
          {filtered.map(entry => {
            const thumbUrl = getPrimaryThumbnail(entry)
            const domain = getDomainOrName(entry)
            const isDrive = isGoogleDrive(entry.url)
            const isPdfFile = isPdf(entry.url)
            const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`

            return (
              <div
                key={entry.id}
                className="project-card"
                style={{ viewTransitionName: `card-${entry.id}` }}
                onClick={() => handleCardClick(entry.url)}
              >
                {/* Thumbnail Header Area */}
                <div className="thumbnail-wrapper">
                  {isPdfFile ? (
                    <PdfThumbnail url={normalizeUrl(entry.url)} alt={entry.name || domain} />
                  ) : (
                    <>
                      {thumbUrl ? (
                        <img
                          src={thumbUrl}
                          alt={entry.name || domain}
                          loading="lazy"
                          data-stage="1"
                          onError={(e) => handleImageError(e, entry)}
                        />
                      ) : null}

                      {/* Fallback View */}
                      <div
                        className="thumbnail-fallback"
                        style={{ display: thumbUrl ? 'none' : 'flex' }}
                      >
                        {isDrive ? (
                      <div className="drive-preview">
                        <svg width="40" height="40" viewBox="0 0 87.3 78" fill="none">
                          <path d="M6.6 66.85l3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8H0c0 1.55.4 3.1 1.2 4.5l5.4 9.35z" fill="#0066DA"/>
                          <path d="M43.65 25L29.9 1.2C28.55.4 27 0 25.45 0H18.2c-1.55 0-3.1.4-4.45 1.2L0 25h43.65z" fill="#00AC47"/>
                          <path d="M73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5H43.65l8.7 15.05 5.05 8.75h16.15z" fill="#EA4335"/>
                          <path d="M43.65 25L57.4 1.2C56.05.4 54.5 0 52.95 0H34.35l13.75 23.8 4.45 1.2z" fill="#00832D"/>
                          <path d="M59.8 53H13.75L0 76.8h54.75c1.55 0 3.1-.4 4.45-1.2l.6-.6z" fill="#2684FC"/>
                          <path d="M73.4 26.5l-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3L43.65 25l24.4 42.25 12.65-21.9c.8-1.4 1.2-2.95 1.2-4.5l-7.3-9.85z" fill="#FFBA00"/>
                        </svg>
                        <span>Google Drive</span>
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
                    </>
                  )}
                </div>

                {/* Card Body */}
                <div className="project-info">
                  <h3 className="project-title" title={entry.name || domain}>
                    {entry.name || domain}
                  </h3>

                  <div className="project-meta-row">
                    <span className="project-category">{getCategory(entry)}</span>
                    <button
                      type="button"
                      className={`card-copy-btn ${copiedId === entry.id ? 'copied' : ''}`}
                      onClick={(e) => handleCopy(e, entry.url, entry.id)}
                      title="Copy URL"
                    >
                      {copiedId === entry.id ? (
                        <>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
