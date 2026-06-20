import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
const resend = new Resend(process.env.RESEND_API_KEY!)

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const { order_id, tracking_id, courier } = req.body
  if (!order_id) return res.status(400).json({ error: 'Missing order_id' })

  try {
    const { data: order } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', order_id)
      .maybeSingle()

    if (!order) return res.status(404).json({ error: 'Order not found' })

    const itemsHtml = order.order_items
      ?.map((item: any) => `<li>${item.product_name} (${item.size}) × ${item.quantity} — ₹${(item.price * item.quantity).toLocaleString('en-IN')}</li>`)
      .join('') ?? ''

    await resend.emails.send({
      from: 'orders@meenarajwada.com',
      to: order.customer_email,
      subject: `Your Meena Rajwada order has been dispatched! 📦`,
      html: `
        <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; color: #2a1a10;">
          <h1 style="color: #7D1935; font-size: 28px;">Your order is on its way! 🎉</h1>
          <p>Dear ${order.customer_name},</p>
          <p>Great news! Your Meena Rajwada order has been carefully packed and dispatched.</p>
          ${tracking_id ? `<p><strong>Tracking ID:</strong> ${tracking_id}${courier ? ` via ${courier}` : ''}</p>` : ''}
          <h3 style="color: #7D1935;">Items dispatched:</h3>
          <ul>${itemsHtml}</ul>
          <p>Estimated delivery: 3–7 working days from dispatch date.</p>
          <p>If you have any questions, reply to this email or WhatsApp us.</p>
          <p style="margin-top: 32px;">With love & care,<br/><strong>Meena Rajwada</strong> 💎</p>
        </div>
      `,
    })

    // Mark dispatch email sent
    await supabase.from('orders').update({ dispatch_email_sent: true, tracking_id, courier }).eq('id', order_id)

    return res.status(200).json({ success: true })
  } catch (err: any) {
    return res.status(500).json({ error: err.message })
  }
}
