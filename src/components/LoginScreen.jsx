import { useState } from 'react'

export default function LoginScreen({ onLogin }) {
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [error, setError]       = useState(false)
  const [shake, setShake]       = useState(false)

  const APP_PASSWORD = import.meta.env.VITE_APP_PASSWORD || 'admin123'

  const tryLogin = (e) => {
    if (e) e.preventDefault()
    if (password === APP_PASSWORD) {
      onLogin()
    } else {
      setError(true)
      setShake(true)
      setTimeout(() => setShake(false), 500)
    }
  }

  return (
    <div className="login-screen">
      <div className={`login-card ${shake ? 'shake' : ''}`}>
        <div className="login-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
        </div>
        <h1>Link Vault</h1>
        <p>Enter password to access your dashboard</p>

        <form onSubmit={tryLogin}>
          <div className="input-group">
            <input
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={e => { setPassword(e.target.value); setError(false) }}
              placeholder="Enter password…"
              autoFocus
            />
            <button
              type="button"
              className="eye-btn"
              onClick={() => setShowPw(!showPw)}
              title={showPw ? 'Hide' : 'Show'}
            >
              {showPw ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              )}
            </button>
          </div>

          <button type="submit" className="btn-primary">Continue</button>
        </form>

        {error && (
          <p className="error-msg">Incorrect password. Please try again.</p>
        )}
      </div>
    </div>
  )
}
