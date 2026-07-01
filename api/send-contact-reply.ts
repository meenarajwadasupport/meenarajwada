import type { VercelRequest, VercelResponse } from '@vercel/node'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY!)

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const { name, email, subject, message } = req.body
  if (!name || !email || !message) return res.status(400).json({ error: 'Missing fields' })

  try {
    await resend.emails.send({
      from: 'Meena Rajwada <noreply@meenarajwada.com>',
      to: email,
      replyTo: 'muakhhir@gmail.com',
      subject: `We received your message ✨`,
      html: `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#fdf8f5;font-family:Georgia,serif;">
  <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.07);">

    <!-- Header -->
    <div style="background:#7D1935;padding:28px 24px;text-align:center;">
      <p style="margin:0 0 4px;font-size:10px;letter-spacing:4px;color:rgba(255,255,255,0.7);text-transform:uppercase;">Meena Rajwada</p>
      <h1 style="margin:0;font-size:22px;color:#fff;font-weight:600;">Thank you for reaching out 💌</h1>
    </div>

    <!-- Body -->
    <div style="padding:28px 24px;">
      <p style="margin:0 0 16px;font-size:14px;color:#2a1a10;">Dear <strong>${name}</strong>,</p>
      <p style="margin:0 0 20px;font-size:14px;color:#555;line-height:1.6;">We've received your message and will get back to you within <strong>24 hours</strong>.</p>

      <!-- Their message -->
      <div style="background:#fdf8f5;border-left:3px solid #7D1935;border-radius:0 8px 8px 0;padding:14px 18px;margin-bottom:24px;">
        <p style="margin:0 0 6px;font-size:10px;color:#888;letter-spacing:2px;text-transform:uppercase;">Your message</p>
        <p style="margin:0;font-size:13px;color:#555;line-height:1.6;font-style:italic;">"${message}"</p>
      </div>

      <p style="margin:0 0 8px;font-size:13px;color:#555;">In the meantime, you can also reach us on WhatsApp for a faster response.</p>
      <p style="margin:0 0 24px;font-size:14px;color:#2a1a10;">With love,<br/><strong>Meena Rajwada</strong> 💎</p>
    </div>

    <!-- Footer -->
    <div style="background:#fdf8f5;padding:16px 24px;text-align:center;border-top:1px solid #f0e8e0;">
      <p style="margin:0;font-size:11px;color:#aaa;">© 2025 Meena Rajwada · meenarajwada.com</p>
    </div>

  </div>
</body>
</html>`,
    })

    return res.status(200).json({ success: true })
  } catch (err: any) {
    return res.status(500).json({ error: err.message })
  }
}
