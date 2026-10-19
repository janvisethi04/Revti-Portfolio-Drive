import { Readable } from 'node:stream'

export default async function handler(req, res) {
  const { url } = req.query

  if (!url || typeof url !== 'string') {
    res.status(400).send('Missing url parameter')
    return
  }

  try {
    const upstream = await fetch(url)
    if (!upstream.ok || !upstream.body) {
      res.status(upstream.status || 502).send('Failed to fetch PDF')
      return
    }

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Cache-Control', 'public, max-age=86400, immutable')
    res.status(200)

    Readable.fromWeb(upstream.body).pipe(res)
  } catch {
    res.status(502).send('Error fetching PDF')
  }
}
