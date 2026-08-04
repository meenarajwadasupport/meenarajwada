import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

// Service role client — bypasses all Supabase RLS policies
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Resend is created lazily inside the handler so a missing API key
// does NOT crash the entire serverless function on cold start.
function getResend() {
  if (!process.env.RESEND_API_KEY) return null
  return new Resend(process.env.RESEND_API_KEY)
}

// ── Quote email template ─────────────────────────────────────
function quoteEmailHtml(order: any, quotedPrice: number) {
  const formattedPrice = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(quotedPrice)
  return `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#fdf8f5;font-family:Georgia,serif;">
  <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.07);">

    <!-- Header -->
    <div style="background:#7D1935;padding:32px 24px;text-align:center;">
      <p style="margin:0 0 4px;font-size:10px;letter-spacing:4px;color:rgba(255,255,255,0.7);text-transform:uppercase;">Meena Rajwada</p>
      <h1 style="margin:0;font-size:22px;color:#fff;font-weight:600;">Your Custom Jewellery Quote ✨</h1>
    </div>

    <!-- Body -->
    <div style="padding:32px 24px;">
      <p style="margin:0 0 16px;font-size:15px;color:#2a1a10;">Dear <strong>${order.customer_name}</strong>,</p>
      <p style="margin:0 0 24px;font-size:14px;color:#555;line-height:1.7;">
        Thank you for your custom jewellery request. We've reviewed your design and are excited to bring it to life!
      </p>

      <!-- Quote highlight -->
      <div style="background:#fdf8f5;border:1px solid #e8d8c8;border-radius:10px;padding:20px 24px;margin-bottom:24px;text-align:center;">
        <p style="margin:0 0 6px;font-size:11px;color:#888;letter-spacing:2px;text-transform:uppercase;">Your Quoted Price</p>
        <p style="margin:0;font-size:36px;font-weight:700;color:#7D1935;">${formattedPrice}</p>
        <p style="margin:6px 0 0;font-size:12px;color:#888;">Inclusive of all crafting costs</p>
      </div>

      <!-- Order summary -->
      <div style="background:#fdf8f5;border-left:3px solid #7D1935;border-radius:0 8px 8px 0;padding:14px 18px;margin-bottom:24px;">
        <p style="margin:0 0 8px;font-size:10px;color:#888;letter-spacing:2px;text-transform:uppercase;">Your Request</p>
        ${order.design_type ? `<p style="margin:0 0 4px;font-size:13px;color:#2a1a10;"><strong>Type:</strong> ${order.design_type}</p>` : ''}
        ${order.occasion ? `<p style="margin:0 0 4px;font-size:13px;color:#2a1a10;"><strong>Occasion:</strong> ${order.occasion}</p>` : ''}
        <p style="margin:0;font-size:13px;color:#555;line-height:1.5;font-style:italic;">"${order.description}"</p>
      </div>

      <p style="margin:0 0 16px;font-size:14px;color:#555;line-height:1.7;">
        To confirm your order, simply reply to this email or WhatsApp us at <strong>+91 63044 24767</strong>.
        We'll begin crafting once we hear from you. 🎉
      </p>

      <a href="https://wa.me/916304424767" style="display:inline-block;background:#25D366;color:#fff;font-size:13px;font-weight:600;padding:12px 24px;border-radius:8px;text-decoration:none;margin-bottom:16px;">
        💬 Confirm on WhatsApp
      </a>

      <p style="margin:16px 0 0;font-size:14px;color:#2a1a10;">With love,<br/><strong>Meena Rajwada</strong> 💎</p>
    </div>

    <!-- Footer -->
    <div style="background:#fdf8f5;padding:16px 24px;text-align:center;border-top:1px solid #f0e8e0;">
      <p style="margin:0;font-size:11px;color:#aaa;">© ${new Date().getFullYear()} Meena Rajwada · meenarajwada.com</p>
      <p style="margin:4px 0 0;font-size:11px;color:#aaa;">support@meenarajwada.com · +91 63044 24767</p>
    </div>

  </div>
</body>
</html>`
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const { action } = req.body

  // ── Action: update custom order ──────────────────────────────
  if (action === 'update_order') {
    const { id, status, quoted_price, admin_notes, send_email } = req.body
    if (!id) return res.status(400).json({ error: 'Missing order id' })

    // Only include fields that the DB schema is guaranteed to have.
    // status exists in the original schema (DEFAULT 'new').
    // quoted_price / admin_notes may not exist — we try them and fall back gracefully.
    const corePayload: any = {}
    if (status !== undefined) corePayload.status = status

    // Try with all optional admin fields first
    const fullPayload = { ...corePayload }
    if (quoted_price !== undefined) fullPayload.quoted_price = Number(quoted_price)
    if (admin_notes  !== undefined) fullPayload.admin_notes  = admin_notes

    let { error: dbErr } = await supabase
      .from('custom_order_requests')
      .update(Object.keys(fullPayload).length ? fullPayload : { status: status ?? 'new' })
      .eq('id', id)

    // If optional columns don't exist yet, retry with only core fields
    if (dbErr && (dbErr.message?.includes('column') || dbErr.code === '42703')) {
      console.warn('Optional columns missing, retrying with core fields only:', dbErr.message)
      if (Object.keys(corePayload).length) {
        const retry = await supabase
          .from('custom_order_requests')
          .update(corePayload)
          .eq('id', id)
        dbErr = retry.error
      } else {
        dbErr = null
      }
    }

    if (dbErr) {
      console.error('DB update error:', dbErr)
      return res.status(500).json({ error: dbErr.message })
    }

    // Send quote email if requested
    if (send_email && quoted_price) {
      // Fetch order to get customer contact — support both old and new column names
      const { data: order } = await supabase
        .from('custom_order_requests')
        .select('*')
        .eq('id', id)
        .single()

      // Support old column names (email, name, phone) AND new (customer_email etc.)
      const customerEmail = order?.email ?? order?.customer_email
      const customerName  = order?.name  ?? order?.customer_name ?? 'Valued Customer'

      // Build an order object with normalised keys for the email template
      const normOrder = {
        ...(order ?? {}),
        customer_name:  customerName,
        customer_email: customerEmail,
        design_type:    order?.piece_type ?? order?.design_type ?? '',
        description:    order?.description ?? '',
        occasion:       order?.occasion ?? '',
      }

      let emailSent = false
      let emailError = ''

      const resend = getResend()
      if (!resend) {
        emailError = 'RESEND_API_KEY not set in Vercel environment variables'
        console.warn(emailError)
      } else if (!customerEmail) {
        emailError = 'No customer email found for this order'
        console.warn(emailError, id)
      } else {
        try {
          const result = await resend.emails.send({
            from: 'Meena Rajwada <noreply@meenarajwada.com>',
            to: customerEmail,
            replyTo: 'support@meenarajwada.com',
            subject: `Your Custom Jewellery Quote from Meena Rajwada ✨`,
            html: quoteEmailHtml(normOrder, Number(quoted_price)),
          })
          if ((result as any).error) {
            emailError = (result as any).error.message ?? 'Email provider error'
            console.error('Email send error:', emailError)
          } else {
            emailSent = true
          }
        } catch (emailErr: any) {
          emailError = emailErr.message ?? 'Unknown email error'
          console.error('Email exception:', emailError)
        }
      }

      return res.status(200).json({ success: true, email_sent: emailSent, email_error: emailError || undefined })
    }

    return res.status(200).json({ success: true })
  }

  // ── Action: send quote email (no Supabase needed — data comes from frontend) ──
  if (action === 'send_quote_email') {
    const { customer_email, customer_name, design_type, description, occasion, quoted_price } = req.body

    if (!customer_email) return res.status(400).json({ error: 'Missing customer_email' })
    if (!quoted_price)   return res.status(400).json({ error: 'Missing quoted_price' })

    const resend = getResend()
    if (!resend) {
      return res.status(200).json({
        success: true,
        email_sent: false,
        email_error: 'RESEND_API_KEY not set in Vercel environment variables',
      })
    }

    try {
      const normOrder = {
        customer_name:  customer_name  ?? 'Valued Customer',
        customer_email,
        design_type:    design_type    ?? '',
        description:    description    ?? '',
        occasion:       occasion       ?? '',
      }

      const result = await resend.emails.send({
        from:    'Meena Rajwada <noreply@meenarajwada.com>',
        to:      customer_email,
        replyTo: 'support@meenarajwada.com',
        subject: `Your Custom Jewellery Quote from Meena Rajwada ✨`,
        html:    quoteEmailHtml(normOrder, Number(quoted_price)),
      })

      if ((result as any).error) {
        const emailError = (result as any).error.message ?? 'Email provider error'
        console.error('Quote email error:', emailError)
        return res.status(200).json({ success: true, email_sent: false, email_error: emailError })
      }

      console.log('Quote email sent to', customer_email)
      return res.status(200).json({ success: true, email_sent: true })
    } catch (err: any) {
      console.error('Quote email exception:', err.message)
      return res.status(200).json({ success: true, email_sent: false, email_error: err.message })
    }
  }

  // ── Action: mark contact message read/unread ─────────────────
  if (action === 'mark_read') {
    const { id, is_read } = req.body
    if (!id) return res.status(400).json({ error: 'Missing message id' })

    const { error: dbErr } = await supabase
      .from('contact_messages')
      .update({ is_read: Boolean(is_read) })
      .eq('id', id)

    if (dbErr) {
      console.error('DB mark-read error:', dbErr)
      return res.status(500).json({ error: dbErr.message })
    }

    return res.status(200).json({ success: true })
  }

  // ── Action: delete custom order ─────────────────────────────
  if (action === 'delete_order') {
    const { id } = req.body
    if (!id) return res.status(400).json({ error: 'Missing order id' })

    const { error: dbErr } = await supabase
      .from('custom_order_requests')
      .delete()
      .eq('id', id)

    if (dbErr) {
      console.error('DB delete error:', dbErr)
      return res.status(500).json({ error: dbErr.message })
    }

    return res.status(200).json({ success: true })
  }

  // ── Action: sync hero slide from product ─────────────────────
  if (action === 'sync_hero_slide') {
    const { product, enable } = req.body
    if (!product) return res.status(400).json({ error: 'Missing product' })

    const slug = product.slug || (product.name ?? '').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    const ctaUrl = `/product/${slug}`

    if (enable) {
      const imageUrl = product.images?.[0] ?? ''
      const { data: existing } = await supabase
        .from('hero_slides').select('id').eq('cta_url', ctaUrl).maybeSingle()

      if (existing) {
        const { error } = await supabase.from('hero_slides').update({
          title: product.name, subtitle: product.material ?? '',
          image_url: imageUrl, is_active: true,
        }).eq('id', existing.id)
        if (error) return res.status(500).json({ error: error.message })
      } else {
        const { error } = await supabase.from('hero_slides').insert({
          title: product.name, subtitle: product.material ?? '',
          image_url: imageUrl, cta_text: 'Shop Now', cta_url: ctaUrl,
          display_order: 99, is_active: true,
        })
        if (error) return res.status(500).json({ error: error.message })
      }
    } else {
      const { error } = await supabase.from('hero_slides').delete().eq('cta_url', ctaUrl)
      if (error) return res.status(500).json({ error: error.message })
    }

    return res.status(200).json({ success: true })
  }

  return res.status(400).json({ error: 'Unknown action' })
}
