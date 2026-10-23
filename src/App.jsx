import { useState, useEffect, useCallback } from 'react'
import { supabase } from './lib/supabase'
import ProjectGrid from './components/ProjectGrid'
import AddModal from './components/AddModal'
import Toast from './components/Toast'
import LoginScreen from './components/LoginScreen'
import './App.css'

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('is_authenticated') === 'true'
  })
  const [entries, setEntries]     = useState([])
  const [loading, setLoading]     = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving]       = useState(false)
  const [toast, setToast]         = useState({ visible: false, message: '', type: 'success' })
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const handleLogin = () => {
    localStorage.setItem('is_authenticated', 'true')
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    localStorage.removeItem('is_authenticated')
    setIsAuthenticated(false)
  }

  // ── TOAST ──────────────────────────────────────────
  const showToast = (message, type = 'success') => {
    setToast({ visible: true, message, type })
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 2600)
  }

  // ── FETCH DATA ─────────────────────────────────────
  const fetchEntries = useCallback(async () => {
    if (!isAuthenticated) return
    setLoading(true)
    const { data, error } = await supabase
      .from('links')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      showToast('Failed to load projects: ' + error.message, 'error')
    } else {
      setEntries(data || [])
    }
    setLoading(false)
  }, [isAuthenticated])

  useEffect(() => {
    if (isAuthenticated) {
      fetchEntries()
    }
  }, [isAuthenticated, fetchEntries])

  // ── REALTIME ───────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated) return
    const channel = supabase
      .channel('projects-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'links' }, () => {
        fetchEntries()
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [isAuthenticated, fetchEntries])

  // ── ADD ENTRY ──────────────────────────────────────
  const handleSave = async ({ project, name, url, thumbnail }) => {
    setSaving(true)
    const payload = { project, name, url }
    if (thumbnail) payload.thumbnail = thumbnail

    const { error } = await supabase
      .from('links')
      .insert([payload])

    if (error) {
      // If thumbnail column doesn't exist in user's DB table, fallback without it
      if (error.message && error.message.includes('thumbnail')) {
        const retry = await supabase.from('links').insert([{ project, name, url }])
        if (retry.error) {
          showToast('Failed to save: ' + retry.error.message, 'error')
        } else {
          showToast('Project added successfully!', 'success')
          setShowModal(false)
          fetchEntries()
        }
      } else {
        showToast('Failed to save: ' + error.message, 'error')
      }
    } else {
      showToast('Project added successfully!', 'success')
      setShowModal(false)
      fetchEntries()
    }
    setSaving(false)
  }

  // ── DELETE ENTRY ───────────────────────────────────
  const handleDelete = async (id) => {
    const { error } = await supabase
      .from('links')
      .delete()
      .eq('id', id)

    if (error) {
      showToast('Failed to delete: ' + error.message, 'error')
    } else {
      showToast('Project deleted', 'success')
      setEntries(prev => prev.filter(e => e.id !== id))
    }
  }

  // ── KEYBOARD SHORTCUT ──────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') setShowModal(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />
  }

  return (
    <div className="app">
      {/* ── TOP HEADER ── */}
      <header>
        <div className="header-container">
          <div className="logo">
            <img src="/revti-logo.png" alt="Revti Digital" className="logo-image" />
          </div>

          <div className="header-actions">
            <div className={`search-box ${searchOpen ? 'open' : ''}`}>
              <input
                type="text"
                placeholder="Search projects…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
                autoFocus={searchOpen}
              />
              <button
                type="button"
                className="search-icon-btn"
                onClick={() => {
                  if (searchOpen && searchQuery) {
                    setSearchQuery('')
                  } else {
                    setSearchOpen(o => !o)
                  }
                }}
                aria-label="Search"
              >
                {searchOpen && searchQuery ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                )}
              </button>
            </div>

            <button
              type="button"
              className="logout-btn"
              onClick={handleLogout}
              title="Lock Dashboard"
              aria-label="Lock Dashboard"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              <span>Lock</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <main>
        <ProjectGrid
          entries={entries}
          loading={loading}
          onDelete={handleDelete}
          searchQuery={searchQuery}
        />
      </main>

      {/* ── FOOTER ── */}
      <footer className="site-footer">
        <div className="footer-container">
          <p className="footer-address">F-21, Tonk Phatak, Jaipur, Raj 302015</p>
          <div className="footer-links">
            <a href="mailto:himanshu@revtidigital.com">himanshu@revtidigital.com</a>
            <a href="tel:+917891331221">+91-78913 31221</a>
            <a href="tel:+919982323333">+91-99823 23333</a>
          </div>
        </div>
      </footer>

      {/* ── ADD MODAL ── */}
      {showModal && (
        <AddModal
          onClose={() => setShowModal(false)}
          onSave={handleSave}
          saving={saving}
        />
      )}

      {/* ── TOAST NOTIFICATIONS ── */}
      <Toast {...toast} />
    </div>
  )
}
