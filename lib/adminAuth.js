// Admin login is now fully independent of Supabase — credentials live in
// environment variables (ADMIN_USERNAME, ADMIN_PASSWORD), and a signed,
// httpOnly cookie tracks the logged-in admin session. This has nothing to
// do with customer accounts.
import crypto from 'crypto'

const COOKIE_NAME = 'auverra_admin_session'
const SESSION_DAYS = 7

function secret() {
  // Falls back to hashing the admin password if a dedicated secret isn't
  // set, so this works with just ADMIN_USERNAME/ADMIN_PASSWORD configured.
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || 'change-me'
}

export function createAdminToken() {
  const expires = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000
  const payload = `admin.${expires}`
  const sig = crypto.createHmac('sha256', secret()).update(payload).digest('hex')
  return `${payload}.${sig}`
}

export function verifyAdminToken(token) {
  if (!token) return false
  const parts = token.split('.')
  if (parts.length !== 3) return false
  const [tag, expiresStr, sig] = parts
  if (tag !== 'admin') return false
  const expires = Number(expiresStr)
  if (!expires || Date.now() > expires) return false
  const expectedSig = crypto.createHmac('sha256', secret()).update(`admin.${expiresStr}`).digest('hex')
  try {
    return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))
  } catch { return false }
}

export function checkAdminCredentials(username, password) {
  const validUser = process.env.ADMIN_USERNAME
  const validPass = process.env.ADMIN_PASSWORD
  if (!validUser || !validPass) return false
  return username === validUser && password === validPass
}

export { COOKIE_NAME as ADMIN_COOKIE_NAME }