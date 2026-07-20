import type { VercelRequest, VercelResponse } from '@vercel/node'

// Fetches the thumbnail for an Instagram reel by scraping the og:image meta tag.
// No API key required — works for public Instagram posts.

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET')

  const raw = req.query.id
  if (!raw || typeof raw !== 'string') {
    return res.status(400).json({ error: 'Missing reel ID' })
  }

  // Accept full URLs or bare IDs
  const id = raw
    .replace(/.*instagram\.com\/reel\//i, '')
    .replace(/\//g, '')
    .trim()

  const igUrl = `https://www.instagram.com/reel/${id}/`

  try {
    const resp = await fetch(igUrl, {
      headers: {
        // Mimic Googlebot so Instagram serves the full og:image
        'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Cache-Control': 'no-cache',
      },
      redirect: 'follow',
    })

    if (!resp.ok) {
      return res.status(502).json({ error: `Instagram returned ${resp.status}` })
    }

    const html = await resp.text()

    // Extract og:image
    const match = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/)
              ?? html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/)

    if (match?.[1]) {
      const thumbnail = match[1]
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
      return res.status(200).json({ thumbnail })
    }

    return res.status(404).json({ error: 'og:image not found — post may be private' })
  } catch (e: any) {
    return res.status(500).json({ error: e.message })
  }
}
