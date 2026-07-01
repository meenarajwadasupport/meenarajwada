import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
const resend = new Resend(process.env.RESEND_API_KEY!)
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
    // Fetch full order details
    const { data: order } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', orderId)
      .maybeSingle()

    if (!order) return res.status(404).json({ error: 'Order not found' })

    const cfOrderId = order.cashfree_order_id ?? `MR_${orderId.replace(/-/g, '').slice(0, 20)}`

    const cfRes = await fetch(`${BASE_URL}/${cfOrderId}/payments`, {
      headers: { 'x-api-version': '2023-08-01', 'x-client-id': CF_APP_ID, 'x-client-secret': CF_SECRET },
    })
    const payments = await cfRes.json()
    const success = Array.isArray(payments) && payments.some((p: any) => p.payment_status === 'SUCCESS')

    if (success) {
      await supabase.from('orders').update({ status: 'confirmed', payment_status: 'paid' }).eq('id', orderId)

      // Send confirmation email only once
      if (!order.email_sent && order.customer_email) {
        const addr = order.shipping_address ?? {}
        const itemsHtml = (order.order_items ?? [])
          .map((item: any) => `
            <tr>
              <td style="padding:8px 0;border-bottom:1px solid #f0e8e0;font-size:13px;color:#2a1a10;">${item.product_name}${item.size ? ` <span style="color:#888;font-size:11px;">(${item.size})</span>` : ''}</td>
              <td style="padding:8px 0;border-bottom:1px solid #f0e8e0;font-size:13px;color:#2a1a10;text-align:center;">${item.quantity}</td>
              <td style="padding:8px 0;border-bottom:1px solid #f0e8e0;font-size:13px;color:#2a1a10;text-align:right;">₹${(item.price * item.quantity).toLocaleString('en-IN')}</td>
            </tr>`)
          .join('')

        await resend.emails.send({
          from: 'Meena Rajwada <noreply@meenarajwada.com>',
          to: order.customer_email,
          replyTo: 'muakhhir@gmail.com',
          subject: `Order Confirmed ✨ ${order.order_number ?? ''}`,
          html: `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#fdf8f5;font-family:Georgia,serif;">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.07);">

    <!-- Header -->
    <div style="background:#7D1935;padding:32px 24px;text-align:center;">
      <p style="margin:0 0 6px;font-size:10px;letter-spacing:4px;color:rgba(255,255,255,0.7);text-transform:uppercase;">Meena Rajwada</p>
      <h1 style="margin:0;font-size:26px;color:#fff;font-weight:600;">Order Confirmed ✨</h1>
      <p style="margin:8px 0 0;font-size:12px;color:rgba(255,255,255,0.8);">Handcrafted with love, just for you</p>
    </div>

    <!-- Body -->
    <div style="padding:28px 24px;">
      <p style="margin:0 0 16px;font-size:14px;color:#2a1a10;">Dear <strong>${order.customer_name}</strong>,</p>
      <p style="margin:0 0 20px;font-size:14px;color:#555;line-height:1.6;">Thank you for your order! We've received your payment and our artisans will begin crafting your pieces with care.</p>

      <!-- Order Number -->
      <div style="background:#fdf8f5;border:1px solid #f0e0d6;border-radius:8px;padding:14px 18px;margin-bottom:24px;text-align:center;">
        <p style="margin:0;font-size:11px;color:#888;letter-spacing:2px;text-transform:uppercase;">Order Number</p>
        <p style="margin:4px 0 0;font-size:20px;font-weight:700;color:#7D1935;">${order.order_number ?? orderId.slice(0, 8).toUpperCase()}</p>
      </div>

      <!-- Items Table -->
      <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
        <thead>
          <tr>
            <th style="font-size:10px;color:#888;text-transform:uppercase;letter-spacing:1px;text-align:left;padding-bottom:8px;border-bottom:2px solid #f0e8e0;">Item</th>
            <th style="font-size:10px;color:#888;text-transform:uppercase;letter-spacing:1px;text-align:center;padding-bottom:8px;border-bottom:2px solid #f0e8e0;">Qty</th>
            <th style="font-size:10px;color:#888;text-transform:uppercase;letter-spacing:1px;text-align:right;padding-bottom:8px;border-bottom:2px solid #f0e8e0;">Amount</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
      </table>

      <!-- Totals -->
      <div style="text-align:right;margin-bottom:24px;">
        <p style="margin:4px 0;font-size:12px;color:#888;">Subtotal: ₹${(order.subtotal ?? 0).toLocaleString('en-IN')}</p>
        <p style="margin:4px 0;font-size:12px;color:#888;">Shipping: ${(order.shipping_amount ?? 0) === 0 ? '<span style="color:#2a9d5c;">Free</span>' : `₹${order.shipping_amount.toLocaleString('en-IN')}`}</p>
        <p style="margin:8px 0 0;font-size:16px;font-weight:700;color:#7D1935;">Total: ₹${(order.total_amount ?? 0).toLocaleString('en-IN')}</p>
      </div>

      <!-- Shipping Address -->
      ${addr.address ? `
      <div style="background:#fdf8f5;border-radius:8px;padding:14px 18px;margin-bottom:24px;">
        <p style="margin:0 0 6px;font-size:10px;color:#888;letter-spacing:2px;text-transform:uppercase;">Delivery Address</p>
        <p style="margin:0;font-size:13px;color:#2a1a10;line-height:1.6;">${addr.address}, ${addr.city}, ${addr.state} – ${addr.pincode}</p>
      </div>` : ''}

      <p style="margin:0 0 8px;font-size:13px;color:#555;">📦 Estimated dispatch: <strong>2–4 working days</strong></p>
      <p style="margin:0 0 24px;font-size:13px;color:#555;">You'll receive another email with tracking details once your order is dispatched.</p>

      <p style="margin:0;font-size:14px;color:#2a1a10;">With love & care,<br/><strong>Meena Rajwada</strong> 💎</p>
    </div>

    <!-- Footer -->
    <div style="background:#fdf8f5;padding:16px 24px;text-align:center;border-top:1px solid #f0e8e0;">
      <p style="margin:0;font-size:11px;color:#aaa;">Questions? Reply to this email or WhatsApp us.</p>
      <p style="margin:4px 0 0;font-size:10px;color:#ccc;">© 2025 Meena Rajwada · meenarajwada.com</p>
    </div>

  </div>
</body>
</html>`,
        })

        await supabase.from('orders').update({ email_sent: true }).eq('id', orderId)
      }
    }

    return res.status(200).json({ success })
  } catch (err: any) {
    return res.status(500).json({ error: err.message ?? 'Verification failed' })
  }
}
