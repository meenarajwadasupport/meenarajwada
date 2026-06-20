import type { VercelRequest, VercelResponse } from '@vercel/node'
import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
const WEBHOOK_SECRET = process.env.CASHFREE_WEBHOOK_SECRET!

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  // Verify Cashfree HMAC signature
  const signature = req.headers['x-webhook-signature'] as string
  const timestamp = req.headers['x-webhook-timestamp'] as string
  const rawBody = JSON.stringify(req.body)

  const signedPayload = `${timestamp}${rawBody}`
  const expectedSig = crypto.createHmac('sha256', WEBHOOK_SECRET).update(signedPayload).digest('base64')

  if (signature !== expectedSig) return res.status(401).json({ error: 'Invalid signature' })

  const event = req.body
  const { type, data } = event

  if (type === 'PAYMENT_SUCCESS_WEBHOOK') {
    const cfOrderId = data.order?.cf_order_id
    const orderId = data.order?.order_id?.replace('MR_', '')
    if (orderId) {
      await supabase.from('orders').update({ status: 'confirmed', payment_status: 'paid', cashfree_order_id: cfOrderId }).eq('id', orderId.split('').join('-'))
    }
  }

  return res.status(200).json({ received: true })
}
