import { useState } from 'react'

export default function LoginScreen({ onLogin }) {
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState(false)
  const [shake, setShake] = useState(false)

  const APP_PASSWORD = import.meta.env.VITE_APP_PASSWORD || 'admin123'

  const tryLogin = () => {
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
        <span className="login-icon">🔐</span>
        <h1>Link Manager</h1>
        <p>Enter your password to continue</p>

        <div className="input-group">
          <input
            type={showPw ? 'text' : 'password'}
            value={password}
            onChange={e => { setPassword(e.target.value); setError(false) }}
            onKeyDown={e => e.key === 'Enter' && tryLogin()}
            placeholder="Enter password…"
            autoFocus
          />
          <button className="eye-btn" onClick={() => setShowPw(!showPw)}>
            {showPw ? '🙈' : '👁️'}
          </button>
        </div>

        <button className="btn-primary" onClick={tryLogin}>Unlock →</button>

        {error && (
          <p className="error-msg">❌ Incorrect password. Please try again.</p>
        )}
      </div>
    </div>
  )
}
