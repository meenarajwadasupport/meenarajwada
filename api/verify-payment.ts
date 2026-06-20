import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
const CF_APP_ID = process.env.CASHFREE_APP_ID!
const CF_SECRET = process.env.CASHFREE_SECRET_KEY!
const CF_ENV = process.env.CASHFREE_ENV ?? 'sandbox'
const BASE_URL = CF_ENV === 'production'
  ? 'https://api.cashfree.com/pg/orders'
  : 'https://sandbox.cashfree.com/pg/orders'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const orderId = req.query.order_id as string
  if (!orderId) return res.status(400).json({ error: 'Missing order_id' })

  try {
    // Get order from DB to find Cashfree order ID
    const { data: order } = await supabase.from('orders').select('cashfree_order_id').eq('id', orderId).maybeSingle()
    const cfOrderId = order?.cashfree_order_id ?? `MR_${orderId.replace(/-/g, '').slice(0, 20)}`

    const cfRes = await fetch(`${BASE_URL}/${cfOrderId}/payments`, {
      headers: { 'x-api-version': '2023-08-01', 'x-client-id': CF_APP_ID, 'x-client-secret': CF_SECRET },
    })
    const payments = await cfRes.json()
    const success = Array.isArray(payments) && payments.some((p: any) => p.payment_status === 'SUCCESS')

    if (success) {
      await supabase.from('orders').update({ status: 'confirmed', payment_status: 'paid' }).eq('id', orderId)
    }
    return res.status(200).json({ success })
  } catch {
    return res.status(500).json({ error: 'Verification failed' })
  }
}
