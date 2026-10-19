export default async function handler(req, res) {
  const { url } = req.query

  if (!url || typeof url !== 'string') {
    res.status(400).send('Missing url parameter')
    return
  }

  try {
    const upstream = await fetch(url)
    if (!upstream.ok) {
      res.status(upstream.status).send('Failed to fetch PDF')
      return
    }

    const buffer = await upstream.arrayBuffer()

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Cache-Control', 'public, max-age=3600')
    res.status(200).send(Buffer.from(buffer))
  } catch {
    res.status(502).send('Error fetching PDF')
  }
}
