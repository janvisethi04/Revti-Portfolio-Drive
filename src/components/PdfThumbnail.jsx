import { useEffect, useRef, useState } from 'react'
import * as pdfjsLib from 'pdfjs-dist'
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker

// Rendered-page cache shared across cards so switching filters doesn't re-fetch/re-render PDFs already shown once.
const thumbnailCache = new Map()

export default function PdfThumbnail({ url, alt }) {
  const [src, setSrc] = useState(thumbnailCache.get(url) || null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (thumbnailCache.has(url)) {
      setSrc(thumbnailCache.get(url))
      return
    }

    let cancelled = false

    const render = async () => {
      try {
        const proxied = `/api/pdf-proxy?url=${encodeURIComponent(url)}`
        const pdf = await pdfjsLib.getDocument(proxied).promise
        const page = await pdf.getPage(1)
        const viewport = page.getViewport({ scale: 1.1 })

        const canvas = document.createElement('canvas')
        canvas.width = viewport.width
        canvas.height = viewport.height
        const ctx = canvas.getContext('2d')
        await page.render({ canvasContext: ctx, viewport }).promise

        const dataUrl = canvas.toDataURL('image/jpeg', 0.82)
        thumbnailCache.set(url, dataUrl)
        if (!cancelled) setSrc(dataUrl)
      } catch {
        if (!cancelled) setFailed(true)
      }
    }

    render()
    return () => { cancelled = true }
  }, [url])

  if (failed) {
    return (
      <div className="pdf-preview">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#E54B4B" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
        </svg>
        <span>PDF Document</span>
      </div>
    )
  }

  if (!src) {
    return <div className="pdf-canvas-skeleton" aria-label={alt} />
  }

  return <img src={src} alt={alt} className="pdf-canvas-thumb" />
}
