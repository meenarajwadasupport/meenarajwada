import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

// Uses service role key — can create buckets (anon key cannot)
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const BUCKETS = [
  { name: 'media',    public: true },
  { name: 'products', public: true },
]

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const results: Record<string, string> = {}

  for (const bucket of BUCKETS) {
    const { error } = await supabase.storage.createBucket(bucket.name, {
      public: bucket.public,
      fileSizeLimit: 10485760, // 10 MB
    })

    if (!error || error.message?.toLowerCase().includes('already exist')) {
      results[bucket.name] = 'ready'
    } else {
      results[bucket.name] = `error: ${error.message}`
    }
  }

  return res.status(200).json({ ok: true, buckets: results })
}
