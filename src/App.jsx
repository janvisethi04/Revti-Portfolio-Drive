import { useState, useEffect, useCallback } from 'react'
import { supabase } from './lib/supabase'
import LoginScreen from './components/LoginScreen'
import LinkTable from './components/LinkTable'
import AddModal from './components/AddModal'
import Toast from './components/Toast'
import './App.css'

export default function App() {
  const [loggedIn, setLoggedIn] = useState(() => {
    return localStorage.getItem('is_authenticated') === 'true'
  })
  const [entries, setEntries]     = useState([])
  const [loading, setLoading]     = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving]       = useState(false)
  const [toast, setToast]         = useState({ visible: false, message: '', type: 'success' })

  const handleLogin = () => {
    localStorage.setItem('is_authenticated', 'true')
    setLoggedIn(true)
  }

  const handleLogout = () => {
    localStorage.removeItem('is_authenticated')
    setLoggedIn(false)
    setEntries([])
  }

  // ── TOAST ──────────────────────────────────────────
  const showToast = (message, type = 'success') => {
    setToast({ visible: true, message, type })
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 2800)
  }

  // ── FETCH DATA ─────────────────────────────────────
  const fetchEntries = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('links')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      showToast('Failed to load links: ' + error.message, 'error')
    } else {
      setEntries(data || [])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (loggedIn) fetchEntries()
  }, [loggedIn, fetchEntries])

  // ── REALTIME ───────────────────────────────────────
  useEffect(() => {
    if (!loggedIn) return

    const channel = supabase
      .channel('links-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'links' }, () => {
        fetchEntries()
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [loggedIn, fetchEntries])

  // ── ADD ENTRY ──────────────────────────────────────
  const handleSave = async ({ project, name, url }) => {
    setSaving(true)
    const { error } = await supabase
      .from('links')
      .insert([{ project, name, url }])

    if (error) {
      showToast('Failed to save: ' + error.message, 'error')
    } else {
      showToast('Link added successfully!', 'success')
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
      showToast('Link deleted!', 'success')
      setEntries(prev => prev.filter(e => e.id !== id))
    }
  }

  // ── KEYBOARD SHORTCUT ──────────────────────────────
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') setShowModal(false) }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  if (!loggedIn) {
    return <LoginScreen onLogin={handleLogin} />
  }

  return (
    <div className="app">

      {/* ── HEADER ── */}
      <header>
        <div className="logo">
          <span className="logo-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
            </svg>
          </span>
          <span className="logo-text">Link Vault</span>
        </div>
        <div className="header-right">
          <span className="counter-badge">
            {entries.length} {entries.length === 1 ? 'link' : 'links'}
          </span>
          <button
            className="btn-logout"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </header>

      {/* ── MAIN ── */}
      <main>
        <div className="page-header">
          <div className="page-title">
            <h2>Saved Links</h2>
            <p>Access and manage your project URLs in one place</p>
          </div>
          <button className="btn-add" onClick={() => setShowModal(true)}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span>Add Link</span>
          </button>
        </div>

        <LinkTable
          entries={entries}
          loading={loading}
          onDelete={handleDelete}
        />
      </main>

      {/* ── MODAL ── */}
      {showModal && (
        <AddModal
          onClose={() => setShowModal(false)}
          onSave={handleSave}
          saving={saving}
        />
      )}

      {/* ── TOAST ── */}
      <Toast {...toast} />
    </div>
  )
}
