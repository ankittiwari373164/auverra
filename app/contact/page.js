'use client'
import { useState } from 'react'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Mail, MapPin, Phone, Clock, MessageCircle } from 'lucide-react'
import { toast } from 'sonner'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    setLoading(false)
    if (res.ok) { toast.success('Message sent. We\'ll respond within 24 hours.'); setForm({ name: '', email: '', subject: '', message: '' }) }
    else toast.error('Failed to send')
  }

  return (
    <div className="min-h-screen bg-obsidian">
      <Navbar />
      <div className="pt-32 pb-20">
        <div className="container-lux">
          <div className="text-center mb-16">
            <div className="divider-gold w-24 mx-auto mb-6" />
            <span className="text-[10px] uppercase tracking-[0.4em] text-gold mb-4 block">Client Services</span>
            <h1 className="text-5xl md:text-7xl font-serif text-gradient-gold mb-4">Get in Touch</h1>
            <p className="text-platinum-light/60 max-w-xl mx-auto">Our concierge team is available to assist with private consultations, custom orders, and after-sales service.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-12">
            <div className="space-y-8">
              {[
                { icon: MessageCircle, title: 'WhatsApp', body: 'Click to Message', sub: 'Fastest response, direct chat', href: 'https://wa.me/919769510661' },
                { icon: Mail, title: 'Email', body: 'concierge@auverra.com', sub: 'Response within 24 hours' },
                { icon: Phone, title: 'Telephone', body: '+91 97695 10661', sub: 'Mon-Sat, 10 AM - 8 PM IST' },
                { icon: MapPin, title: 'Flagship Boutique', body: 'Musafir Khana, Mumbai 400001', sub: 'By appointment' },
                { icon: Clock, title: 'Concierge Hours', body: '10 AM – 8 PM, Mon–Sat', sub: 'Closed Sundays' },
              ].map((c, i) => {
                const Wrapper = c.href ? 'a' : 'div'
                const wrapperProps = c.href ? { href: c.href, target: '_blank', rel: 'noopener noreferrer' } : {}
                return (
                  <Wrapper key={i} {...wrapperProps} className="flex gap-4 group">
                    <div className="w-12 h-12 border border-gold/30 flex items-center justify-center flex-shrink-0 group-hover:bg-gold/10 transition"><c.icon className="w-5 h-5 text-gold" /></div>
                    <div>
                      <div className="text-xs uppercase tracking-[0.25em] text-gold mb-1">{c.title}</div>
                      <div className={`font-serif text-lg ${c.href ? 'text-gold group-hover:underline' : 'text-platinum-light'}`}>{c.body}</div>
                      <div className="text-xs text-platinum-light/50 mt-1">{c.sub}</div>
                    </div>
                  </Wrapper>
                )
              })}
            </div>

            <form onSubmit={submit} className="glass border border-gold/20 p-8 md:p-10 rounded-sm space-y-5">
              <h2 className="font-serif text-2xl text-gold mb-4">Send us a message</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input required placeholder="Full Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="bg-obsidian-700 border border-gold/20 px-4 py-3 text-sm outline-none focus:border-gold" />
                <input required type="email" placeholder="Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="bg-obsidian-700 border border-gold/20 px-4 py-3 text-sm outline-none focus:border-gold" />
              </div>
              <input required placeholder="Subject" value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} className="w-full bg-obsidian-700 border border-gold/20 px-4 py-3 text-sm outline-none focus:border-gold" />
              <textarea required rows={6} placeholder="Your message..." value={form.message} onChange={e => setForm({...form, message: e.target.value})} className="w-full bg-obsidian-700 border border-gold/20 px-4 py-3 text-sm outline-none focus:border-gold resize-none" />
              <button disabled={loading} className="btn-gold w-full">{loading ? 'Sending...' : 'Send Message'}</button>
            </form>
          </div>

          <div className="mt-16 glass border border-gold/20 rounded-sm p-10 text-center">
            <h3 className="font-serif text-2xl md:text-3xl text-gradient-gold mb-3">Join Our WhatsApp Community</h3>
            <p className="text-platinum-light/60 max-w-lg mx-auto mb-6">Get instant updates on the latest stock, new arrivals, and exclusive offers. Tap below to join our WhatsApp community now.</p>
            <a href="https://chat.whatsapp.com/LCzcmWbEi4tHFWaTnK9hkG" target="_blank" rel="noopener noreferrer" className="btn-gold inline-flex items-center gap-2"><MessageCircle className="w-4 h-4" /> Join Now</a>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}