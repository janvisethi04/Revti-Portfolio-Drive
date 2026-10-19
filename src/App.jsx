import { useState, useEffect, useCallback } from 'react'
import { supabase } from './lib/supabase'
import ProjectGrid from './components/ProjectGrid'
import AddModal from './components/AddModal'
import Toast from './components/Toast'
import './App.css'

export default function App() {
  const [entries, setEntries]     = useState([])
  const [loading, setLoading]     = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving]       = useState(false)
  const [toast, setToast]         = useState({ visible: false, message: '', type: 'success' })

  // ── TOAST ──────────────────────────────────────────
  const showToast = (message, type = 'success') => {
    setToast({ visible: true, message, type })
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 2600)
  }

  // ── FETCH DATA ─────────────────────────────────────
  const fetchEntries = useCallback(async () => {
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
  }, [])

  useEffect(() => {
    fetchEntries()
  }, [fetchEntries])

  // ── REALTIME ───────────────────────────────────────
  useEffect(() => {
    const channel = supabase
      .channel('projects-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'links' }, () => {
        fetchEntries()
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [fetchEntries])

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

  return (
    <div className="app">
      {/* ── TOP HEADER ── */}
      <header>
        <div className="header-container">
          <div className="logo">
            <span className="logo-icon">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                <line x1="8" y1="21" x2="16" y2="21"></line>
                <line x1="12" y1="17" x2="12" y2="21"></line>
              </svg>
            </span>
            <span className="logo-text">Projects</span>
            <span className="counter-pill">{entries.length}</span>
          </div>

          <div className="header-actions">
            <button className="btn-create" onClick={() => setShowModal(true)}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              <span>Add project</span>
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
        />
      </main>

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
