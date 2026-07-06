'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { useApp } from '@/app/providers'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { User, Lock, Palette, Sun, Moon } from 'lucide-react'

const inputCls = "w-full bg-obsidian-700 border border-gold/20 px-3 py-2 text-sm outline-none focus:border-gold text-platinum-light"
const labelCls = "text-xs uppercase tracking-widest text-gold mb-1 block"

export default function SettingsPage() {
  const { user, loading, refreshUser, theme, setTheme } = useApp() || {}
  const [name, setName] = useState('')
  const [savingName, setSavingName] = useState(false)
  const [pw, setPw] = useState({ password: '', confirm: '' })
  const [savingPw, setSavingPw] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) router.push('/login?redirect=/account/settings')
    if (user) setName(user.name || '')
  }, [user, loading])

  const saveName = async (e) => {
    e.preventDefault()
    setSavingName(true)
    const res = await fetch('/api/account/profile', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }) })
    setSavingName(false)
    if (res.ok) { toast.success('Profile updated'); refreshUser?.() } else toast.error('Failed to update profile')
  }

  const savePassword = async (e) => {
    e.preventDefault()
    if (pw.password.length < 6) return toast.error('Password must be at least 6 characters')
    if (pw.password !== pw.confirm) return toast.error('Passwords do not match')
    setSavingPw(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password: pw.password })
    setSavingPw(false)
    if (error) toast.error(error.message)
    else { toast.success('Password updated'); setPw({ password: '', confirm: '' }) }
  }

  if (loading || !user) return <div className="min-h-screen bg-obsidian flex items-center justify-center"><div className="text-gold">Loading...</div></div>

  return (
    <div className="min-h-screen bg-obsidian">
      <Navbar />
      <div className="pt-32 pb-24">
        <div className="container-lux max-w-2xl mx-auto">
          <div className="mb-12">
            <div className="text-[10px] uppercase tracking-[0.4em] text-gold mb-3">Your Account</div>
            <h1 className="text-4xl md:text-5xl font-serif text-gradient-gold">Settings</h1>
          </div>

          <div className="space-y-6">
            <div className="glass border border-gold/15 p-8 rounded-sm">
              <div className="flex items-center gap-3 mb-6"><User className="w-5 h-5 text-gold" /><h3 className="font-serif text-xl text-platinum-light">Profile Information</h3></div>
              <form onSubmit={saveName} className="space-y-4">
                <div><label className={labelCls}>Display Name</label><input value={name} onChange={e => setName(e.target.value)} className={inputCls} /></div>
                <div><label className={labelCls}>Email</label><input disabled value={user.email} className={inputCls + ' opacity-50'} /></div>
                <button disabled={savingName} className="btn-outline-gold text-sm">{savingName ? 'Saving...' : 'Save Profile'}</button>
              </form>
            </div>

            <div className="glass border border-gold/15 p-8 rounded-sm">
              <div className="flex items-center gap-3 mb-6"><Lock className="w-5 h-5 text-gold" /><h3 className="font-serif text-xl text-platinum-light">Change Password</h3></div>
              <form onSubmit={savePassword} className="space-y-4">
                <div><label className={labelCls}>New Password</label><input type="password" value={pw.password} onChange={e => setPw(p => ({ ...p, password: e.target.value }))} className={inputCls} placeholder="At least 6 characters" /></div>
                <div><label className={labelCls}>Confirm Password</label><input type="password" value={pw.confirm} onChange={e => setPw(p => ({ ...p, confirm: e.target.value }))} className={inputCls} /></div>
                <button disabled={savingPw} className="btn-outline-gold text-sm">{savingPw ? 'Updating...' : 'Update Password'}</button>
              </form>
            </div>

            <div className="glass border border-gold/15 p-8 rounded-sm">
              <div className="flex items-center gap-3 mb-6"><Palette className="w-5 h-5 text-gold" /><h3 className="font-serif text-xl text-platinum-light">Appearance</h3></div>
              <p className="text-sm text-platinum-light/60 mb-5">Choose how Auverra looks on your device.</p>
              <div className="flex gap-3">
                <button onClick={() => setTheme?.('dark')} className={`flex-1 flex items-center justify-center gap-2 p-4 border rounded-sm transition ${theme === 'dark' ? 'border-gold bg-gold/10 text-gold' : 'border-gold/20 text-platinum-light/60 hover:border-gold/40'}`}>
                  <Moon className="w-4 h-4" /> Dark
                </button>
                <button onClick={() => setTheme?.('light')} className={`flex-1 flex items-center justify-center gap-2 p-4 border rounded-sm transition ${theme === 'light' ? 'border-gold bg-gold/10 text-gold' : 'border-gold/20 text-platinum-light/60 hover:border-gold/40'}`}>
                  <Sun className="w-4 h-4" /> Light
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
