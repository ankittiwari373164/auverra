'use client'
import Link from 'next/link'
import { Instagram, Twitter, Facebook, Youtube, Mail } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

export function Footer() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const subscribe = async (e) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    try {
      const res = await fetch('/api/newsletter', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) })
      if (res.ok) { toast.success('Welcome to the Auverra circle.'); setEmail('') }
      else toast.error('Subscription failed')
    } catch { toast.error('Try again later') }
    setLoading(false)
  }

  return (
    <footer className="relative bg-obsidian-900 border-t border-gold/10 pt-20 pb-8 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-40" style={{ background: 'radial-gradient(ellipse at top, rgba(201,169,97,0.08) 0%, transparent 50%)' }} />
      <div className="container-lux relative">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="divider-gold w-24 mx-auto mb-6" />
          <h3 className="text-3xl md:text-4xl font-serif mb-4 text-gradient-gold">Join the Auverra Circle</h3>
          <p className="text-platinum-light/60 mb-8">Receive early access to limited editions, private events, and the stories behind each timepiece.</p>
          <form onSubmit={subscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input value={email} onChange={e => setEmail(e.target.value)} type="email" required placeholder="your@email.com" className="flex-1 bg-obsidian-700/50 border border-gold/20 px-4 py-3 text-sm outline-none focus:border-gold text-platinum-light placeholder:text-platinum-light/40 transition" />
            <button disabled={loading} className="btn-gold">{loading ? '...' : 'Subscribe'}</button>
          </form>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 pt-12 border-t border-gold/10">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <img src="/logo.svg" alt="Auverra Watches" className="w-9 h-9" />
              <div className="text-2xl font-serif font-bold tracking-[0.2em] text-gradient-gold">AUVERRA</div>
            </div>
            <p className="text-platinum-light/50 text-sm leading-relaxed">Handcrafted luxury timepieces for those who appreciate exceptional artistry. Since 1897.</p>
            <div className="flex gap-4 mt-6">
              {[Instagram, Twitter, Facebook, Youtube].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 border border-gold/20 flex items-center justify-center hover:bg-gold hover:text-obsidian transition-all duration-300 hover:-translate-y-1"><Icon className="w-4 h-4" /></a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-serif text-gold mb-4 text-sm uppercase tracking-[0.2em]">Collections</h4>
            <ul className="space-y-3 text-sm text-platinum-light/60">
              <li><Link href="/shop?category=chronograph" className="hover:text-gold transition">Chronographs</Link></li>
              <li><Link href="/shop?category=dress" className="hover:text-gold transition">Dress Watches</Link></li>
              <li><Link href="/shop?category=diver" className="hover:text-gold transition">Diver Watches</Link></li>
              <li><Link href="/shop?category=tourbillon" className="hover:text-gold transition">Tourbillons</Link></li>
              <li><Link href="/shop?category=ladies" className="hover:text-gold transition">Ladies Collection</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-serif text-gold mb-4 text-sm uppercase tracking-[0.2em]">Support</h4>
            <ul className="space-y-3 text-sm text-platinum-light/60">
              <li><Link href="/contact" className="hover:text-gold transition">Contact Us</Link></li>
              <li><Link href="/faq" className="hover:text-gold transition">FAQ</Link></li>
              <li><Link href="/shipping" className="hover:text-gold transition">Shipping & Delivery</Link></li>
              <li><Link href="/returns" className="hover:text-gold transition">Returns & Warranty</Link></li>
              <li><Link href="/care" className="hover:text-gold transition">Watch Care Guide</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-serif text-gold mb-4 text-sm uppercase tracking-[0.2em]">Company</h4>
            <ul className="space-y-3 text-sm text-platinum-light/60">
              <li><Link href="/about" className="hover:text-gold transition">Our Story</Link></li>
              <li><Link href="/craftsmanship" className="hover:text-gold transition">Craftsmanship</Link></li>
              <li><Link href="/boutiques" className="hover:text-gold transition">Boutiques</Link></li>
              <li><Link href="/privacy" className="hover:text-gold transition">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-gold transition">Terms & Conditions</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-gold/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-platinum-light/40">
          <div>&copy; {new Date().getFullYear()} Auverra Watches. Crafted with obsessive precision.</div>
          <div className="flex gap-6">
            <span>Swiss Made</span><span>•</span><span>2-Year International Warranty</span><span>•</span><span>Free Insured Delivery</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
