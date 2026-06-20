import type { VercelRequest, VercelResponse } from '@vercel/node'
import crypto from 'crypto'

const CF_APP_ID = process.env.CASHFREE_APP_ID!
const CF_SECRET = process.env.CASHFREE_SECRET_KEY!
const CF_ENV = process.env.CASHFREE_ENV ?? 'sandbox'
const BASE_URL = CF_ENV === 'production'
  ? 'https://api.cashfree.com/pg/orders'
  : 'https://sandbox.cashfree.com/pg/orders'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { order_id, amount, customer } = req.body
  if (!order_id || !amount || !customer) return res.status(400).json({ error: 'Missing fields' })

  try {
    const payload = {
      order_id: `MR_${order_id.replace(/-/g, '').slice(0, 20)}`,
      order_amount: Number(amount),
      order_currency: 'INR',
      customer_details: {
        customer_id: customer.email.replace(/[^a-z0-9]/gi, '').slice(0, 50),
        customer_name: customer.name,
        customer_email: customer.email,
        customer_phone: customer.phone,
      },
      order_meta: { return_url: `${process.env.VITE_FRONTEND_URL ?? ''}/payment-status?order_id=${order_id}` },
    }

    const cfRes = await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-version': '2023-08-01', 'x-client-id': CF_APP_ID, 'x-client-secret': CF_SECRET },
      body: JSON.stringify(payload),
    })
    const data = await cfRes.json()
    if (!cfRes.ok) return res.status(400).json({ error: data })
    return res.status(200).json({ payment_session_id: data.payment_session_id, cashfree_order_id: data.cf_order_id })
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' })
  }
}
