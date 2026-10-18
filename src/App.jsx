import { useState, useEffect, useCallback } from 'react'
import { supabase } from './lib/supabase'
import LoginScreen from './components/LoginScreen'
import LinkTable from './components/LinkTable'
import AddModal from './components/AddModal'
import Toast from './components/Toast'
import './App.css'

export default function App() {
  const [loggedIn, setLoggedIn]   = useState(false)
  const [entries, setEntries]     = useState([])
  const [loading, setLoading]     = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving]       = useState(false)
  const [toast, setToast]         = useState({ visible: false, message: '', type: 'success' })

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
    return <LoginScreen onLogin={() => setLoggedIn(true)} />
  }

  return (
    <div className="app">

      {/* ── HEADER ── */}
      <header>
        <div className="logo">
          <span className="logo-icon">🔗</span>
          <span className="logo-text">Link Manager</span>
        </div>
        <div className="header-right">
          <span className="counter-badge">
            {entries.length} {entries.length === 1 ? 'link' : 'links'}
          </span>
          <button
            className="btn-logout"
            onClick={() => { setLoggedIn(false); setEntries([]) }}
          >
            🔒 Logout
          </button>
        </div>
      </header>

      {/* ── MAIN ── */}
      <main>
        <div className="page-header">
          <div className="page-title">
            <h2>📋 Your Links</h2>
            <p>Manage and access your project links</p>
          </div>
          <button className="btn-add" onClick={() => setShowModal(true)}>
            <span>➕</span>
            <span>Add New Link</span>
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
