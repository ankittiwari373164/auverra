'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { useApp } from '@/app/providers'
import { toast } from 'sonner'
import { Mail, Lock, User, ArrowRight } from 'lucide-react'

export default function SignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { refreshUser } = useApp() || {}

  const submit = async (e) => {
    e.preventDefault()
    if (password.length < 6) return toast.error('Password must be at least 6 characters')
    setLoading(true)
    const res = await fetch('/api/auth/signup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password, name }) })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { toast.error(data.error || 'Signup failed'); return }
    toast.success('Account created. Welcome to Auverra.')
    await refreshUser?.()
    router.push('/')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-obsidian">
      <Navbar />
      <div className="pt-32 pb-20 min-h-screen flex items-center">
        <div className="container-lux">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-10">
              <div className="divider-gold w-24 mx-auto mb-6" />
              <h1 className="text-4xl md:text-5xl font-serif text-gradient-gold mb-3">Join the Circle</h1>
              <p className="text-platinum-light/60">Create your Auverra account</p>
            </div>
            <form onSubmit={submit} className="glass border border-gold/20 p-8 md:p-10 rounded-sm space-y-5">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-[0.25em] text-gold">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gold/60" />
                  <input required value={name} onChange={e => setName(e.target.value)} className="w-full bg-obsidian-700 border border-gold/20 pl-10 pr-4 py-3 text-sm outline-none focus:border-gold" placeholder="Your name" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-[0.25em] text-gold">Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gold/60" />
                  <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-obsidian-700 border border-gold/20 pl-10 pr-4 py-3 text-sm outline-none focus:border-gold" placeholder="you@example.com" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-[0.25em] text-gold">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gold/60" />
                  <input required type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-obsidian-700 border border-gold/20 pl-10 pr-4 py-3 text-sm outline-none focus:border-gold" placeholder="At least 6 characters" />
                </div>
              </div>
              <button disabled={loading} className="btn-gold w-full inline-flex items-center justify-center gap-2">
                {loading ? 'Creating account...' : <>Create Account <ArrowRight className="w-4 h-4" /></>}
              </button>
              <div className="text-center text-sm text-platinum-light/60">
                Already a member? <Link href="/login" className="text-gold hover:underline">Sign in</Link>
              </div>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
