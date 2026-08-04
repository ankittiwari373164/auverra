'use client'
import Link from 'next/link'
import { Instagram, Twitter, Facebook, Youtube, MessageCircle } from 'lucide-react'

const WHATSAPP_NUMBER = '912249001897'
const WHATSAPP_MESSAGE = "Hi Auverra Watches! I'd like to join your WhatsApp community for updates on new arrivals and offers."
const WHATSAPP_JOIN_LINK = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`

export function Footer() {
  return (
    <footer className="relative bg-obsidian-900 border-t border-gold/10 pt-20 pb-8 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-40" style={{ background: 'radial-gradient(ellipse at top, rgba(201,169,97,0.08) 0%, transparent 50%)' }} />
      <div className="container-lux relative">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="divider-gold w-24 mx-auto mb-6" />
          <h3 className="text-3xl md:text-4xl font-serif mb-4 text-gradient-gold">Join the Auverra Circle</h3>
          <p className="text-platinum-light/60 mb-8">Get instant updates on new arrivals, exclusive offers, and the stories behind each timepiece — straight to your WhatsApp.</p>
          <a href={WHATSAPP_JOIN_LINK} target="_blank" rel="noopener noreferrer" className="btn-gold inline-flex items-center gap-2"><MessageCircle className="w-4 h-4" /> Join Our WhatsApp Community</a>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-10 pt-12 border-t border-gold/10">
          <div className="col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <img src="/logo.png" alt="Auverra Watches" className="w-14 h-14" />
              <div className="text-2xl font-serif font-bold tracking-[0.2em] text-gradient-gold"></div>
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
              <li><Link href="/returns" className="hover:text-gold transition">Exchange & Refund Policy</Link></li>
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
          <div>
            <h4 className="font-serif text-gold mb-4 text-sm uppercase tracking-[0.2em]">Shop by City</h4>
            <ul className="space-y-3 text-sm text-platinum-light/60">
              {['Mumbai', 'Delhi', 'Bangalore', 'Pune', 'Hyderabad', 'Chandigarh'].map(c => (
                <li key={c}><Link href="/shop" className="hover:text-gold transition">Watches in {c}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-serif text-gold mb-4 text-sm uppercase tracking-[0.2em]">Shop by Price</h4>
            <ul className="space-y-3 text-sm text-platinum-light/60">
              <li><Link href="/shop?maxPrice=2000" className="hover:text-gold transition">Under ₹2,000</Link></li>
              <li><Link href="/shop?maxPrice=5000" className="hover:text-gold transition">Under ₹5,000</Link></li>
              <li><Link href="/shop?maxPrice=10000" className="hover:text-gold transition">Under ₹10,000</Link></li>
              <li><Link href="/shop?maxPrice=20000" className="hover:text-gold transition">Under ₹20,000</Link></li>
              <li><Link href="/shop?category=ladies" className="hover:text-gold transition">Watches for Women</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-gold/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-platinum-light/40">
          <div>&copy; {new Date().getFullYear()} Auverra Watches. Crafted with obsessive precision.</div>
          <div className="flex flex-wrap gap-6 items-center justify-center">
            <span>Cash on Delivery Available</span><span>•</span><span>Free Insured Delivery</span><span>•</span>
            <a href={WHATSAPP_JOIN_LINK} target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">Join our WhatsApp Community →</a>
          </div>
        </div>
      </div>
    </footer>
  )
}