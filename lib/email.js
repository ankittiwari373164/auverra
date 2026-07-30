// Sends transactional emails via Resend (https://resend.com).
// Requires RESEND_API_KEY and RESEND_FROM_EMAIL in your environment.
// If not configured, sendEmail silently no-ops (logs a warning) so the rest
// of the app keeps working — you just won't get emails sent until you add
// real credentials.

export async function sendEmail({ to, subject, html }) {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.RESEND_FROM_EMAIL
  if (!apiKey || !from) {
    console.warn('[email] RESEND_API_KEY / RESEND_FROM_EMAIL not set — skipping email to', to)
    return { skipped: true }
  }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ from, to, subject, html }),
    })
    if (!res.ok) {
      const err = await res.text()
      console.error('[email] Resend API error:', err)
      return { error: err }
    }
    return await res.json()
  } catch (err) {
    console.error('[email] Failed to send:', err.message)
    return { error: err.message }
  }
}

export function orderConfirmedEmailHtml(order) {
  const itemsRows = (order.items || []).map(it => `
    <tr>
      <td style="padding:8px 0;color:#1a1a1e;">${it.name}${it.variant?.dial?.name ? ` — ${it.variant.dial.name}` : ''}</td>
      <td style="padding:8px 0;text-align:center;color:#1a1a1e;">${it.quantity}</td>
      <td style="padding:8px 0;text-align:right;color:#1a1a1e;">₹${(it.price * it.quantity).toLocaleString('en-IN')}</td>
    </tr>`).join('')

  return `
  <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;background:#faf7f0;padding:32px;">
    <h1 style="color:#b48e40;font-size:24px;margin-bottom:4px;">Auverra Watches</h1>
    <p style="color:#1a1a1e;font-size:16px;">Your order <strong>${order.orderId}</strong> has been confirmed! 🎉</p>
    <p style="color:#555;font-size:14px;">We've verified your payment and your order is now being prepared for dispatch. You'll pay the remaining cash amount on delivery.</p>
    <table style="width:100%;border-collapse:collapse;margin:24px 0;">
      <thead><tr style="border-bottom:1px solid #d9cba3;"><th style="text-align:left;padding-bottom:8px;color:#b48e40;font-size:12px;text-transform:uppercase;">Product</th><th style="text-align:center;padding-bottom:8px;color:#b48e40;font-size:12px;text-transform:uppercase;">Qty</th><th style="text-align:right;padding-bottom:8px;color:#b48e40;font-size:12px;text-transform:uppercase;">Total</th></tr></thead>
      <tbody>${itemsRows}</tbody>
    </table>
    <div style="border-top:1px solid #d9cba3;padding-top:12px;text-align:right;color:#1a1a1e;font-size:16px;font-weight:bold;">
      Total: ₹${Number(order.total).toLocaleString('en-IN')}
    </div>
    <p style="color:#555;font-size:13px;margin-top:32px;">Questions about your order? Message us directly on <a href="https://wa.me/912249001897" style="color:#b48e40;">WhatsApp</a>.</p>
    <p style="color:#999;font-size:12px;margin-top:24px;">Thank you for shopping with Auverra Watches.</p>
  </div>`
}