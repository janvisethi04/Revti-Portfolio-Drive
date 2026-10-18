import { useEffect, useRef } from 'react'

export default function Toast({ message, type, visible }) {
  return (
    <div className={`toast ${type} ${visible ? 'show' : ''}`}>
      <span>{type === 'success' ? '✅' : type === 'error' ? '❌' : '⚠️'}</span>
      <span>{message}</span>
    </div>
  )
}
