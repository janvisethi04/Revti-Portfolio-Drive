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
            <img src="/revti-logo.png" alt="Revti Digital" className="logo-image" />
          </div>

          <div className="header-actions">
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

      {/* ── FOOTER ── */}
      <footer className="site-footer">
        <div className="footer-container">
          <p className="footer-address">F-21, Tonk Phatak, Jaipur, Raj 302015</p>
          <div className="footer-links">
            <a href="mailto:himanshu@revtidigital.com">himanshu@revtidigital.com</a>
            <a href="tel:+917891331221">+91-78913 31221</a>
            <a href="tel:+919982323333">99823 23333</a>
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
