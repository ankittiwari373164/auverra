// Sends transactional emails via your own Hostinger business mailbox over
// SMTP — no third-party email service (Resend, SendGrid, etc.) involved.
//
// Requires these in your environment:
//   HOSTINGER_EMAIL=orders@auverrawatches.in
//   HOSTINGER_EMAIL_PASSWORD=your mailbox password (from hPanel → Emails)
//   HOSTINGER_SMTP_HOST=smtp.hostinger.com   (default, usually no need to set)
//   HOSTINGER_SMTP_PORT=465                  (default, usually no need to set)
//
// If not configured, sendEmail silently no-ops (logs a warning) so the rest
// of the app keeps working — you just won't get emails sent until you add
// real credentials.

import nodemailer from 'nodemailer'

let transporter = null
function getTransporter() {
  if (transporter) return transporter
  const user = process.env.HOSTINGER_EMAIL
  const pass = process.env.HOSTINGER_EMAIL_PASSWORD
  if (!user || !pass) return null
  transporter = nodemailer.createTransport({
    host: process.env.HOSTINGER_SMTP_HOST || 'smtp.hostinger.com',
    port: Number(process.env.HOSTINGER_SMTP_PORT || 465),
    secure: true, // true for port 465
    auth: { user, pass },
  })
  return transporter
}

export async function sendEmail({ to, subject, html }) {
  const t = getTransporter()
  if (!t) {
    console.warn('[email] HOSTINGER_EMAIL / HOSTINGER_EMAIL_PASSWORD not set — skipping email to', to)
    return { skipped: true }
  }
  try {
    const info = await t.sendMail({
      from: `"Auverra Watches" <${process.env.HOSTINGER_EMAIL}>`,
      to, subject, html,
    })
    return { id: info.messageId }
  } catch (err) {
    console.error('[email] Failed to send via Hostinger SMTP:', err.message)
    return { error: err.message }
  }
}

function itemsTable(order) {
  return (order.items || []).map(it => `
    <tr>
      <td style="padding:8px 0;color:#1a1a1e;">${it.name}${it.variant?.dial?.name ? ` — ${it.variant.dial.name}` : ''}</td>
      <td style="padding:8px 0;text-align:center;color:#1a1a1e;">${it.quantity}</td>
      <td style="padding:8px 0;text-align:right;color:#1a1a1e;">₹${(it.price * it.quantity).toLocaleString('en-IN')}</td>
    </tr>`).join('')
}

export function orderConfirmedEmailHtml(order) {
  return `
  <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;background:#faf7f0;padding:32px;">
    <h1 style="color:#b48e40;font-size:24px;margin-bottom:4px;">Auverra Watches</h1>
    <p style="color:#1a1a1e;font-size:16px;">Your order <strong>${order.orderId}</strong> has been confirmed! 🎉</p>
    <p style="color:#555;font-size:14px;">We've verified your payment and your order is now being prepared for dispatch.</p>
    <table style="width:100%;border-collapse:collapse;margin:24px 0;">
      <thead><tr style="border-bottom:1px solid #d9cba3;"><th style="text-align:left;padding-bottom:8px;color:#b48e40;font-size:12px;text-transform:uppercase;">Product</th><th style="text-align:center;padding-bottom:8px;color:#b48e40;font-size:12px;text-transform:uppercase;">Qty</th><th style="text-align:right;padding-bottom:8px;color:#b48e40;font-size:12px;text-transform:uppercase;">Total</th></tr></thead>
      <tbody>${itemsTable(order)}</tbody>
    </table>
    <div style="border-top:1px solid #d9cba3;padding-top:12px;text-align:right;color:#1a1a1e;font-size:16px;font-weight:bold;">
      Total: ₹${Number(order.total).toLocaleString('en-IN')}
    </div>
    <p style="color:#555;font-size:13px;margin-top:32px;">Questions about your order? Message us directly on <a href="https://wa.me/912249001897" style="color:#b48e40;">WhatsApp</a>.</p>
    <p style="color:#999;font-size:12px;margin-top:24px;">Thank you for shopping with Auverra Watches.</p>
  </div>`
}

export function orderRejectedEmailHtml(order) {
  return `
  <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;background:#faf7f0;padding:32px;">
    <h1 style="color:#b48e40;font-size:24px;margin-bottom:4px;">Auverra Watches</h1>
    <p style="color:#1a1a1e;font-size:16px;">We couldn't verify the payment for order <strong>${order.orderId}</strong>.</p>
    <p style="color:#555;font-size:14px;">This can happen if the transaction reference or screenshot didn't match, or the payment wasn't received. Please reach out to us on <a href="https://wa.me/912249001897" style="color:#b48e40;">WhatsApp</a> with your payment details so we can help sort this out — or feel free to re-place your order.</p>
    <div style="border-top:1px solid #d9cba3;padding-top:12px;margin-top:20px;text-align:right;color:#1a1a1e;font-size:16px;font-weight:bold;">
      Order Total: ₹${Number(order.total).toLocaleString('en-IN')}
    </div>
    <p style="color:#999;font-size:12px;margin-top:24px;">Auverra Watches</p>
  </div>`
}